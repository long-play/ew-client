class EWillWills extends EWillBase {
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
  get wills() {
    return this._wills.slice();
  }
}

window.EWill = EWillWills;
