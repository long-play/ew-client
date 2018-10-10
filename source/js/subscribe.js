(function () {
  const ERROR = 'input-field--error';
  const EMPTY_FIELD = 'Please fill in this line';
  const NOT_VALID = 'Please type the valid email';
  const EMAIL_REGEXP = /^(|(([A-Za-z0-9]+_+)|([A-Za-z0-9]+\-+)|([A-Za-z0-9]+\.+)|([A-Za-z0-9]+\++))*[A-Za-z0-9]+@((\w+\-+)|(\w+\.))*\w{1,63}\.[a-zA-Z]{2,6})$/;
  const subsBtns = document.querySelectorAll('.subscribe-form__submit');
  const subsFields = document.querySelectorAll('input[type=email]');
  const subsInputs = document.querySelectorAll('.input-field');
  const errorTexts = document.querySelectorAll('.input-field__err-txt');

  for (let i = 0; i < subsBtns.length; i++) {
    subsBtns[i].addEventListener('click', function (evt) {
      if (subsFields[i].value === '' || !subsFields[i].value.match(EMAIL_REGEXP)) {
        evt.preventDefault();
        subsInputs[i].classList.add(ERROR);

        if (subsFields[i].value === '') {
          errorTexts[i].textContent = EMPTY_FIELD;
        } else if (!subsFields[i].value.match(EMAIL_REGEXP)) {
          errorTexts[i].textContent = NOT_VALID;
        }
      }
    });
  }

  for (let i = 0; i < subsInputs.length; i++) {
    subsFields[i].addEventListener('focus', function () {
      subsInputs[i].classList.remove(ERROR);
    })
  }

})();
