class EWillWills {
  // Public functions
  constructor(gethUrl) {
  }

  configure() {
    return this._configureContracts();
  }

  login() {
    //todo: for debug purposes only
    return true;

    let result = false;
    if (this.userPrivateKey) {
      result = true;
    }
    return result;
  }

  findServiceProviders() {
    return Promise.resolve('');
  }

  getUserWills() {
    this._wills = ['1', '4', '8'];
    return Promise.resolve(this._wills);
  }

  prolongWill(idx) {
    return Promise.resolve(`Prolonged the will at ${idx}`);
  }

  deleteWill(idx) {
    this._wills.splice(0, 1);
    return Promise.resolve(`Removed the will at ${idx}`);
  }

  // Accessors
  set userPrivateKey(privKey) {
    this._privateKey = privKey;
  }

  get userPrivateKey() {
    return this._privateKey;
  }

  get wills() {
    return this._wills.slice();
  }

  // Protected functions
  _configureContracts() {
    return Promise.resolve('');
  }
}

window.EWill = EWillWills;
