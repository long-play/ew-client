class EWillProviders {
  // Public functions
  constructor(gethUrl) {
  }

  configure() {
    return this._configureContracts();
  }

  getActiveProviders() {
    this._providers = ['1', '4', '8'];
    return Promise.resolve(this._providers);
  }

  // Accessors
  get providers() {
    return this._providers.slice();
  }

  // Protected functions
  _configureContracts() {
    return Promise.resolve('');
  }
}

window.EWill = EWillProviders;
