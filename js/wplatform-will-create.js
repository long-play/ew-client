const Crypto = require('wcrypto');

$( () => {
  // State
  const apiHost = 'http://localhost:1337';
  const theState = {};

  // Helper methods
  function requestServer(url) {
    const promise = $.ajax(url).done( (response) => {
      console.log(`${url}: ${ JSON.stringify(response) }`);
      return Promise.resolve(response);
    }).fail( (error) => {
      console.error(`${url}: ${ JSON.stringify(error) }`);
      return Promise.reject(error);
    });
    return promise;
  };

  function generateTx() {
    // generate smart-contract function call transaction
  };

  // Button actions handlers
  $('#find-beneficiary').click( (e) => {
    // request a public key if exists
    theState.beneficiaryAddress = $('#beneficiary-address').val();
    const url = `${apiHost}/key/public?address=${theState.beneficiaryAddress}`;
    requestServer(url).then( (response) => {
      //todo: check if exists and warn a user if does not
      $('#beneficiary-public-key').text(response.publicKey);
      $('#beneficiary-public-key-error').text('');
      theState.beneficiaryPublicKey = response.publicKey;
    }).catch( (error) => {
      $('#beneficiary-public-key').text('');
      $('#beneficiary-public-key-error').text(error.statusText);
    });
  });

  $('#unlock-wallet').click( (e) => {
    // unlock a user's wallet & extract the private key
    theState.userPrivateKey = $('#user-private-key').val();
    theState.userAddress = '';
  });

  $('#request-key').click( (e) => {
    // pass the user's address to the server and get server's public key
    const url = `${apiHost}/key/encryption?address=${theState.userAddress}`;
    requestServer(url).then( (response) => {
      $('#platform-public-key').text(response.publicKey);
      $('#platform-public-key-error').text('');
      theState.platformPublicKey = response.publicKey;
    }).catch( (error) => {
      $('#platform-public-key').text('');
      $('#platform-public-key-error').text(error.statusText);
    });
  });

  $('#create-will').click( (e) => {
    // construct, encrypt the will and show confirmation modal dialog
    theState.willContent = $('#will-content').val();
    const wcrypto = new Crypto.WCrypto();
    wcrypto.encrypt(theState.willContent,
                    theState.userPrivateKey,
                    theState.beneficiaryPublicKey)
    .then( (enc) => {
      theState.beneficiaryIV = enc.iv;
      theState.beneficiaryEncrypted = enc.encrypted;
      //todo: concatinate encrypted & IV and then pass it to the encrypt
      // concat beneficiary address
      return wcrypto.encrypt(theState.beneficiaryEncrypted,
                             theState.userPrivateKey,
                             theState.platformPublicKey);
    }).then( (enc) => {
      theState.platformIV = enc.iv;
      theState.platformEncrypted = enc.encrypted;
      $('#encrypted-will').text(theState.platformEncrypted);
    });
  });

  $('#confirm-will').click( (e) => {
    // upload the will into SWARM & generate a transaction
  });

  $('#publish-will').click( (e) => {
    // sign & send the transaction to the network
  });

  $('#add-will-row').click( (e) => {
    addWillRow();
  });

  // Initialize the page
  function configurePlatformId(query) {
    // parse the params & store the PlatformID
    const params = {};
    const queries = query.split('&');
    for (let i = 0; i < queries.length; i++) {
      const split = queries[i].split('=');
      if (split.length != 2) continue;
      params[split[0]] = split[1];
    }
    console.log(params);
  };

  function addWillRow() {
    const willRow = $('#template-will-row').html();
    const compiledWillRow = Handlebars.compile(willRow);

    $('#will-table').append(compiledWillRow({}));
  };

  configurePlatformId(window.location.search.slice(1));
  addWillRow();
});
