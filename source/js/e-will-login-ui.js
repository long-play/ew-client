(function () {
  const loginPKPrivKey = document.querySelector('#login-pk-privkey');
  const loginKSKeystore = document.querySelector('#login-ks-keystore');
  const loginKSPassword = document.querySelector('#login-ks-password');

  const ewill = new window.EWillLogin();
  window.ewill = ewill;

  const handleSucessfulLogin = function() {
    const query = window.location.search.slice(1);
    const params = {};
    const queries = query.split('&');
    for (let i = 0; i < queries.length; i++) {
      const split = queries[i].split('=');
      if (split.length != 2) continue;
      params[split[0]] = split[1];
    }

    const redirectTo = params['redirect'] ? params['redirect'] : 'create-will.html';
    location.href = `${redirectTo}?${query}`;
  }

  document.querySelector('#login-pk').addEventListener('click', (e) => {
    if (ewill.loginWithPrivateKey(loginPKPrivKey.value) === true) {
      handleSucessfulLogin();
    }
    e.preventDefault();
  });

  document.querySelector('#login-ks').addEventListener('click', (e) => {
    let keystoreJson = null;
    const reader = new FileReader();
    reader.onload = function() {
      if (ewill.loginWithKeystore(reader.result, loginKSPassword.value) === true) {
        handleSucessfulLogin();
      }
      else {
        //todo: show error
      }
    };
    reader.readAsText(loginKSKeystore.files[0]);

    e.preventDefault();
  });
})();
