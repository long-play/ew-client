(function () {
  const BUTTONS_NO_MARGIN = 'steps__buttons--no-margin';
  const SCREEN_FOUR_PADDING_TOP_BLOCKS = 'steps__step-4--blocks';
  const textBlockTemplate = document.querySelector('template').content.querySelector('.steps__block--text');
  const fileBlockTemplate = document.querySelector('template').content.querySelector('.steps__block--file');
  const buttons = window.ui.screens.willContent.querySelector('.steps__buttons');
  const addTextBlock = buttons.querySelector('.steps__add-block--text');
  const addFileBlock = buttons.querySelector('.steps__add-block--file');
  const dropZone = document.querySelector('.steps__drop-zone');
  let counter = 0;

  const hideConfirmButton = function () {
    window.ui.screens.toValidation.classList.add(window.util.HIDDEN);
  };

  const showDropZone = function () {
    dropZone.classList.remove(window.util.HIDDEN);
  };

  const removeBlock = function (close) {
    close.addEventListener('click', function () {
      const blockForRemove = this.parentElement;
      blockForRemove.remove();

      if (window.ui.screens.willContent.firstElementChild === buttons) {
        hideConfirmButton();
        showDropZone();
      }
    })
  };

  const addCloseListeners = function () {
    const closeButtons = document.querySelectorAll('.will-block__close');
    for (let i = 0; i < closeButtons.length; i++) {
      removeBlock(closeButtons[i]);
    }
  };

  const changesOnFirstBlock = function () {
    addCloseListeners();

    if (window.ui.screens.toValidation.classList.contains(window.util.HIDDEN)) {
      window.ui.screens.toValidation.classList.remove(window.util.HIDDEN);
    }

    if (buttons.classList.contains(BUTTONS_NO_MARGIN)) {
      buttons.classList.remove(BUTTONS_NO_MARGIN);
    }

    if (!window.ui.screens.willContent.classList.contains(SCREEN_FOUR_PADDING_TOP_BLOCKS)) {
      window.ui.screens.willContent.classList.add(SCREEN_FOUR_PADDING_TOP_BLOCKS);
    }

    if (!dropZone.classList.contains(window.util.HIDDEN)) {
      dropZone.classList.add(window.util.HIDDEN);
    }
  };

  const onClickCreateTextBlock = function () {
    const textBlock = textBlockTemplate.cloneNode(true);
    window.ui.screens.willContent.insertBefore(textBlock, buttons);
    changesOnFirstBlock();
  };

  const onClickCreateFileBlock = function () {
    const fileBlock = fileBlockTemplate.cloneNode(true);
    const input = fileBlock.querySelector('input[type=file]');
    const label = fileBlock.querySelector('.will-block__file-handle');
    input.id = 'file-' + counter;
    label.htmlFor = input.id;
    counter++;
    window.ui.screens.willContent.insertBefore(fileBlock, buttons);
    input.click();

    const getFileName = function (e) {
      const files = e.target.files;
      const fileName = fileBlock.querySelector('.will-block__name-value');
      fileName.innerText = files[0].name;
    };

    input.addEventListener('change', getFileName);

    changesOnFirstBlock();
  };

  addTextBlock.addEventListener('click', onClickCreateTextBlock);
  addFileBlock.addEventListener('click', onClickCreateFileBlock);
})();
