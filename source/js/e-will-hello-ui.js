(function () {
  const stageFirst = document.querySelector('.will-welcome__stage--first');
  const stageSecond = document.querySelector('.will-welcome__stage--second');
  const claimBtn = document.querySelector('.will-welcome__link-claim');

  const goToClaim = function (evt) {
    evt.preventDefault();
    stageFirst.classList.add(window.util.HIDDEN);
    stageSecond.classList.remove(window.util.HIDDEN);
  };

  claimBtn.addEventListener('click', goToClaim);
})();
