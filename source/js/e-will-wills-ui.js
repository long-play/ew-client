(function () {
  const CLOSED = 'modal--closed';
  const HIDDEN = 'my-wills-menu--hidden';
  const loader = document.querySelector('.loader--screen');
  const willEmpty = document.querySelector('.wrap-will--empty');
  const willsTable = document.querySelector('.wrap-will--wills');
  const willRowTemplate = document.querySelector('template').content.querySelector('.wrap-will__row--body');
  const modalDeleteWill = document.querySelector('.modal--delete');
  const modalDeleteWillTitle = modalDeleteWill.querySelector('.modal__text--will-title');
  const modalDeleteWillCancel = modalDeleteWill.querySelector('.modal__button[name=cancel]');
  const modalDeleteWillDelete = modalDeleteWill.querySelector('.modal__button[name=delete]');

  const willStateNames = [ 'None', 'Created', 'Activated', 'Pending', 'Claimed', 'Declined', 'Removed' ];
  const willStateClasses = [ 'state-text--success', 'state-text--success', 'state-text--success', 'state-text--danger', 'state-text--danger', 'state-text--danger', 'state-text--danger' ];
  const ewill = new window.EWillWills();
  window.ewill = ewill;

  const maskID = function(arg) {
    return '**' + arg.slice(-4);
  };

  const formatDate = function(arg) {
    if (arg < 101) {
      return 'N/A';
    }
    return moment.unix(arg).format('ll');
  };

  const prolongWill = function(row, menu, menuItem, will) {
    menuItem.addEventListener('click', (e) => {
      ewill.prolongWill(will.willId).then( (result) => {
        updateWillsList(ewill.wills);
      });
      e.preventDefault();
      menu.classList.add(HIDDEN);
    });
  };

  const deleteWill = function(row, menu, menuItem, will) {
    menuItem.addEventListener('click', (e) => {
      // Ask user's confirmation
      modalDeleteWill.classList.remove(CLOSED);
      modalDeleteWillTitle.innerText = will.title;
      modalDeleteWill.will = will;
      // Hide submenu
      menu.classList.add(HIDDEN);
      e.preventDefault();
    });
  };

  const updateWillsList = function(wills) {
    const oldRows = willsTable.querySelectorAll('.wrap-will__row--body');
    oldRows.forEach( (node, idx, list) => {
      node.remove();
    });

    for (let will of wills) {
      const willRow = willRowTemplate.cloneNode(true);
      willRow.querySelector('.wrap-will__col--title').innerHTML = will.title;
      willRow.querySelector('.wrap-will__col--willId').innerHTML = maskID(will.willId);
      ewill.getProviderInfo(will.provider).then( (providerInfo) => {
        willRow.querySelector('.wrap-will__col--provider').innerHTML = providerInfo.extraInfo.name;
      });
      willRow.querySelector('.wrap-will__col--state').innerHTML = `<span class="state-text ${willStateClasses[will.state]}">${willStateNames[will.state]}</span>`;
      willRow.querySelector('.wrap-will__col--validTill span').innerHTML = formatDate(will.validTill);

      const actionButton = willRow.querySelector('.wrap-will__row--body .wrap-will__col--action');
      const actionMenu = willRow.querySelector('.wrap-will__menu');
      window.util.showBlock(actionButton, actionMenu, HIDDEN);
      window.util.hideBlock(actionButton, actionMenu, HIDDEN);

      const itemProlongWill = willRow.querySelector('.my-wills-menu__link--prolong');
      const itemDeleteWill = willRow.querySelector('.my-wills-menu__link--delete');
      prolongWill(willRow, actionMenu, itemProlongWill, will);
      deleteWill(willRow, actionMenu, itemDeleteWill, will);

      willsTable.insertBefore(willRow, null);
    }

    willEmpty.classList.toggle(window.util.HIDDEN, wills.length !== 0);
    willsTable.classList.toggle(window.util.HIDDEN, wills.length === 0);
  };

  if (ewill.loginIfPossible() !== true) {
    console.log('not logged in');
    location.href = '/login.html?redirect=wills.html';
    return;
  }

  const hideDeleteWillModal = function() {
    modalDeleteWill.classList.add(CLOSED);
  };

  modalDeleteWillDelete.addEventListener('click', (e) => {
    ewill.deleteWill(modalDeleteWill.will.willId).then( (result) => {
      updateWillsList(ewill.wills);
      hideDeleteWillModal();
      window.util.stopButtonAnimation(modalDeleteWillDelete);
    });

    window.util.startButtonAnimation(modalDeleteWillDelete);
  });

  modalDeleteWillCancel.addEventListener('click', (e) => {
    hideDeleteWillModal();
  });

  ewill.configure().then( () => {
    return ewill.getUserWills();
  }).then( (wills) => {
    updateWillsList(wills);
    loader.classList.add(window.util.HIDDEN);
  }).catch( (err) => {
    loader.classList.add(window.util.HIDDEN);
  });

  document.querySelector('.header--my-wills .header__button').addEventListener('click', () => {
    location.href = '/providers.html';
  });
})();
