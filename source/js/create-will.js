(function () {
  const CLOSED = 'modal--closed';
  const ERROR = 'input-field--error';
  const SCREEN_FOUR_TITLE_MOB = 'Your will';
  const SCREEN_FIVE_TITLE_MOB = 'Payment';
  const STEP_DONE = 'progress__item--done';
  const STEP_ACTIVE = 'progress__item--active';
  const HEADER_SCREEN_FOUR_CLASS = 'header--will-big-padding';
  const PROGRESS_TEXT_SCREEN_FOUR = 'Step 4 of 5';
  const PROGRESS_TEXT_SCREEN_FIVE = 'Step 5 of 5';
  const TEXT_BLOCK = 'steps__block--text';
  const FILE_BLOCK = 'steps__block--file';

  const screens = {
    beneficiaryInfo: document.querySelector('.steps__step-3'),
    willContent: document.querySelector('.steps__step-4'),
    validation: document.querySelector('.steps__step-5'),
    modalConfirm: document.querySelector('.modal--confirm'),
    modalResult: document.querySelector('.modal--success'),

    toWillContent: document.querySelector('.to-step-4'),
    toValidation: document.querySelector('.to-step-5')
  };
  //todo: screens.validationBack = ...
  screens.validationValidate = screens.validation.querySelector('.steps__submit');
  screens.modalConfirmCancel = screens.modalConfirm.querySelector('.modal__button[type=button]');
  screens.modalConfirmSubmit = screens.modalConfirm.querySelector('button[type=submit]');

  const user = screens.beneficiaryInfo.querySelector('input[name=user]');
  const address = screens.beneficiaryInfo.querySelector('input[name=address]');
  const header = document.querySelector('.header--will');
  const progressMobile = document.querySelector('.step-info__progress-mobile');
  const progressBarScreenThree = document.querySelector('.progress__item:nth-child(3)');
  const progressBarScreenFour = document.querySelector('.progress__item:nth-child(4)');
  const progressBarScreenFive = document.querySelector('.progress__item:nth-child(5)');
  const stepInfoTitle = document.querySelector('.step-info__title');
  const stepInfoText = document.querySelector('.step-info__text');
  const infoTextScreenFour = 'Fill in any information you want to pass to the beneficiary after your death. It could be passwords, logins or you';
  const mobileWidth = window.matchMedia('(max-width: 767px)');

  const onInputRemoveError = function () {
    const parentElement = this.parentElement;
    parentElement.classList.remove(ERROR);
  };

  const canGoToWillContent = function () {
    let result = true;

    if (address.value === '') {
      const addressParent = address.parentElement;
      addressParent.classList.add(ERROR);
      address.focus();
      address.addEventListener('input', onInputRemoveError);
      result = false;
    }

    if (user.value === '') {
      const userParent = user.parentElement;
      userParent.classList.add(ERROR);
      user.focus();
      user.addEventListener('input', onInputRemoveError);
      result = false;
    }

    return {
      result,
      contacts: user.value,
      address:  address.value
    };
  };

  const canGoToValidation = function () {
    let result = true;
    const recordRows = screens.willContent.querySelectorAll('.will-block');

    const records = []; //todo: get the user input records from recordRows
    //format of record:
    /*
      {
        type: "file" или "text",
        title: текст из title или имя файла, если тайтл пустой
        value: file object или текст из value
      }
    */

    // если не все поля заполнены, то result = false;

    for (let i = 0; i < recordRows.length; i++) {
      const record = {};

      if (recordRows[i].classList.contains(FILE_BLOCK)) {
        record.type = 'file';
      } else if (recordRows[i].classList.contains(TEXT_BLOCK)) {
        record.type = 'text'
      }

      records.push(record);
    }

    return {
      result,
      records,
    };
  };

  const goToWillContent = function () {
    // switch the screens
    screens.beneficiaryInfo.classList.add(window.util.HIDDEN);
    screens.willContent.classList.remove(window.util.HIDDEN);

    // update the progress
    progressBarScreenThree.classList.remove(STEP_ACTIVE);
    progressBarScreenThree.classList.add(STEP_DONE);
    progressBarScreenFour.classList.add(STEP_ACTIVE);

    // updated titles
    stepInfoText.innerText = infoTextScreenFour;
    stepInfoTitle.innerText = SCREEN_FOUR_TITLE_MOB;
    progressMobile.innerText = PROGRESS_TEXT_SCREEN_FOUR;

    header.classList.add(HEADER_SCREEN_FOUR_CLASS);
  };

  const goToValidation = function (provider, records) {
    // switch the screens
    screens.willContent.classList.add(window.util.HIDDEN);
    screens.validation.classList.remove(window.util.HIDDEN);

    // update the progress
    progressBarScreenFour.classList.remove(STEP_ACTIVE);
    progressBarScreenFour.classList.add(STEP_DONE);
    progressBarScreenFive.classList.add(STEP_ACTIVE);

    // updated titles
    progressMobile.innerText = PROGRESS_TEXT_SCREEN_FIVE;
    stepInfoTitle.innerText = SCREEN_FIVE_TITLE_MOB;

    // show will content
    //todo: fill the table 'will-resume__list' from records
    //todo: fill the 'will-resume__summary's from provider
  };

  const submitValidation = function () {
    screens.modalConfirm.classList.remove(CLOSED);

    if (mobileWidth.matches) {
      window.ui.screens.validation.classList.add(window.util.HIDDEN);
    }
  };

  const cancelConfirmation = function () {
    screens.modalConfirm.classList.add(CLOSED);

    if (mobileWidth.matches) {
      window.ui.screens.validation.classList.remove(window.util.HIDDEN);
    }
  };

  const submitConfirmation = function (e) {
    e.preventDefault();
    screens.modalConfirm.classList.add(CLOSED);
    screens.modalResult.classList.remove(CLOSED);
  };

  const delegate = {
    // on the beneficiary screen
    canGoToWillContent,
    //showBenficiaryInfoError,
    goToWillContent,

    // on the will content screen
    canGoToValidation,
    //showWillContentError,
    goToValidation,

    // on the validation screen
    submitValidation,

    // on the confirmation screen
    cancelConfirmation,
    submitConfirmation
  };

  window.ui = {
    delegate,
    screens
  }
})();
