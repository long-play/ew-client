class EWillWills {
  // Public functions
  constructor(gethUrl) {
  }

  configure() {
    return _configureContracts();
  }

  login(privKey) {
    this.userPrivateKey = privKey;
  }

  findServiceProviders(address) {
    return Promise.resolve('');
  }

  getUserWills() {
    return Promise.resolve('');
  }

  prolonWill() {
    return Promise.resolve('');
  }

  deleteWill(records) {
    return Promise.resolve('');
  }

  // Accessors
  set userPrivateKey(privKey) {
    if (typeof Storage && sessionStorage.userPrivateKey != privKey) {
      sessionStorage.userPrivateKey = privKey;
    }
    this._privateKey = privKey;
  }

  get userPrivateKey() {
    let privKey = '';
    if (!this._privateKey && typeof Storage && sessionStorage.userPrivateKey) {
      this._privateKey = sessionStorage.userPrivateKey;
    }
    return privKey;
  }

  // Protected functions
  _configureContracts() {
    return Promise.resolve('');
  }
}
