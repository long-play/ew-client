const Wallet = require('ethereumjs-wallet');
const EWillBase = require('./e-will-base.js').EWillBase;

class EWillLogin extends EWillBase {
  // Public functions
  constructor() {
    super(EWillConfig.gethUrl);
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
