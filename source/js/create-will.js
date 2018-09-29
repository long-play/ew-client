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
  const RESUME_TEXT = 'will-resume__size--no-file';

  const screens = {
    // screens
    beneficiaryInfo: document.querySelector('.steps__step-3'),
    willContent: document.querySelector('.steps__step-4'),
    validation: document.querySelector('.steps__step-5'),

    // controls
    modalConfirm: document.querySelector('.modal--confirm'),
    modalResult: document.querySelector('.modal--success'),
    modalError: document.querySelector('.modal--error'),
    modalRecord: document.querySelector('.modal--record'),

    toWillContent: document.querySelector('.to-step-4'),
    toValidation: document.querySelector('.to-step-5'),
    backToWillContent: document.querySelector('.back-to-wills')
  };
  screens.willTitle = screens.beneficiaryInfo.querySelector('input[name=will-title]');
  screens.authTypeSelector = screens.beneficiaryInfo.querySelector('select[name=auth-type]');
  screens.beneficiaryAddress = screens.beneficiaryInfo.querySelector('input[name=ben-address]');
  screens.validationValidate = screens.validation.querySelector('.steps__submit');
  screens.modalConfirmCancel = screens.modalConfirm.querySelector('.modal__button[name=cancel]');
  screens.modalConfirmSubmit = screens.modalConfirm.querySelector('.modal__button[name=submit]');

  const beneficiaryAddressBlock = screens.beneficiaryInfo.querySelector('.steps__form-beneficiary-address');
  const beneficiaryAddressTipCreate = screens.beneficiaryInfo.querySelector('#steps__tip-create-address');
  const beneficiaryAddressTipNotImpl = screens.beneficiaryInfo.querySelector('#steps__tip-not-implemented');
  const generateKeyPairLink = document.querySelector('.generate-address__link');
  const benEmail = screens.beneficiaryInfo.querySelector('input[name=ben-email]');
  const benPhone = screens.beneficiaryInfo.querySelector('input[name=ben-phone]');
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
  const summaryList = document.querySelector('.will-resume__list');
  const summaryProviderName = document.querySelector('.will-resume__provider-name');
  const summaryConfirmType = document.querySelector('.will-resume__confirm-type');
  const summarySubsPeriod = document.querySelector('.will-resume__subs-period');
  const summaryTotalFee = document.querySelector('.will-resume__total-fee');
  const modalConfirmAmount = document.querySelector('.modal__amount');
  const modalConfirmProvider = document.querySelector('.modal__text--provider');
  const closeModalRecord = document.querySelector('.record__close');
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

  generateKeyPairLink.addEventListener('click', (e) => {
    screens.authTypeSelector.value = 'generate_new_address';
    screens.authTypeSelector.dispatchEvent(new Event('change'));
    e.preventDefault();
  });

  const canGoToWillContent = function () {
    let error = null;
    const title = screens.willTitle.value;
    const authType = screens.authTypeSelector.value;

    if (benEmail.value === '') {
      const benEmailParent = benEmail.parentElement;
      benEmailParent.classList.add(ERROR);
      benEmail.focus();
      benEmail.addEventListener('input', onInputRemoveError);
      error = new window.EWillError('Please, fill the beneficiary contacts field', 100);
    } else if (authType === 'generate_new_address') {       // generate_new_address
      // do nothing. Everything is okay
    } else if (authType === 'generate_from_questions') {    // generate_from_questions
      // not implemented yet. Generate an error
      error = new window.EWillError('Sorry. The feature is not implemented yet. But it will appear soon.', 101);
    } else if (screens.beneficiaryAddress.value === '') {   // existing_address
      // require a beneficiary address
      const addressParent = screens.beneficiaryAddress.parentElement;
      addressParent.classList.add(ERROR);
      screens.beneficiaryAddress.focus();
      screens.beneficiaryAddress.addEventListener('input', onInputRemoveError);
      error = new window.EWillError('Please, fill the beneficiary address field', 102);
    }

    return {
      error,
      title,
      result: (error === null),
      contacts: {
        email: benEmail.value,
        phone: benPhone.value
      },
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
        record.file = fileInput.files[0];
        record.value = '';
      } else {
        record.value = null;
      }

      if (record.type === 'text' && record.title === null) {
        title.parentElement.classList.add(ERROR);
        title.focus();
        title.addEventListener('input', onInputRemoveError);
      }

      if (record.type == null || record.title == null || record.value == null) {
        error = new window.EWillError('One of the records is incomplete or empty. Please, fill it or delete.', 103);
      }

      records.push(record);
    }

    return {
      error,
      result: (error === null),
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
    const fragment = document.createDocumentFragment();
    const summaryTemplate = document.querySelector('template').content.querySelector('.will-resume__item');

    function formatFileSize(size) {
      const exp = parseInt(Math.floor(Math.log10(size) / 3));
      const names = ['bytes', 'KB', 'MB', 'GB', 'TB'];
      return `${Math.round(10 * size / Math.pow(1000, exp)) / 10} ${names[exp]}`
    }

    function countTextSize(title, text) {
      return (title.length + text.length);
    }

    function formatPeriod(period) {
      const measure = period > 1 ? 'years' : 'year';
      return `${period} ${measure}`;
    }

    for (let record of records) {
      const summaryItem = summaryTemplate.cloneNode(true);
      const summaryInfo = summaryItem.querySelector('.will-resume__info');
      const summarySize = summaryItem.querySelector('.will-resume__size');
      const symbols = countTextSize(record.title, record.value);

      if (record.type === 'text') {
        summaryInfo.textContent = `${record.title}`;
        summarySize.classList.add(RESUME_TEXT);
        summarySize.textContent = `${formatFileSize(symbols)}`;
      } else if (record.type === 'file') {
        summaryInfo.textContent = `${record.title}`;
        summarySize.textContent = `${formatFileSize(record.value.length)}`;
      }

      summaryItem.addEventListener('click', function () {
        screens.modalRecord.classList.remove(CLOSED);

        const modalTitle = screens.modalRecord.querySelector('.record__value--title');
        const modalValue = screens.modalRecord.querySelector('.record__value--value');
        const screen = screens.modalRecord.querySelector('.modal__overlay');

        if (record.type === 'text') {
          modalTitle.textContent = `${record.title}`;
          modalValue.textContent = `${record.value}`;
          modalValue.classList.add('record__value--text');
        } else if (record.type === 'file') {
          modalTitle.textContent = `${record.title}`;
          modalValue.textContent = `${record.file.name}`;
          modalValue.classList.add('record__value--file');
        }

        function closeModal () {
          screens.modalRecord.classList.add(CLOSED);
          modalValue.classList.remove('record__value--file');
          modalValue.classList.remove('record__value--text');
        }

        closeModalRecord.addEventListener('click', closeModal);
        screen.addEventListener('click', closeModal);
      });

      fragment.appendChild(summaryItem);
    }

    summaryList.appendChild(fragment);

    summaryProviderName.textContent = provider.extraInfo.name;
    summaryConfirmType.textContent = provider.extraInfo.tags;
    summarySubsPeriod.textContent = formatPeriod(provider.params.period);
    summaryTotalFee.textContent = `$${(provider.params.period * provider.info.centPrice.fee - provider.info.centPrice.subsidy) / 100}`;
  };

  const goBackToWills = function () {

    // clean summary list
    while (summaryList.firstChild) {
      summaryList.removeChild(summaryList.firstChild);
    }

    // switch the screens
    screens.willContent.classList.remove(window.util.HIDDEN);
    screens.validation.classList.add(window.util.HIDDEN);

    // update the progress
    progressBarScreenFour.classList.add(STEP_ACTIVE);
    progressBarScreenFour.classList.remove(STEP_DONE);
    progressBarScreenFive.classList.remove(STEP_ACTIVE);

    // updated titles
    stepInfoText.innerText = infoTextScreenFour;
    stepInfoTitle.innerText = SCREEN_FOUR_TITLE_MOB;
    progressMobile.innerText = PROGRESS_TEXT_SCREEN_FOUR;

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

    if (err.popup === true) {
      screens.modalError.classList.remove(CLOSED);
      const modalTitle = screens.modalError.querySelector('.modal__title');
      const modalText = screens.modalError.querySelector('.modal__text');
      const cancel = screens.modalError.querySelector('.modal__button');

      cancel.addEventListener('click', function () {
        screens.modalError.classList.add(CLOSED)
      });

      modalTitle.innerText = title;
      modalText.innerText = text;
    }

    console.error(title + ': ' + text);
  };

  const showBenficiaryInfoError = function (err) {
    showError('Beneficiary Information', err);
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
    goBackToWills,

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
