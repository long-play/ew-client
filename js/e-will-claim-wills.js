const EWillBase = require('./e-will-base.js').EWillBase;
const EWillError = require('./e-will-error.js').EWillError;
const EthUtil = require('ethereumjs-util');
const Crypto = require('wcrypto');
const untar = require('js-untar');
const FS = require('file-saver');
const BN = require('bn.js');

class EWillClaim extends EWillBase {
  // Public functions
  constructor() {
    super(EWillConfig.gethUrl);
  }

  configure() {
    const contracts = {
      ewPlatform : {
        abi: 'static/abi-platform.json',
        address: EWillConfig.contractPlatformAddress
      }
    };
    return super._configureContracts(contracts);
  }

  getContentSize(will) {
    const url = `${EWillConfig.swarmUrl}/bzz-raw:/${(new BN(will.storageId)).toString('hex')}`;
    const promise = this.jsonRequest(url).then( (response) => {
      const fileEntries = response.entries;
      if (!fileEntries || fileEntries.length < 1) {
        return Promise.reject(EWillError.silentError('Failed to obtain the list of wills. Please try to refresh the page.'));
      }
      will.storageSize = fileEntries[0].size || 0;
      return Promise.resolve(will.storageSize);
    });
    return promise;
  }

  downloadAndDecrypt(will) {
    const note = (new BN(will.willId)).toString('hex');
    const serviceKey = (new BN(will.decryptionKey)).toString('hex');

    let encryptedContent = null;
    const url = `${EWillConfig.swarmUrl}/bzz:/${(new BN(will.storageId)).toString('hex')}/`;
    const promise = this.binaryRequest(url, {
    }).then( (response) => {
      return untar(response);
    }).then( (extractedFiles) => {
      const encryptedTar = extractedFiles.filter( file => file.name == 'will.encrypted.x2.tar' );
      encryptedContent = encryptedTar[0].buffer;
      const aes = new Crypto.AESGCM();
      return aes.importKey(serviceKey);
    }).then( (aes) => {
      const iv = Crypto.Util.sha256(Crypto.Util.hexToBuffer(serviceKey)).toString('hex').slice(-24);
      return aes.decrypt(encryptedContent, iv, note);
    }).then( (decrypted) => {
      return untar(decrypted.buffer);
    }).then( (extractedFiles) => {
      const encryptedTar = extractedFiles.filter( file => file.name == 'will.encrypted.tar' );
      encryptedContent = encryptedTar[0].buffer;
      return this._requestUserKey(will.owner);
    }).then( (userPublicKey) => {
      const wcrypto = new Crypto.WCrypto();
      return wcrypto.decrypt(encryptedContent, this.userPrivateKey, userPublicKey, note);
    }).then( (decryptedContent) => {
      will.storage = new Blob([decryptedContent], {type: 'application/octet-stream'});
      return untar(decryptedContent.buffer);
    }).then( (extractedFiles) => {
      will.content = extractedFiles;
      will.decrypted = true;
      return Promise.resolve(extractedFiles);
    }).catch( (err) => {
      console.error(err);
      return Promise.reject(EWillError.generalError('Failed to decrypt the will content. Please refresh the page and try again.'));
    });
    return promise;
  }

  getWills() {
    const wills = [];

    const promise = this.ewPlatform.methods.numberOfBeneficiaryWills(this._userAccount.address).call().then( (numberOfWills) => {
      const promises = [];
      const benHash = EthUtil.keccak256(EthUtil.toBuffer(this._userAccount.address));

      for (let idx = 0; idx < numberOfWills; idx++) {
        const promise = this.ewPlatform.methods.beneficiaryWills(
          benHash,
          idx
        ).call().then( (willId) => {
          return this.ewPlatform.methods.wills(willId).call();
        }).then( (will) => {
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
      return Promise.reject(EWillError.generalError('Failed to obtain the list of wills. Please try to refresh the page.'));
    });

    return promise;
  }

  claimWill(will) {
    const txId = '0xbababaca';
    const promise = new Promise( (resolve, reject) => {
      setTimeout(() => { resolve(txId); }, 1600);
    });
    return promise;
  }

  saveFileAs(blob, filename) {
    return FS.saveAs(blob, filename);
  }

  // Private functions
  _requestUserKey(address) {
    return Promise.resolve('0x04e3f1ea95a64bce6060c51d3d0c897d32ebed03dc671762f1d8f2da38e84a409b43a6d812290271ac3529dc20a96418c9a11756e6dfc94a2c7e284486cae3c9a9');

    const url = `${EWillConfig.apiUrl}/key/public?address=${address}`;
    const promise = this.ajaxRequest(url).then( (response) => {
      // Verify the response from the server
      const pub = '0x' + response.publicKey.slice(4);
      const addr = EthUtil.pubToAddress(pub).toString('hex');
      if (EthUtil.addHexPrefix(addr).toLowerCase() != address.toLowerCase()) return Promise.reject(EWillError.securityError());

      return Promise.resolve(response.publicKey);
    });

    return promise;
  }

  // Accessors
  get wills() {
    return this._wills.slice();
  }
}

window.EWillClaim = EWillClaim;
