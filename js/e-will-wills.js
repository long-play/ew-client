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

  prolongWill(willId) {
    return Promise.resolve(`Prolonged the will with willId: ${willId}`);
  }

  deleteWill(willId) {
    let promise = Promise.reject(`Failed to find a will with willId: ${willId}`);
    const position = this._wills.findIndex( (e) => e.willId == willId );

    if (position !== -1) {
      const deleteWillMethod = this.ewPlatform.methods.deleteWill(willId);
      promise = deleteWillMethod.estimateGas({ from: this._userAccount.address })
      .then( (gasLimit) => {
        const payload = deleteWillMethod.encodeABI();
        console.log(payload);

        rawTx = {
          to: this.ewPlatform.options.address,
          data: payload,
          value: 0,
          gasLimit: gasLimit,
          chainId: EWillConfig.chainID
        };
        return this._userAccount.signTransaction(rawTx);
      }).then( (tx) => {
        return this._sendTx(tx);
      });

      this._wills.splice(position, 1);
    }

    return promise;
  }

  // Accessors
  get wills() {
    return this._wills.slice();
  }

  // Private functions
  _sendTx(tx) {
    const promise = new Promise( (resolve, reject) => {
      // send the transaction to the network
      const defer = this._web3.eth.sendSignedTransaction(tx);
      defer.once('transactionHash', (txId) => {
        console.log(`Tx created: ${txId}`);
        resolve(txId);
      });
      defer.once('receipt', (receipt) => {
        console.log(`Tx receipt received: ${ JSON.stringify(receipt) }`);
      });
      defer.once('confirmation', (count, receipt) => {
        console.log(`Tx comfirmed ${count} times`);
      });
      defer.once('error', (err) => {
        console.error(`Failed to submit the will tx: ${ JSON.stringify(err) }`);
        reject(err);
      });
    });

    return promise;
  }
}

window.EWillWills = EWillWills;
