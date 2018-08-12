class EWillLogin {
  // Public functions
  constructor() {
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

  // Accessors
  set userPrivateKey(privKey) {
    this._privateKey = privKey;
  }

  get userPrivateKey() {
    return this._privateKey;
  }
}

window.EWill = EWillLogin;
