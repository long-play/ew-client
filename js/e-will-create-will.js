const EWillBase = require('./e-will-base.js').EWillBase;
const keccak256 = require('js-sha3').keccak256;
const EthUtil = require('ethereumjs-util');
const Crypto = require('wcrypto');
const Tar = require('tar-js');
const BN = require('bn.js');

class EWillCreate extends EWillBase {
  // Public functions
  constructor(query) {
    super(EWillConfig.gethUrl);
    this._qParams = query.slice(1);
    this._templateMeta = {
      poweredBy: 'E-Will Platform',
      version: '1.0'
    };
  }

  configure() {
    const contracts = {
      ewPlatform : {
        abi: 'abi-platform.json',
        address: EWillConfig.contractPlatformAddress
      },
      ewEscrow : {
        abi: 'abi-escrow.json',
        address: EWillConfig.contractEscrowAddress
      }
    };

    const res = super._configureContracts(contracts).then( () => {
      return this._configureProviderParams(this._qParams);
    });

    return res;
  }

  findBeneficiary(address, contacts) {
    const benAddr = new BN(address.slice(2), 16);
    const benBuff = EthUtil.toBuffer(benAddr);
    this._will = {
      beneficiaryAddress: address,
      beneficiaryContacts: contacts,
      beneficiaryAddressHash: new BN(keccak256(benBuff), 16)
    };

    const url = `${EWillConfig.apiUrl}/key/public/address=${address}`;
    const promise = ajaxRequest(url).then( (response) => {
      this._will.beneficiaryPublicKey = response.publicKey;
      return Promise.resolve(this._will);
    }).catch( (err) => {
      console.error(`Failed to find beneficiary: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });

    return promise;
  }

  createBeneficiary(contacts) {
    const benAcc = this._web3.eth.accounts.create();
    const benAddr = new BN(benAcc.address.slice(2), 16);
    const benBuff = EthUtil.toBuffer(benAddr);
    this._will = {
      beneficiaryAddress: benAcc.address,
      beneficiaryContacts: contacts,
      beneficiaryPublicKey: EthUtil.bufferToHex(EthUtil.privateToPublic(benAcc.privateKey)),
      beneficiaryPrivateKey: benAcc.privateKey,
      beneficiaryAddressHash: new BN(keccak256(benBuff), 16)
    };

    return Promise.resolve(this._will);
  }

  requestProviderKey() {
    const data = {
      address: this._userAccount.address,
      will: this._provider.params.will,
      token: this._provider.params.token
    };

    const promise = this.ajaxRequest(`${this._provider.apiUrl}/setup-will`, {
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).then( (response) => {
      //todo: verify signature & willId
      const isSigned = (response.signature == '//todo:');
      if (isSigned !== true) {
        return Promise.reject( /* error */ );
      } else if (this._provider.params.will != response.will) {
        return Promise.reject( /* error */ );
      }

      this._provider.publicKey = response.key;
    }).catch( (err) => {
      console.error(`Failed to obtain provider key: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });

    return promise;
  }

  encryptWillContent(records) {
    this._will.records = records.slice();
    const willTar = new Tar();
    for (let record in records) {
      willTar.append(record, records[record]);
    }

    const willContent = willTar.append('meta.json', JSON.stringify(this._templateMeta));
    const wcrypto = new Crypto.WCrypto();
    const promise = wcrypto.encrypt(willContent,
                    this._userAccount.privateKey,
                    this._will.beneficiaryPublicKey)
    .then( (enc) => {
      const encWillTar = new Tar();
      const meta = Object.assign({
        beneficiaryAddress: this._will.beneficiaryAddress,
        beneficiaryContact: this._will.beneficiaryContacts,
        beneficiaryPublicKey: this._will.beneficiaryPublicKey,
        encryptionIV: enc.iv,
        owner: this._will.beneficiaryAddress
      }, this._templateMeta);

      encWillTar.append('will.encrypted.tar', enc.encrypted);
      const payload = encWillTar.append('meta.json', JSON.stringify(meta));

      return wcrypto.encrypt(payload,
                             this._userAccount.privateKey,
                             this._provider.publicKey);
    }).then( (enc) => {
      const encWillTar = new Tar();
      const meta = Object.assign({
        encryptionIV: enc.iv,
        owner: this._provider.params.address
      }, this._templateMeta);

      encWillTar.append('will.encrypted.x2.tar', enc.encrypted);
      const payload = encWillTar.append('meta.json', JSON.stringify(meta));
      this._will.encrypted = new Uint8Array(payload);

      return Promise.resolve(this._will.records);
    }).catch( (err) => {
      console.error(`Failed to encrypt the will: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });

    return promise;
  }

  createWill() {
    // upload the will into SWARM & generate a transaction
    const url = `${EWillConfig.swarmUrl}/bzz:/`;
    let rawTx = {};
    let createWillMethod = null;
    const promise = this.ajaxRequest(url, {
      method: 'POST',
      contentType: 'application/x-tar',
      data: /*todo: upload binary data*/this._will.encrypted
    }).then( (response) => {
      if (typeof response.error !== 'undefined') {
        return Promise.reject(response.error);
      }

      //todo: check if needs to add 0x at the beggining
      const storageId = response;
      console.log('confirmed the will: ' + storageId);

      // generate & sign the ethereum transaction
      const willId = (new BN(providerParams.address.slice(2), 16)).iushln(96).iadd(new BN(providerParams.will)).toString(16);
      console.log('willId is ' + willId);

      createWillMethod = this.ewPlatform.methods.createWill(
        `0x${willId}`,
        `0x${storageId}`,
        this._will.beneficiaryAddressHash,
        this._provider.params.address);
      return createWillMethod.estimateGas({ from: this._userAccount.address });
    }).then( (gasLimit) => {
      const payload = createWillMethod.encodeABI();
      console.log(payload);

      rawTx = {
        to: this.ewPlatform.options.address,
        data: payload,
        value: 15.0e+18,
        gasLimit: gasLimit,
        chainId: EWillConfig.chainID
      };
      return this._userAccount.signTransaction(tx);
    }).then( (tx) => {
      this._will.signedTx = tx.rawTransaction;
    }).catch( (err) => {
      console.error(`Failed to create the will tx: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });

    return promise;
  }

  submitWill() {
    const promise = new Promise( (resolve, reject) => {
      // send the transaction to the network
      const defer = this._web3.eth.sendSignedTransaction(theState.signedTx);
      defer.once('transactionHash', (txId) => {
        console.log(`Tx created: ${txId}`);
        this._will.txId = txId;
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

  // Protected functions
  _configureProviderParams(params) {
    return Promise.resolve('');
  }
}

window.EWillCreate = EWillCreate;
