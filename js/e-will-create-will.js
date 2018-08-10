class EWillCreate extends EWillCreateIf {
  // Public functions
  constructor(gethUrl, query) {
    this._qParams = query.slice(1);
  }

  configure() {
    const res = _configureContracts().then( () => {
      return _configureProviderParams(this._qParams);
    };
    return res;
  }

  login(privKey) {
    this.userPrivateKey = privKey;
  }

  findBeneficiary(address) {
    return Promise.resolve('');
  }

  createBeneficiary() {
    return Promise.resolve('');
  }

  requestServiceKey() {
    return Promise.resolve('');
  }

  createWill(records) {
    return Promise.resolve('');
  }

  prepearWill() {
    return Promise.resolve('');
  }

  submitWill() {
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

  _configureProviderParams(params) {
    return Promise.resolve('');
  }
}
