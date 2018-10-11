(function () {
  const CLOSED = 'modal--closed';
  const loader = document.querySelector('.loader--screen');
  const modalError = document.querySelector('.modal--error');

  const willList = document.querySelector('.wills-list');
  const willListItemTemplate = document.querySelector('template').content.querySelector('.will-item');

  const willContent = document.querySelector('.will-content');
  const backLink = willContent.querySelector('.will-content__link');
  const downloadButton = willContent.querySelector('.button--will');
  const willContentTitle = willContent.querySelector('.will-content__item--title').querySelector('.will-content__value');
  const willContentDate = willContent.querySelector('.will-content__item--date').querySelector('.will-content__value');
  const willContentSize = willContent.querySelector('.will-content__item--size').querySelector('.will-content__value');
  const willContentTable = document.querySelector('.will-content__wrapper');
  const willContentItemShortTemplate = document.querySelector('template').content.querySelector('.will-content__item-short');
  const willContentItemLongTemplate = document.querySelector('template').content.querySelector('.will-content__item-long');
  const willContentItemFileTemplate = document.querySelector('template').content.querySelector('.will-content__item-file');

  const query = window.location.search.slice(1);
  const ewill = new window.EWillClaim();
  window.ewill = ewill;

  if (ewill.loginIfPossible() !== true) {
    console.log('not logged in');
    location.href = '/hello.html?redirect=claim-wills.html&' + query;
    return;
  }

  const formatDate = function (arg) {
    if (arg < 101) {
      return 'N/A';
    }
    return moment.unix(arg).format('ll');
  };

  const formatFileSize = function (size) {
    const exp = parseInt(Math.floor(Math.log10(size) / 3));
    const names = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    return `${Math.round(10 * size / Math.pow(1000, exp)) / 10} ${names[exp]}`
  };

  const updateWillList = function (wills) {
    for (let idx in wills) {
      const will = wills[idx];
      const willRow = willListItemTemplate.cloneNode(true);

      const titleDiv = willRow.querySelector('.will-item__item--title');
      titleDiv.querySelector('.will-item__number').innerHTML = `${parseInt(idx) + 1}.`;
      titleDiv.querySelector('.will-item__value').innerHTML = will.owner;
      willRow.querySelector('.will-item__item--date').querySelector('.will-item__value').innerHTML = formatDate(will.updatedAt);
      ewill.getContentSize(will).then( (size) => {
        willRow.querySelector('.will-item__item--size').querySelector('.will-item__value').innerHTML = formatFileSize(size);
      });

      const decryptButton = willRow.querySelector('.button--claim');
      decryptButton.addEventListener('click', (e) => {
        if (will.decrypted === true) {
          showWill(will);
        } else {
          ewill.downloadAndDecrypt(will).then( () => {
            decryptButton.querySelector('span').innerText = 'Open';
            decryptButton.classList.remove('button--green');
            decryptButton.classList.add('button--blue');
            return window.util.stopButtonAnimation(decryptButton);
          }).catch( (err) => {
            showError('Decrypting will', err);
          });
          window.util.startButtonAnimation(decryptButton);
        }
      });

      willList.insertBefore(willRow, null);
    }
  };

  const updateWillContent = function (will) {
    const rows = willContentTable.querySelectorAll('.will-content__item');
    if (rows) {
      for (let r of rows) {
        willContentTable.removeChild(r);
      }
    }

    for (let rec of will.content) {
      let row = null;
      const name = rec.name.replace(/\..*?$/, '');
      if (rec.name.endsWith('.txt') !== true) {
        row = willContentItemFileTemplate.cloneNode(true);
        row.querySelector('.will-content__value').innerHTML = formatFileSize(rec.size);
        row.querySelector('.will-content__file-btn').innerHTML = rec.name;
        row.querySelector('.will-content__file-btn').addEventListener('click', (e) => {
          ewill.saveFileAs(rec.blob);
        });
      } else if (rec.size < 80) {
        row = willContentItemShortTemplate.cloneNode(true);
        row.querySelector('.will-content__value').innerHTML = rec.string;
      } else {
        row = willContentItemLongTemplate.cloneNode(true);
        row.querySelector('.will-content__value').innerHTML = rec.string;
      }
      row.querySelector('.will-content__title').innerHTML = name;

      willContentTable.insertBefore(row, downloadButton);
    }
  };

  const showError = function (title, err) {
    let text = '';
    if (typeof err === 'string') {
      text = err;
    } else if (typeof err.message === 'string') {
      text = err.message;
    } else {
      text = 'Something went wrong. Please, try again.';
    }

    if (err instanceof Error || err.popup === true) {
      modalError.classList.remove(CLOSED);
      const modalTitle = modalError.querySelector('.modal__title');
      const modalText = modalError.querySelector('.modal__text');
      const cancel = modalError.querySelector('.modal__button');

      cancel.addEventListener('click', function () {
        modalError.classList.add(CLOSED)
      });

      modalTitle.innerText = title;
      modalText.innerText = text;
    }

    console.error(title + ': ' + text);
  };

  const showWill = function (will) {
    willList.classList.add(window.util.HIDDEN);
    willContent.classList.remove(window.util.HIDDEN);
    willContent.will = will;
    willContentTitle.innerHTML = will.owner;
    willContentDate.innerHTML = formatDate(will.updatedAt);
    willContentSize.innerHTML = formatFileSize(will.storageSize);
    updateWillContent(will);
  };

  const backToList = function () {
    willList.classList.remove(window.util.HIDDEN);
    willContent.classList.add(window.util.HIDDEN);
  };

  backLink.addEventListener('click', backToList);
  downloadButton.addEventListener('click', () => {
    ewill.saveFileAs(willContent.will.storage);
  });

  ewill.configure().then( () => {
    return ewill.getWills();
  }).then( (wills) => {
    loader.classList.add(window.util.HIDDEN);
    updateWillList(wills);
  }).catch( (err) => {
    loader.classList.add(window.util.HIDDEN);
    showError('Initializing the web app', err);
  });

})();
