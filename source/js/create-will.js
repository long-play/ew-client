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
    // screens
    beneficiaryInfo: document.querySelector('.steps__step-3'),
    willContent: document.querySelector('.steps__step-4'),
    validation: document.querySelector('.steps__step-5'),

    // controls
    modalConfirm: document.querySelector('.modal--confirm'),
    modalResult: document.querySelector('.modal--success'),

    toWillContent: document.querySelector('.to-step-4'),
    toValidation: document.querySelector('.to-step-5')
  };
  screens.authTypeSelector = screens.beneficiaryInfo.querySelector('select[name=auth-type]');
  screens.beneficiaryAddress = screens.beneficiaryInfo.querySelector('input[name=address]');
  //todo: screens.validationBack = ...
  screens.validationValidate = screens.validation.querySelector('.steps__submit');
  screens.modalConfirmCancel = screens.modalConfirm.querySelector('.modal__button[name=cancel]');
  screens.modalConfirmSubmit = screens.modalConfirm.querySelector('.modal__button[name=submit]');

  const beneficiaryAddressBlock = screens.beneficiaryInfo.querySelector('.steps__form-beneficiary-address');
  const beneficiaryAddressTipCreate = screens.beneficiaryInfo.querySelector('#steps__tip-create-address');
  const beneficiaryAddressTipNotImpl = screens.beneficiaryInfo.querySelector('#steps__tip-not-implemented');
  const user = screens.beneficiaryInfo.querySelector('input[name=user]');
  const header = document.querySelector('.header--will');
  const progressMobile = document.querySelector('.step-info__progress-mobile');
  const progressBarScreenThree = document.querySelector('.progress__item:nth-child(3)');
  const progressBarScreenFour = document.querySelector('.progress__item:nth-child(4)');
  const progressBarScreenFive = document.querySelector('.progress__item:nth-child(5)');
  const stepInfoTitle = document.querySelector('.step-info__title');
  const stepInfoText = document.querySelector('.step-info__text');
  const infoTextScreenFour = 'Fill in any information you want to pass to the beneficiary after your death. It could be logins, passwords or files';
  const infoTextScreenFive = 'Check please carefully if all the being input information is correct and confirm will creation';
  const mobileWidth = window.matchMedia('(max-width: 767px)');
  const summaryProviderName = document.querySelector('.will-resume__provider-name');
  const summaryConfirmType = document.querySelector('.will-resume__confirm-type');
  const summaryAnnualFee = document.querySelector('.will-resume__annual-fee');
  const modalConfirmAmount = document.querySelector('.modal__amount');
  const modalConfirmProvider = document.querySelector('.modal__text--provider');
  const etherscanLink = document.querySelector('.modal__link--etherscan');

  const onInputRemoveError = function () {
    const parentElement = this.parentElement;
    parentElement.classList.remove(ERROR);
  };

  const onAuthTypeChanged = function (e) {
    const selectedOption = e.target.value;
    screens.toWillContent.removeAttribute('disabled');
    beneficiaryAddressBlock.classList.add(window.util.HIDDEN);
    beneficiaryAddressTipCreate.classList.add(window.util.HIDDEN);
    beneficiaryAddressTipNotImpl.classList.add(window.util.HIDDEN);

    if (selectedOption == 'existing_address') {
      beneficiaryAddressBlock.classList.remove(window.util.HIDDEN);
      beneficiaryAddressTipCreate.classList.remove(window.util.HIDDEN);
    } else if (selectedOption == 'generate_new_address') {
    } else if (selectedOption == 'generate_from_questions') {
      beneficiaryAddressTipNotImpl.classList.remove(window.util.HIDDEN);
      screens.toWillContent.setAttribute('disabled', true);
    }
  };
  screens.authTypeSelector.addEventListener('change', onAuthTypeChanged);

  const canGoToWillContent = function () {
    let error = null;

    if (screens.beneficiaryAddress.value === '') {
      const addressParent = screens.beneficiaryAddress.parentElement;
      addressParent.classList.add(ERROR);
      screens.beneficiaryAddress.focus();
      screens.beneficiaryAddress.addEventListener('input', onInputRemoveError);
      error = new Error({ code: 101, message: 'Please, fill the beneficiary address field' });
    }

    if (user.value === '') {
      const userParent = user.parentElement;
      userParent.classList.add(ERROR);
      user.focus();
      user.addEventListener('input', onInputRemoveError);
      error = new Error({ code: 102, message: 'Please, fill the beneficiary contacts field' });
    }

    return {
      error,
      result: (error !== null),
      contacts: user.value,
      address:  screens.beneficiaryAddress.value
    };
  };

  const canGoToValidation = function () {
    let error = null;
    const recordRows = screens.willContent.querySelectorAll('.will-block');
    const records = [];

    for (let i = 0; i < recordRows.length; i++) {
      const record = {};
      const title = recordRows[i].querySelector('input[type=text]');
      const textValue = recordRows[i].querySelector('textarea');
      const fileInput = recordRows[i].querySelector('input[type=file]');

      if (recordRows[i].classList.contains(FILE_BLOCK)) {
        record.type = 'file';
      } else if (recordRows[i].classList.contains(TEXT_BLOCK)) {
        record.type = 'text'
      } else {
        record.type == null;
      }

      if (title.value !== '') {
        record.title = title.value;
      } else if (fileInput && fileInput.files.length > 0) {
        record.title = fileInput.files[0].name;
      } else {
        record.title = null;
      }

      if (textValue) {
        record.value = textValue.value;
      } else if (fileInput && fileInput.files.length > 0) {
        record.value = fileInput.files[0];
      } else {
        record.value = null;
      }

      if (record.type == null || record.title == null || record.value == null) {
        error = new Error({ code: 103, message: 'One of the records is incomplete or empty. Please, fill it or delete.' });
      }

      records.push(record);
    }

    return {
      error,
      result: (error !== null),
      records
    };
  };

  const goToWillContent = function (e) {
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
    stepInfoText.innerText = infoTextScreenFive;
    stepInfoTitle.innerText = SCREEN_FIVE_TITLE_MOB;
    progressMobile.innerText = PROGRESS_TEXT_SCREEN_FIVE;

    // show will content
    const summaryList = document.querySelector('.will-resume__list');
    const fragment = document.createDocumentFragment();
    const summaryTemplate = document.querySelector('template').content.querySelector('.will-resume__item');

    function formatFileSize(size) {
      const exp = parseInt(Math.floor(Math.log10(size) / 3));
      const names = ['bytes', 'KB', 'MB', 'GB', 'TB'];
      return `${Math.round(10 * size / Math.pow(1000, exp)) / 10} ${names[exp]}`
    }

    for (let record of records) {
      const summaryItem = summaryTemplate.cloneNode();
      if (record.type === 'text') {
        summaryItem.textContent = `${record.title} / ${record.value}`;
      } else if (record.type === 'file') {
        summaryItem.textContent = `${record.title} (${formatFileSize(record.value.length)})`;
      }
      fragment.appendChild(summaryItem);
    }

    summaryList.appendChild(fragment);

    summaryProviderName.textContent = provider.extraInfo.name;
    summaryConfirmType.textContent = provider.extraInfo.tags;
    summaryAnnualFee.textContent = `$${provider.info.centPrice.fee / 100}`;
  };

  const submitValidation = function (will, e) {
    screens.modalConfirm.classList.remove(CLOSED);

    if (mobileWidth.matches) {
      window.ui.screens.validation.classList.add(window.util.HIDDEN);
    }

    modalConfirmAmount.innerText = `${will.price} ethers`;
    modalConfirmProvider.innerText = will.providerName;
  };

  const cancelConfirmation = function () {
    screens.modalConfirm.classList.add(CLOSED);

    if (mobileWidth.matches) {
      window.ui.screens.validation.classList.remove(window.util.HIDDEN);
    }
  };

  const submitConfirmation = function (txId, e) {
    screens.modalConfirm.classList.add(CLOSED);
    screens.modalResult.classList.remove(CLOSED);
    etherscanLink.href = `https://etherscan.io/tx/${txId}`;
  };

  const showError = function (title, err) {
    let text = '';
    if (typeof err === 'string') {
      text = err;
    } else if (typeof err.message === 'string') {
      text = err.message;
    } else {
      text = 'Unknown error';
    }
    console.error(title + ': ' + text);
  };

  const showBenficiaryInfoError = function (err) {
    showError('Benificiary Information', err);
  };
  const showWillContentError = function (err) {
    showError('Will Content', err);
  };
  const showValidationError = function (err) {
    showError('Will Content Validation', err);
  };
  const showConfirmationError = function (err) {
    showError('Will Creating Confirmation', err);
  };

  const delegate = {
    // on the beneficiary screen
    canGoToWillContent,
    showBenficiaryInfoError,
    goToWillContent,

    // on the will content screen
    canGoToValidation,
    showWillContentError,
    goToValidation,

    // on the validation screen
    submitValidation,
    showValidationError,

    // on the confirmation screen
    cancelConfirmation,
    submitConfirmation,
    showConfirmationError
  };

  window.ui = {
    delegate,
    screens
  }
})();
