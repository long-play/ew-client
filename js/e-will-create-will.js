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

    const params = {};
    const queries = query.split('&');
    for (let i = 0; i < queries.length; i++) {
      const split = queries[i].split('=');
      if (split.length != 2) continue;
      params[split[0]] = split[1];
    }
    this._qParams = params;
    this._templateMeta = {
      poweredBy: 'E-will Platform',
      version: '1.0'
    };
    this._platform = {};
  }

  configure() {
    const contracts = {
      ewPlatform : {
        abi: 'static/abi-platform.json',
        address: EWillConfig.contractPlatformAddress
      },
      ewFinance : {
        abi: 'static/abi-finance.json',
        address: EWillConfig.contractFinanceAddress
      },
      ewEscrow : {
        abi: 'static/abi-escrow.json',
        address: EWillConfig.contractEscrowAddress
      }
    };

    const res = super._configureContracts(contracts).then( () => {
      return this._configureProviderParams(this._qParams);
    }).then( () => {
      return this._configurePlatformParams();
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

    const url = `${EWillConfig.apiUrl}/key/public?address=${address}`;
    const promise = this.ajaxRequest(url).then( (response) => {
      // Verify the response from the server
      const pub = '0x' + response.publicKey.slice(4);
      const addr = EthUtil.pubToAddress(pub).toString('hex');
      if (EthUtil.addHexPrefix(addr).toLowerCase() != address.toLowerCase()) return Promise.reject({});

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
      beneficiaryPublicKey: '0x04' + EthUtil.bufferToHex(EthUtil.privateToPublic(benAcc.privateKey)).slice(2),
      beneficiaryPrivateKey: benAcc.privateKey,
      beneficiaryAddressHash: new BN(keccak256(benBuff), 16)
    };

    return Promise.resolve(this._will);
  }

  getTotalFee(subcribePeriod = 1, refCode = EWillBase.zeroAddress()) {
    const promise = this.ewFinance.methods.totalFee(subcribePeriod, this._provider.address, refCode).call().then( ({ fee, refReward, subsidy }) => {
      this._provider.info.centPrice = { fee, refReward, subsidy };
      return Promise.resolve({ fee, refReward, subsidy });
    });
    return promise;
  }

  requestProviderKey() {
    const data = {
      address: this._userAccount.address,
      willId: this._provider.params.willId,
      token: this._provider.params.token
    };

    const promise = this.ajaxRequest(`${this._provider.extraInfo.apiUrl}`, {
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data)
    }).then( (response) => {
      const msg = Buffer.concat([EthUtil.toBuffer(response.willId), EthUtil.toBuffer(response.key)]);
      const hash = EthUtil.keccak256(msg);
      const pubKey = EthUtil.ecrecover(hash, response.signature.v, response.signature.r, response.signature.s);
      const isSigned = ('0x' + EthUtil.pubToAddress(pubKey).toString('hex').toLowerCase() === this._provider.params.address.toLowerCase());
      if (isSigned !== true) {
        return Promise.reject( /* error */ );
      } else if (this._provider.params.willId != response.willId) {
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
    const wcrypto = new Crypto.WCrypto();
    let encryptedBenContacts = null;

    const contactsTar = new Tar();
    const contacts = Object.assign({
      beneficiaryAddress: this._will.beneficiaryAddress,
      beneficiaryContacts: this._will.beneficiaryContacts,
      beneficiaryPublicKey: this._will.beneficiaryPublicKey,
      owner: this._platform.address
    }, this._templateMeta);
    const beneficiaryContacts = contactsTar.append('meta.json', JSON.stringify(contacts));
    const promise = wcrypto.encrypt(beneficiaryContacts,
                    this._userAccount.privateKey,
                    this._platform.publicKey,
                    this._willId)
    .then( (enc) => {
      encryptedBenContacts = enc;

      const willTar = new Tar();
      this._will.records = records.slice();
      for (let record of records) {
        willTar.append(record.title, record.value);
      }

      const willContent = willTar.append('meta.json', JSON.stringify(this._templateMeta));
      return wcrypto.encrypt(willContent,
             this._userAccount.privateKey,
             this._will.beneficiaryPublicKey,
             this._willId);
    }).then( (enc) => {
      const encWillTar = new Tar();
      const meta = Object.assign({
        owner: this._platform.address
      }, this._templateMeta);

      encWillTar.append('will.encrypted.tar', enc.ciphertext);
      encWillTar.append('contacts.encrypted.tar', encryptedBenContacts.ciphertext);
      const payload = encWillTar.append('meta.json', JSON.stringify(meta));

      return wcrypto.encrypt(payload,
                             this._userAccount.privateKey,
                             this._provider.publicKey,
                             this._willId);
    }).then( (enc) => {
      const encWillTar = new Tar();
      const meta = Object.assign({
        owner: this._provider.params.address
      }, this._templateMeta);

      encWillTar.append('will.encrypted.x2.tar', enc.ciphertext);
      const payload = encWillTar.append('meta.json', JSON.stringify(meta));
      this._will.encrypted = new Uint8Array(payload);

      return Promise.resolve(this._will.records);
    }).catch( (err) => {
      console.error(`Failed to encrypt the will: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });

    return promise;
  }

  createWill(title, subcribePeriod = 1, refCode = EWillBase.zeroAddress()) {
    // upload the will into SWARM & generate a transaction
    const url = `${EWillConfig.swarmUrl}/bzz:/`;
    let rawTx = {};
    let createWillMethod = null;
    let price = 0;
    const totalFeeEthers = this.ewFinance.methods.totalFeeEthers(subcribePeriod, this._provider.address, refCode);
    const promise = totalFeeEthers.call().then( ({ fee, refReward, subsidy }) =>{
      price = (new BN(fee)).sub(new BN(subsidy));
      return this.ajaxRequest(url, {
        method: 'POST',
        contentType: 'application/octet-stream',
        processData: false,
        data: this._will.encrypted
      });
    }).then( (response) => {
      if (typeof response.error !== 'undefined') {
        return Promise.reject(response.error);
      }

      const storageId = response;
      console.log('confirmed the will: ' + storageId);

      if (!title) {
        title = `**${this._willId.slice(-4)}`;
      }

      // generate & sign the ethereum transaction
      createWillMethod = this.ewPlatform.methods.createWill(
        title,
        this._willId,
        `0x${storageId}`,
        subcribePeriod,
        `0x${this._will.beneficiaryAddressHash.toString('hex')}`,
        this._provider.address,
        refCode);
      return createWillMethod.estimateGas({ from: this._userAccount.address, value: price });
    }).then( (gasLimit) => {
      const payload = createWillMethod.encodeABI();
      console.log(payload);

      rawTx = {
        to: this.ewPlatform.options.address,
        data: payload,
        value: price,
        gasLimit: gasLimit,
        chainId: EWillConfig.chainID
      };
      return this._userAccount.signTransaction(rawTx);
    }).then( (tx) => {
      const denominatedPrice = (new BN(price)).div(new BN('1000000000000000'));
      const eprice = denominatedPrice.divmod(new BN(1000), '', false);
      const will = {
        providerName: this._provider.extraInfo.name,
        price: `${eprice.div.toString()}.${eprice.mod.toString()}`
      };
      this._will.signedTx = tx.rawTransaction;
      return Promise.resolve(will);
    }).catch( (err) => {
      console.error(`Failed to create the will tx: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });

    return promise;
  }

  submitWill() {
    const promise = this._sendTx(this._will.signedTx).then( (txId) => {
      this._will.txId = txId;
      return Promise.resolve(txId);
    });

    return promise;
  }

  // Accessors
  get provider() {
    return this._provider;
  }

  // Protected functions
  _configureProviderParams(params) {
    this._provider = {
      params
    };

    if (!this._provider.params.address ||
        !this._provider.params.willId ||
        !this._provider.params.signaturev ||
        !this._provider.params.signaturer ||
        !this._provider.params.signatures ||
        !this._provider.params.token) {
      return Promise.reject('Missing some provider\'s parameters');
    }

    const msg = Buffer.concat([EthUtil.toBuffer(params.address), EthUtil.toBuffer(params.willId), EthUtil.toBuffer(params.token)]);
    const hash = EthUtil.keccak256(msg);
    const pubKey = EthUtil.ecrecover(hash, params.signaturev, params.signaturer, params.signatures);
    const isSigned = (`0x${EthUtil.pubToAddress(pubKey).toString('hex').toLowerCase()}` === params.address.toLowerCase());
    if (isSigned !== true) {
      return Promise.reject('The provider\'s signature is corrupted!');
    }

    // request a provider info
    const promise = this.ewEscrow.methods.providerAddress(this._provider.params.address).call().then( (address) => {
      this._provider.address = address;
      this._willId = `0x${(new BN(this._provider.address.slice(2), 16)).iushln(96).iadd(new BN(this._provider.params.willId)).toString(16)}`;

      return this.ewEscrow.methods.isProviderValid(this._provider.address).call();
    }).then( (isValid) => {
      if (!isValid) {
        return Promise.reject(`The provider ${this._provider.params.address}=>${this._provider.address} is not a valid provider`);
      }
      return this.ewEscrow.methods.providers(this._provider.address).call();
    }).then( (providerInfo) => {
      this._provider.info = providerInfo;
      const info = new BN(providerInfo.info, 10);
      return this.jsonRequest(`${EWillConfig.swarmUrl}/bzz:/${info.toString('hex')}/`);
    }).then( (providerInfo) => {
      this._provider.extraInfo = providerInfo;
      return Promise.resolve(providerInfo);
    });
    return promise;
  }

  _configurePlatformParams() {
    const promise = this.ewPlatform.methods.platformAddress().call().then( (platformAddress) => {
      this._platform.address = platformAddress;
      const url = `${EWillConfig.apiUrl}/key/public?address=${platformAddress}`;
      return this.ajaxRequest(url);
    }).then ( (response) => {
      // Verify the response from the server
      const pub = '0x' + response.publicKey.slice(4);
      const addr = EthUtil.pubToAddress(pub).toString('hex');
      if (EthUtil.addHexPrefix(addr).toLowerCase() != this._platform.address.toLowerCase()) return Promise.reject({});

      this._platform.publicKey = response.publicKey;
      return Promise.resolve(response.publicKey);
    }).catch( (err) => {
      console.error(`Failed to find platform public key: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });
    return promise;
  }
}

window.EWillCreate = EWillCreate;
