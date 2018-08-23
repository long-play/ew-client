(function () {
  const forms = document.querySelectorAll('.subscribe-form');
  const link = document.getElementById('subscribe-link');
  const emailField = document.getElementById('subscribe-1');

  const subscribe = (email) => {
    return firebase.firestore().collection('subscribers').add({
      email: email
    });
  };

  forms.forEach( (form, idx, list) => {
    form.addEventListener('submit', (e) => {
      const email = form.querySelector('.subscribe-form-email');
      subscribe(email.value).then( (result) => {
        alert('Your e-mail has been added to the mailing list');
        console.log(result);
      }).catch( (err) => {
        console.log(err);
      });
      email.value = '';
      e.preventDefault();
      return false;
    });
  });

  if (link && emailField) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      emailField.focus();
    });
  }
})();


