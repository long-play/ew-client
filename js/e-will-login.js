const Wallet = require('ethereumjs-wallet');
const EWillBase = require('./e-will-base.js').EWillBase;

class EWillLogin extends EWillBase {
  // Public functions
  constructor() {
    super(EWillConfig.gethUrl);
  }

  generateTestPrivateKey() {
    if (typeof Storage && localStorage.userPrivateKey) {
      this.userPrivateKey = localStorage.userPrivateKey;
      return Promise.resolve(this.userPrivateKey);
    }

    const promise = this.ajaxRequest(`${EWillConfig.apiUrl}/key/test`).then ( (response) => {
      localStorage.userPrivateKey = response.privateKey;
      this.userPrivateKey = localStorage.userPrivateKey;
      return Promise.resolve(this.userPrivateKey);
    }).catch( (err) => {
      console.error(`Failed to generate test private key: ${ JSON.stringify(err) }`);
      return Promise.reject(err);
    });
    return promise;
  }

  loginWithPrivateKey(privKey) {
    this.userPrivateKey = privKey;
    return this.loginIfPossible();
  }

  loginWithKeystore(keystore, password) {
    const wallet = Wallet.fromV3(keystore, password, true);
    this.userPrivateKey = wallet.getPrivateKey();
    return this.loginIfPossible();
  }

  loginWithQestionary(questions, answers) {
    //todo: recover the key
    return this.loginIfPossible();
  }
}

window.EWillLogin = EWillLogin;
