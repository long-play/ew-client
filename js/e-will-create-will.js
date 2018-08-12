class EWillCreate extends EWillBase {
  // Public functions
  constructor(gethUrl, query) {
    super(gethUrl);
    this._qParams = query.slice(1);
  }

  configure() {
    const contracts = {
      ewPlatform : {
        abi: 'abi-platform.json',
        address: EWillConfig.contractPlatformAddress
      },
      ewEscrow : {
        abi: 'abi-escrow.json',
        address: EWillConfig.contractEscrowAddress
      }
    };
    const res = super._configureContracts(contracts).then( () => {
      return this._configureProviderParams(this._qParams);
    });
    return res;
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

  // Protected functions
  _configureProviderParams(params) {
    return Promise.resolve('');
  }
}

window.EWill = EWillCreate;
