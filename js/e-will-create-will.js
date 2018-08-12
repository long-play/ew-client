class EWillCreate {
  // Public functions
  constructor(gethUrl, query) {
    this._qParams = query.slice(1);
  }

  configure() {
    const res = this._configureContracts().then( () => {
      return this._configureProviderParams(this._qParams);
    });
    return res;
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
    this._privateKey = privKey;
  }

  get userPrivateKey() {
    return this._privateKey;
  }

  // Protected functions
  _configureContracts() {
    return Promise.resolve('');
  }

  _configureProviderParams(params) {
    return Promise.resolve('');
  }
}

window.EWill = EWillCreate;
