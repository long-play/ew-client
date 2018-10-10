(function () {
  const HIDDEN = 'z-hidden';

  const startButtonAnimation = function (button) {
    const animation = button.querySelector('.loader--button');
    const text = button.querySelector('span');
    text.classList.add(HIDDEN);
    button.setAttribute('disabled', 'true');

    const showAnima = function () {
      animation.classList.remove(HIDDEN);
    };

    setTimeout(showAnima, 100);
  };

  const stopButtonAnimation = function (button) {
    const animation = button.querySelector('.loader--button');
    const text = button.querySelector('span');
    text.classList.remove(HIDDEN);
    button.removeAttribute('disabled');

    const hideAnima = function () {
      animation.classList.add(HIDDEN);
    };

    setTimeout(hideAnima, 100);
  };

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

    startButtonAnimation,
    stopButtonAnimation,

    toggleBlock: toggleBlock,
    showBlock: showBlock,
    hideBlock: hideBlock
  };
})();
