(function () {
  const TOGGLE_CLOSED = 'main-nav__toggle--closed';
  const TOGGLE_OPENED = 'main-nav__toggle--opened';
  const NAV__OPENED = 'main-nav--opened';
  const menuButton = document.querySelector('.main-nav__toggle');
  const mainNav = document.querySelector('.header__menu');

  window.util.toggleBlock(menuButton, mainNav, TOGGLE_OPENED, TOGGLE_CLOSED, NAV__OPENED);

})();
