const Crypto = require('wcrypto');
const EthUtil = require('ethereumjs-util');
const Transaction = require('ethereumjs-tx');
const rpc = require('ethrpc');
const abi = require('ethereumjs-abi');
const BN = require('bn.js');
const keccak256 = require('js-sha3').keccak256;

function promisify(fn) {
  const asyncFn = (args) => {
    const promise = new Promise( (resolve, reject) => {
      const ret = fn(args, (result) => {
        resolve(result);
      });
      if (ret) reject();
    });
    return promise;
  };
  return asyncFn;
}

$( () => {
  // State
  const providerParams = {};
  const theState = {};

  const connectionConfiguration = {
    httpAddresses: [WPlatformConfig.gethUrl],
    wsAddresses: [],
    ipcAddresses: [],
    networkID: 99,
    connectionTimeout: 3000,
    errorHandler: function (err) { /* out-of-band error */ },
  };
  rpc.connect(connectionConfiguration, (err) => {
    if (err) {
      console.error("Failed to connect to Ethereum node: " + err);
    } else {
      console.log("Connected to Ethereum node!");
    }
  });

  // Helper methods
  function requestServer(url, settings) {
    const promise = $.ajax(url, settings).done( (response) => {
      console.log(`${url}: ${ JSON.stringify(response) }`);
      return Promise.resolve(response);
    }).fail( (error) => {
      console.error(`${url}: ${ JSON.stringify(error) }`);
      return Promise.reject(error);
    });
    return promise;
  };

  // Button actions handlers
  $('#find-beneficiary').click( (e) => {
    // request a public key if exists
    theState.beneficiaryAddress = $('#beneficiary-address').val();
    theState.beneficiaryContact = $('#beneficiary-contact').val();
    const benAddr = new BN(theState.beneficiaryAddress.slice(2), 16);
    const benBuff = EthUtil.toBuffer(benAddr);
    theState.beneficiaryAddressHash = new BN(keccak256(benBuff), 16);

    const url = `${WPlatformConfig.apiUrl}/key/public?address=${theState.beneficiaryAddress}`;
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

    if (typeof Storage && sessionStorage.userPrivateKey != theState.userPrivateKey) {
      sessionStorage.userPrivateKey = theState.userPrivateKey;
    }

    $('#user-address').text(theState.userAddress);
  });

  $('#request-key').click( (e) => {
    // pass the user's address to the provider and get server's public key
    const url = `${providerParams.provider.url}/setup-will`;
    const data = {
      address: theState.userAddress,
      will: providerParams.will,
      token: providerParams.token
    };
    requestServer(url, { method: 'POST', contentType: 'application/json', data: JSON.stringify(data) }).then( (response) => {
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

    //todo: just for debug
    /*
    let willContent = '';
    for (let idx in theState.willRecords) {
      willContent += `${idx}: ${theState.willRecords[idx]}<br />`;
    }
    $('#will-confirmation-content').html(willContent);
    UIkit.modal('#will-confirmation-dialog').show();
    return;
    */

    const wcrypto = new Crypto.WCrypto();
    wcrypto.encrypt(theState.willContent,
                    theState.userPrivateKey,
                    theState.beneficiaryPublicKey)
    .then( (enc) => {
      theState.beneficiaryIV = enc.iv;
      theState.beneficiaryEncrypted = enc.encrypted;
      const payload = JSON.stringify({
        beneficiaryAddress: theState.beneficiaryAddress,
        beneficiaryContact: theState.beneficiaryContact,
        encryptionIV: theState.beneficiaryIV,
        encryptedWill: theState.beneficiaryEncrypted
      });
      return wcrypto.encrypt(payload,
                             theState.userPrivateKey,
                             theState.platformPublicKey);
    }).then( (enc) => {
      theState.platformIV = enc.iv;
      theState.platformEncrypted = enc.encrypted;
      const payload = {
        encryptionIV: theState.platformIV,
        encryptedWill: theState.platformEncrypted
      };
      $('#encrypted-will').text(theState.platformEncrypted);

      theState.encryptedWill = payload;
      let willContent = '';
      for (let idx in theState.willRecords) {
        willContent += `${idx}: ${theState.willRecords[idx]}<br />`;
      }
      $('#will-confirmation-content').html(willContent);
      UIkit.modal('#will-confirmation-dialog').show();
    });

    return;
  });

  $('#confirm-will').click( (e) => {
    // upload the will into SWARM & generate a transaction
    const url = `${WPlatformConfig.swarmUrl}/bzz:/`;
    let rawTx = {};
    requestServer(url, { method: 'POST', contentType: 'application/json', data: JSON.stringify(theState.encryptedWill) }).then( (response) => {
      if (typeof response.error !== 'undefined') {
        return Promise.reject(response.error);
      }

      //todo: check if needs to add 0x at the beggining
      const storageId = response;
      console.log('confirmed the will: ' + storageId);

      // generate & sign the ethereum transaction
      const willId = (new BN(providerParams.address.slice(2), 16)).iushln(96).iadd(new BN(providerParams.will)).toString(16);
      console.log('willid is ' + willId);
      const payload = abi.simpleEncode('createWill(uint256,uint256,uint256,address)',
        `0x${willId}`,
        `0x${storageId}`,
        theState.beneficiaryAddressHash,
        providerParams.address);
      rawTx = {
        nonce: 0,
        gasPrice: 21.0e+9,
        gasLimit: 0,
        to: WPlatformConfig.contractAddress,
        value: 15.0e+18,
        data: payload,
        chainId: 99
      };
      const tx = new Transaction(rawTx);
      rawTx.gasLimit = tx.getBaseFee();
      const promise = new Promise( (resolve, reject) => {
        const privBN = new BN(theState.userPrivateKey.slice(2), 16);
        const privBF = EthUtil.toBuffer(privBN);
        rpc.packageAndSignRawTransaction(rawTx, theState.userAddress, privBF, (result) => {
          if (result.error) reject(result);
          else resolve(result);
        });
      });

      return promise;
    }).then( (tx) => {
      theState.signedTx = tx;

      $('#transaction-confirmation-content').text(`You are about to send ${rawTx.value / 1.0e+18} ethers to contract ${rawTx.to}. Are you sure?`);
      UIkit.modal('#transaction-confirmation-dialog').show();
    }).catch( (error) => {
      console.error(error);
      //todo: show the error
    });

    return;
  });

  $('#confirm-transaction').click( (e) => {
    // send the transaction to the network
    promisify(rpc.eth.sendRawTransaction)([theState.signedTx]).then( (txId) => {
      theState.txId = txId;

      $('#transaction-verification-content').text(`${txId}`);
      $('#transaction-verification-content').attr('href', `https://etherscan.io/tx/${txId}`);
      UIkit.modal('#transaction-verification-dialog').show();
    }).then( () => {
      //todo: just for debug
      return promisify(rpc.eth.getTransactionByHash)([theState.txId]);
    }).then( (txReceipt) => {
      console.log(txReceipt);
    });

    return;
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

  function initUserWallet() {
    if (typeof Storage && sessionStorage.userPrivateKey) {
      $('#user-private-key').val(sessionStorage.userPrivateKey);
      $('#unlock-wallet').click();
    }
  };

  function addWillRow() {
    const willRow = $('#template-will-row').html();
    const compiledWillRow = Handlebars.compile(willRow);

    $('#will-table').append(compiledWillRow({}));
  };

  configureProviderParams(window.location.search.slice(1));
  initUserWallet();
  addWillRow();
});
