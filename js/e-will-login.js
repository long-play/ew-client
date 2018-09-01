const Wallet = require('ethereumjs-wallet');
const EWillBase = require('./e-will-base.js').EWillBase;

class EWillLogin extends EWillBase {
  // Public functions
  constructor() {
    super(EWillConfig.gethUrl);
  }

  generateTeskPrivateKey() {
    this.userPrivateKey = '0xeadcc9142c57f7a118584f56d1f38ed32807bec710572f26ad9fbcac1d8f90db';
    return this.userPrivateKey;
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
