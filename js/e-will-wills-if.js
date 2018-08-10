class EWillWillsIf {
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
    this._privateKey = privKey;
  }

  get userPrivateKey() {
    return this._privateKey;;
  }

  // Protected functions
  _configureContracts() {
    return Promise.resolve('');
  }
}
