const EWillBase = require('./e-will-base.js').EWillBase;
const BN = require('bn.js');

class EWillProviders extends EWillBase {
  // Public functions
  constructor() {
    super(EWillConfig.gethUrl);
  }

  configure() {
    const contracts = {
      ewPlatform : {
        abi: 'static/abi-platform.json',
        address: EWillConfig.contractPlatformAddress
      },
      ewEscrow : {
        abi: 'static/abi-escrow.json',
        address: EWillConfig.contractEscrowAddress
      }
    };
    return super._configureContracts(contracts);
  }

  getActiveProviders() {
    const promise = this.ewEscrow.getPastEvents('Activated', { fromBlock: '0x1' }).then( (events) => {
      return this._requestValidProviders(events.map( ev => ev.returnValues.provider ));
    }).then( (providersInfo) => {
      const promises = providersInfo.map( (providerInfo) => {
        const info = new BN(providerInfo.info, 10);
        const promise = this.jsonRequest(`${EWillConfig.swarmUrl}/bzz:/${info.toString('hex')}/`).then( (extraInfo) => {
          return Promise.resolve({
            info: providerInfo,
            extraInfo
          });
        });
        return promise;
      });
      return Promise.all(promises);
    }).then( (providersInfo) => {
      this._providers = providersInfo;
      return Promise.resolve(providersInfo);
    }).catch( (err) => {
      console.error(`Failed to obtain an active providers list: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });

    return promise;
  }

  // Accessors
  get providers() {
    return this._providers.slice();
  }

  // Protected functions
  _configureContracts() {
    return Promise.resolve('');
  }

  _requestValidProviders(addresses) {
    const promises = addresses.map( (addr) => {
      return this.ewEscrow.methods.isProviderValid(addr).call().then( (isValid) => {
        return isValid ? this.ewEscrow.methods.providers(addr).call() : Promise.resolve({ invalid: true });
      });
    });
    const promise = Promise.all(promises).then( (providersInfo) => {
      return Promise.resolve(providersInfo.filter( pi => !pi.invalid ));
    });
    return promise;
  }
}

window.EWillProviders = EWillProviders;
