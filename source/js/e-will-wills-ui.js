(function () {
  const HIDDEN = 'my-wills-menu--hidden';
  const willEmpty = document.querySelector('.wrap-will--empty');
  const willMoreWills = document.querySelector('.wrap-will--wills');
  const willsTable = document.querySelector('.wrap-will--wills');
  const willRowTemplate = document.querySelector('template').content.querySelector('.wrap-will__row--body');

  const willStateNames = [ 'None', 'Created', 'Activated', 'Pending', 'Claimed', 'Declined' ];
  const willStateClasses = [ 'state-text--success', 'state-text--success', 'state-text--success', 'state-text--danger', 'state-text--danger', 'state-text--danger' ];
  const ewill = new window.EWillWills();
  window.ewill = ewill;

  const maskID = function(arg) {
    return arg.slice(0, 8) + '...' + arg.slice(-4);
  };

  const formatDate = function(arg) {
    return moment.unix(arg).format('LLL');
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
      ewill.deleteWill(will.willId).then( (result) => {
        updateWillsList(ewill.wills);
      });
      e.preventDefault();
      menu.classList.add(HIDDEN);
    });
  };

  const submenuItemHandler = function(menuItem, item, handler) {
  };

  const updateWillsList = function(wills) {
    const oldRows = willsTable.querySelectorAll('.wrap-will__row--body');
    oldRows.forEach( (node, idx, list) => {
      node.remove();
    });

    for (let will of wills) {
      const willRow = willRowTemplate.cloneNode(true);
      willRow.querySelector('.wrap-will__col--willId').innerHTML = maskID(will.willId);
      willRow.querySelector('.wrap-will__col--fee').innerHTML = '$' + will.annualFee;
      willRow.querySelector('.wrap-will__col--state').innerHTML = `<span class="state-text ${willStateClasses[will.state]}">${willStateNames[will.state]}</span>`;
      willRow.querySelector('.wrap-will__col--validTill').innerHTML = formatDate(will.validTill);

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

    willEmpty.classList.toggle('wrap-will--show', wills.length == 0);
    willMoreWills.classList.toggle('wrap-will--show', wills.length !== 0);
  };

  if (ewill.loginIfPossible() !== true) {
    console.log('not logged in');
    location.href = '/login.html?redirect=wills.html';
    return;
  }

  ewill.configure().then( () => {
    return ewill.getUserWills();
  }).then( (wills) => {
    updateWillsList(wills);
  }).catch( (err) => {
    ;
  });

  document.querySelector('.header--my-wills .header__button').addEventListener('click', () => {
    location.href = '/providers.html';
  });
})();
