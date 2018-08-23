  (function () {
   const TOGGLE_CLOSED = 'main-nav__toggle--closed';
   const TOGGLE_OPENED = 'main-nav__toggle--opened';
   const NAV__OPENED = 'main-nav--opened';
   const menuButton = document.querySelector('.main-nav__toggle');
   const mainNav = document.querySelector('.header-will');

   const onClickToggleMenu = function () {
     menuButton.classList.toggle(TOGGLE_CLOSED);
     menuButton.classList.toggle(TOGGLE_OPENED);

     if (mainNav.classList.contains(NAV__OPENED)) {
       mainNav.classList.remove(NAV__OPENED);
       document.body.style.overflow = "auto";
     } else {
       mainNav.classList.add(NAV__OPENED);
       document.body.style.overflow = "hidden";
     }
   };
   menuButton.addEventListener('click', onClickToggleMenu);
 })();
