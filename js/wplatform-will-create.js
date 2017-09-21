const Crypto = require('wcrypto');
const EthUtil = require('ethereumjs-util');
const Web3 = require('web3');

$( () => {
  // State
  const apiHost = 'http://localhost:1337';
  const nodeHost = 'http://localhost:8545';
  const providerParams = {};
  const theState = {};
  const web3 = new Web3(new Web3.providers.HttpProvider(nodeHost));

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
    //todo: replace with rpc call to geth
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
    theState.userAddress = '0x' + EthUtil.privateToAddress(theState.userPrivateKey).toString('hex');
    $('#user-address').text(theState.userAddress);
  });

  $('#request-key').click( (e) => {
    // pass the user's address to the provider and get server's public key
    const url = `${providerParams.provider.url}/setup-will?address=${theState.userAddress}&will=${providerParams.will}&token=${providerParams.token}`;
    requestServer(url).then( (response) => {
      //todo: verify signature & willId
      const isSigned = (response.signature == '//todo:');
      if (isSigned !== true) {
        return Promse.reject( /* error */ );
      } else if (providerParams.will != response.will) {
        return Promse.reject( /* error */ );
      }

      $('#platform-public-key').text(response.key);
      $('#platform-public-key-error').text('');
      theState.platformPublicKey = response.key;
    }).catch( (error) => {
      $('#platform-public-key').text('');
      $('#platform-public-key-error').text(error.statusText);
    });
  });

  $('#create-will').click( (e) => {
    // construct, encrypt the will and show confirmation modal dialog
    theState.willRecords = {};
    $('tr[name="will-record"]').each( (idx, record) => {
      const name = $($(record).find('input')[0]).val();
      const value = $($(record).find('input')[1]).val();

      if (name.length == 0 || value.length == 0) return;

      theState.willRecords[name] = value;
    });
    theState.willContent = JSON.stringify(theState.willRecords);

    $('#will-confirmation-content').text(theState.willContent);
    UIkit.modal('#will-confirmation-dialog').show();

    const wcrypto = new Crypto.WCrypto();
    wcrypto.encrypt(theState.willContent,
                    theState.userPrivateKey,
                    theState.beneficiaryPublicKey)
    .then( (enc) => {
      theState.beneficiaryIV = enc.iv;
      theState.beneficiaryEncrypted = enc.encrypted;
      //todo: compose encrypted & IV and then pass it to the encrypt
      // including beneficiary address
      return wcrypto.encrypt(theState.beneficiaryEncrypted,
                             theState.userPrivateKey,
                             theState.platformPublicKey);
    }).then( (enc) => {
      theState.platformIV = enc.iv;
      theState.platformEncrypted = enc.encrypted;
      $('#encrypted-will').text(theState.platformEncrypted);

      //todo: compose willContent + platformIV;
      theState.encryptedWill = theState.willContent;
      $('#will-confirmation-content').text(theState.willContent);
      UIkit.modal('#will-confirmation-dialog').show();
    });
  });

  $('#confirm-will').click( (e) => {
    // upload the will into SWARM & generate a transaction
    console.log('confirmed the will');

    //todo: generate & sign the ethereum transaction
    $('#transaction-confirmation-content').text(theState.willContent);
    UIkit.modal('#transaction-confirmation-dialog').show();
  });

  $('#confirm-transaction').click( (e) => {
    // send the transaction to the network
    console.log('confirmed the transaction');

    //todo: publish the transaction
    $('#transaction-verification-content').text('0x00ff');
    $('#transaction-verification-content').attr('href', 'https://etherscan.io');
    UIkit.modal('#transaction-verification-dialog').show();
  });

  $('#add-will-row').click( (e) => {
    addWillRow();
  });

  // Initialize the page
  function configureProviderParams(query) {
    //todo: lock the screen

    // parse the params & store the PlatformID
    const params = {};
    const queries = query.split('&');
    for (let i = 0; i < queries.length; i++) {
      const split = queries[i].split('=');
      if (split.length != 2) continue;
      params[split[0]] = split[1];
    }
    console.log(params);

    providerParams.address = params['address'];
    providerParams.will = params['will'];
    providerParams.token = params['token'];
    providerParams.signature = params['signature'];

    if (!providerParams.address || !providerParams.will || !providerParams.signature || !providerParams.token) {
      //todo: show UIKit warning
      alert('Missing some provider\'s parameters');
      return;
    }

    const msg = `${providerParams.address}:${providerParams.will}:${providerParams.token}`;
    //todo: request public key by address
    //todo: check the signature virify(msg, signature, pubkey)
    const isSigned = (providerParams.signature == '//todo:');
    if (isSigned !== true) {
      //todo: show UIKit warning
      alert('The provider\'s signature is corrupted!');
      return;
    }

    // request a provider info
    //todo: get swarm id from the contract and request its content
    requestServer('swarm/providers.json').then( (response) => {
      providerParams.provider = response.providers[providerParams.address];
      //todo: unlock the screen
    }).catch( (error) => {
      //todo: show UIKit error
      alert(error);
    });
  };

  function addWillRow() {
    const willRow = $('#template-will-row').html();
    const compiledWillRow = Handlebars.compile(willRow);

    $('#will-table').append(compiledWillRow({}));
  };

  configureProviderParams(window.location.search.slice(1));
  addWillRow();
});
