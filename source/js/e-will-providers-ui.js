(function () {
  const providersTable = document.querySelector('.wrap-will--provider');
  const providerRowTemplate = document.querySelector('template').content.querySelector('.wrap-will__row--body');

  const ewill = new window.EWillProviders();
  window.ewill = ewill;

  const updateProvidersList = function(providers) {
    for (let idx in providers) {
      const provider = providers[idx];
      const providerRow = providerRowTemplate.cloneNode(true);

      const logo = providerRow.querySelector('.wrap-will__col--provider-logo');
      logo.querySelector('.provider-logo-source-desktop').srcset = `${provider.extraInfo.logo.desktop} 1x, ${provider.extraInfo.logo.desktop2x} 2x`;
      const logoImg = logo.querySelector('.provider-logo-image');
      logoImg.src = provider.extraInfo.logo.mobile;
      logoImg.srcset = `${provider.extraInfo.logo.mobile2x} 2x`;
      logoImg.alt = provider.extraInfo.name;

      providerRow.querySelector('.wrap-will__col--provider-name').innerHTML = provider.extraInfo.name;
      providerRow.querySelector('.wrap-will__col--method').innerHTML = provider.extraInfo.tags;
      providerRow.querySelector('.wrap-will__col--tariff').innerHTML = `$${provider.info.centPrice.fee / 100}`;
      providerRow.querySelector('.wrap-will__col--description').innerHTML = provider.extraInfo.description;
      providerRow.querySelector('.wrap-will__col--provider-action').addEventListener('click', (e) => {
        location.href = provider.extraInfo.webUrl;
      });
      providersTable.insertBefore(providerRow, null);
    }
  }

  ewill.configure().then( () => {
    return ewill.getActiveProviders();
  }).then( (providers) => {
    updateProvidersList(providers);
  }).catch( (err) => {
    ;
  });
})();
