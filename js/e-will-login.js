const EWillBase = require('./e-will-base.js').EWillBase;

class EWillLogin extends EWillBase {
  // Public functions
  constructor() {
    super();
  }

  loginWithPrivateKey(privKey) {
    //todo: validate the key
    this.userPrivateKey = privKey;
    return true;
  }

  loginWithKeystore(keystore, password) {
    //todo: extract the key
    return true;
  }

  loginWithQestionary(questions, answers) {
    //todo: recover the key
    return true;
  }
}

window.EWillLogin = EWillLogin;
