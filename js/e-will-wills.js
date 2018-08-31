const EWillBase = require('./e-will-base.js').EWillBase;
const BN = require('bn.js');

class EWillWills extends EWillBase {
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

  getUserWills() {
    const wills = [];

    const promise = this.ewPlatform.methods.numberOfUserWills(this._userAccount.address).call().then( (numberOfWills) => {
      const promises = [];

      for (let idx = 0; idx < numberOfWills; idx++) {
        const promise = this.ewPlatform.methods.userWills(
          this._userAccount.address,
          idx
        ).call().then( (willId) => {
          return this.ewPlatform.methods.wills(willId).call();
        }).then( (will) => {
          const denominatedAF = (new BN(will.annualFee)).div(new BN('1000000000000000'));
          const annualFee = denominatedAF.divmod(new BN(1000), '', false);
          will.annualFeeFmtd = `${annualFee.div.toString()}.${annualFee.mod.toString()}`;
          wills.push(will);
        });
        promises.push(promise);
      }

      return Promise.all(promises);
    }).then( () => {
      this._wills = wills;
      return Promise.resolve(wills);
    }).catch( (err) => {
      console.error(`Failed to obtain user's wills: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });

    return promise;
  }

  prolongWill(idx) {
    return Promise.resolve(`Prolonged the will at ${idx}`);
  }

  deleteWill(idx) {
    this._wills.splice(0, 1);
    return Promise.resolve(`Removed the will at ${idx}`);
  }

  // Accessors
  get wills() {
    return this._wills.slice();
  }
}

window.EWillWills = EWillWills;
