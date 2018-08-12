class EWillProviders extends EWillBase {
  // Public functions
  constructor(gethUrl) {
    super(gethUrl);
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
    return super._configureContracts(contracts);
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
