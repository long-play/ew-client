(function () {
  const HIDDEN = 'z-hidden';

  const toggleBlock = function (mainElement, collapsedElement, inactiveMainClass, activeMainClass, activeCollapsedClass) {
    mainElement.addEventListener('click', function (evt) {
      evt.preventDefault();
      mainElement.classList.toggle(inactiveMainClass);
      mainElement.classList.toggle(activeMainClass);

      if (mainElement.classList.contains(activeMainClass)) {
        collapsedElement.classList.remove(activeCollapsedClass);
      } else {
        collapsedElement.classList.add(activeCollapsedClass);
      }
    });
  };

  const showBlock = function (mainElement, collapsedElement, collapsedClass) {
    mainElement.addEventListener('mouseover', function () {
      collapsedElement.classList.remove(collapsedClass);
    });
  };

  const hideBlock = function (mainElement, collapsedElement, collapsedClass) {
    mainElement.addEventListener('mouseout', function () {
      collapsedElement.classList.add(collapsedClass);
    });
  };

  window.util = {
    HIDDEN: HIDDEN,
    toggleBlock: toggleBlock,
    showBlock: showBlock,
    hideBlock: hideBlock
  }
})();
