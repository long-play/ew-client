(function () {
  const CLOSED = 'modal--closed';
  const loader = document.querySelector('.loader--screen');
  const providersTable = document.querySelector('.wrap-will--provider');
  const providerRowTemplate = document.querySelector('template').content.querySelector('.wrap-will__row--body');
  const modalError = document.querySelector('.modal--error');

  const ewill = new window.EWillProviders();
  window.ewill = ewill;

  const updateProvidersList = function(providers) {
    for (let idx in providers) {
      const provider = providers[idx];
      const providerRow = providerRowTemplate.cloneNode(true);

      provider.params = {
        period: 1
      };

      const logo = providerRow.querySelector('.wrap-will__col--provider-logo');
      logo.querySelector('.provider-logo-source-desktop').srcset = `${provider.extraInfo.logo.desktop} 1x, ${provider.extraInfo.logo.desktop2x} 2x`;
      const logoImg = logo.querySelector('.provider-logo-image');
      logoImg.src = provider.extraInfo.logo.mobile;
      logoImg.srcset = `${provider.extraInfo.logo.mobile2x} 2x`;
      logoImg.alt = provider.extraInfo.name;

      providerRow.querySelector('.wrap-will__col--provider-name').innerHTML = provider.extraInfo.name;
      providerRow.querySelector('.wrap-will__col--method').innerHTML = provider.extraInfo.tags;
      providerRow.querySelector('.wrap-will__col--tariff').innerHTML = `$${provider.info.centPrice.fee / 100}`;
      providerRow.querySelector('.wrap-will__select').addEventListener('change', (e) => {
        const selectedPeriod = e.target.value;
        provider.params.period = selectedPeriod;
      });
      providerRow.querySelector('.wrap-will__col--provider-action').addEventListener('click', (e) => {
        location.href = `${provider.extraInfo.webUrl}?period=${provider.params.period}`;
      });

      const infoButton = providerRow.querySelector('.wrap-will__info');
      const info = providerRow.querySelector('.provider-info');
      const infoText = info.querySelector('.provider-info__text');
      window.util.showBlock(infoButton, info, window.util.HIDDEN);
      window.util.hideBlock(infoButton, info, window.util.HIDDEN);
      infoText.textContent = provider.extraInfo.description;

      providersTable.insertBefore(providerRow, null);
    }
  }

  const showError = function (title, err) {
    let text = '';
    if (typeof err === 'string') {
      text = err;
    } else if (typeof err.message === 'string') {
      text = err.message;
    } else {
      text = 'Something went wrong. Please, try again.';
    }

    if (err instanceof Error || err.popup === true) {
      modalError.classList.remove(CLOSED);
      const modalTitle = modalError.querySelector('.modal__title');
      const modalText = modalError.querySelector('.modal__text');
      const cancel = modalError.querySelector('.modal__button');

      cancel.addEventListener('click', function () {
        modalError.classList.add(CLOSED)
      });

      modalTitle.innerText = title;
      modalText.innerText = text;
    }

    console.error(title + ': ' + text);
  };

  ewill.configure().then( () => {
    return ewill.getActiveProviders();
  }).then( (providers) => {
    updateProvidersList(providers);
    providersTable.classList.remove(window.util.HIDDEN);
    loader.classList.add(window.util.HIDDEN);
  }).catch( (err) => {
    loader.classList.add(window.util.HIDDEN);
    console.error(err);
    showError('Initializing the web app', err);
  });
})();
