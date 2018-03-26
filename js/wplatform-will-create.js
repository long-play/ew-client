const keccak256 = require('js-sha3').keccak256;
const EthUtil = require('ethereumjs-util');
const Crypto = require('wcrypto');
const Web3 = require('web3');
const Tar = require('tar-js');
const BN = require('bn.js');

const templateMeta = {
  poweredBy: 'E-Will Platform',
  version: '1.0'
};

$( () => {
  // State
  const providerParams = {};
  const theState = {};

  const web3 = new Web3(WPlatformConfig.gethUrl);

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

  const fileChangeHandler = (e) => {
    const input = e.target;
    input.fileToUpload = null;
    input.contentToUpload = null;
    if (input.files.length !== 1) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function() {
      input.fileToUpload = file;
      input.contentToUpload = new Uint8Array(reader.result, 0, reader.result.byteLength);
    };
    reader.readAsArrayBuffer(file);
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
      $('#beneficiary-public-key-error').text(`Failed to find beneficiary's public key: ${error.statusText$}. Please try to use another option - create an address or use addressless mechanic.`);
    });
  });

  $('#create-beneficiary').click( (e) => {
    theState.beneficiaryContact = $('#beneficiary-contact').val();

    const benAcc = web3.eth.accounts.create();
    theState.beneficiaryAddress = benAcc.address;
    theState.beneficiaryPrivateKey = benAcc.privateKey;
    theState.beneficiaryPublicKey = EthUtil.bufferToHex(EthUtil.privateToPublic(benAcc.privateKey));
    const benAddr = new BN(theState.beneficiaryAddress.slice(2), 16);
    const benBuff = EthUtil.toBuffer(benAddr);
    theState.beneficiaryAddressHash = new BN(keccak256(benBuff), 16);
    $('#beneficiary-public-key').text(theState.beneficiaryPublicKey);
    $('#beneficiary-public-key-error').text('');

    $('#address-created-content').html(`Please print the card with beneficiary's private key and give it him/her:<br />${theState.beneficiaryPrivateKey}`);
    UIkit.modal('#address-created-dialog').show();
  });

  $('#unlock-wallet').click( (e) => {
    // unlock a user's wallet & extract the private key
    theState.userPrivateKey = $('#user-private-key').val();
    theState.userAccount = web3.eth.accounts.privateKeyToAccount(userPrivateKey);

    if (typeof Storage && sessionStorage.userPrivateKey != theState.userPrivateKey) {
      sessionStorage.userPrivateKey = theState.userPrivateKey;
    }

    $('#user-address').text(theState.userAccount.address);
  });

  $('#request-key').click( (e) => {
    // pass the user's address to the provider and get server's public key
    const url = `${providerParams.provider.url}/setup-will`;
    const data = {
      address: theState.userAccount.address,
      will: providerParams.will,
      token: providerParams.token
    };
    requestServer(url, { method: 'POST', contentType: 'application/json', data: JSON.stringify(data) }).then( (response) => {
      //todo: verify signature & willId
      const isSigned = (response.signature == '//todo:');
      if (isSigned !== true) {
        return Promise.reject( /* error */ );
      } else if (providerParams.will != response.will) {
        return Promise.reject( /* error */ );
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
    const willTar = new Tar();
    theState.willRecords = {};

    // construct, encrypt the will and show confirmation modal dialog
    $('tr[name="will-text-record"]').each( (idx, record) => {
      const name = $($(record).find('input')[0]).val();
      const value = $($(record).find('input')[1]).val();
      if (name.length == 0 || value.length == 0) return;

      //todo: check the validity of the name and its uniqueness
      theState.willRecords[name] = value;
      willTar.append(name, value);
    });

    $('tr[name="will-file-record"]').each( (idx, record) => {
      let name = $($(record).find('input')[0]).val();
      const input = $(record).find('input')[1];
      if (name.length == 0) {
        name = input.fileToUpload.name;
      }

      //todo: check the validity of the name and its uniqueness
      theState.willRecords[name] = input.fileToUpload;
      willTar.append(name, input.contentToUpload);
    });

/*
//======================================================
function uint8ToString(buf) {
    var i, length, out = '';
    for (i = 0, length = buf.length; i < length; i += 1) {
        out += String.fromCharCode(buf[i]);
    }
    return out;
}

const base64 = btoa(uint8ToString(willTar.out));
window.open("data:application/tar;base64," + base64);
return;
//======================================================
*/

    const meta = Object.assign({}, templateMeta);
    const willContent = willTar.append('meta.json', JSON.stringify(meta));
    const wcrypto = new Crypto.WCrypto();
    wcrypto.encrypt(willContent,
                    theState.userPrivateKey,
                    theState.beneficiaryPublicKey)
    .then( (enc) => {
      const encWillTar = new Tar();
      const meta = Object.assign({
        beneficiaryAddress: theState.beneficiaryAddress,
        beneficiaryContact: theState.beneficiaryContact,
        beneficiaryPublicKey: theState.beneficiaryPublicKey,
        encryptionIV: enc.iv,
        owner: theState.beneficiaryAddress
      }, templateMeta);

      encWillTar.append('will.encrypted.tar', enc.encrypted);
      const payload = encWillTar.append('meta.json', JSON.stringify(meta));

      return wcrypto.encrypt(payload,
                             theState.userPrivateKey,
                             theState.platformPublicKey);
    }).then( (enc) => {
      const encWillTar = new Tar();
      const meta = Object.assign({
        encryptionIV: enc.iv,
        owner: providerParams.address
      }, templateMeta);
      $('#encrypted-will').text(enc.encrypted);

      encWillTar.append('will.encrypted.x2.tar', enc.encrypted);
      const payload = encWillTar.append('meta.json', JSON.stringify(meta));
      theState.encryptedWill = new Uint8Array(payload);

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
    let createWill = null;
    requestServer(url, { method: 'POST', contentType: 'application/x-tar', data: /*todo: upload binary data*/theState.encryptedWill }).then( (response) => {
      if (typeof response.error !== 'undefined') {
        return Promise.reject(response.error);
      }

      //todo: check if needs to add 0x at the beggining
      const storageId = response;
      console.log('confirmed the will: ' + storageId);

      // generate & sign the ethereum transaction
      const willId = (new BN(providerParams.address.slice(2), 16)).iushln(96).iadd(new BN(providerParams.will)).toString(16);
      console.log('willid is ' + willId);

      createWill = ewPlatform.methods.createWill(
        `0x${willId}`,
        `0x${storageId}`,
        theState.beneficiaryAddressHash,
        providerParams.address);
      return createWill.estimateGas({ from: theState.userAccount.address });
    }).then( (gasLimit) => {
      const payload = createWill.encodeABI();
      console.log(payload);

      rawTx = {
        to: ewPlatform.options.address,
        data: payload,
        value: 15.0e+18,
        gasLimit: gasLimit,
        chainId: 9
      };
      return theState.userAccount.signTransaction(tx);
    }).then( (tx) => {
      theState.signedTx = tx.rawTransaction;

      $('#transaction-confirmation-content').text(`You are about to send ${rawTx.value / 1.0e+18} ethers to the contract ${rawTx.to}. Are you sure?`);
      UIkit.modal('#transaction-confirmation-dialog').show();
    }).catch( (error) => {
      console.error(error);
      //todo: show the error
    });

    return;
  });

  $('#confirm-transaction').click( (e) => {
    // send the transaction to the network
    const defer = web3.eth.sendSignedTransaction(theState.signedTx);
    defer.once('transactionHash', (txId) => {
      console.log(txId);
      theState.txId = txId;

      $('#transaction-verification-content').text(`${txId}`);
      $('#transaction-verification-content').attr('href', `https://etherscan.io/tx/${txId}`);
      UIkit.modal('#transaction-verification-dialog').show();
    });
    defer.once('receipt', (receipt) => {
      console.log(receipt);
    });
    defer.once('confirmation', (count, receipt) => {
      console.log('confirmed ' + count + ' times');
      console.log(receipt);
    });

    return;
  });

  $('#add-will-text-row').click( (e) => {
    addWillTextRow();
  });

  $('#add-will-file-row').click( (e) => {
    addWillFileRow();
  });

  // Initialize the page
  function configureContract() {
    let abi = null;
    const promise = $.getJSON('abi-platform.json').then( (json) => {
      ewPlatform = new web3.eth.Contract(json, WPlatformConfig.contractPlatformAddress);
      return $.getJSON('abi-escrow.json');
    }).then( (json) => {
      abi = json;
      return ewPlatform.methods.escrowWallet().call();
    }).then( (escrowAddress) => {
      ewEscrow = new web3.eth.Contract(abi, escrowAddress);
      return ewPlatform.methods.name().call();
    }).then( (name) => {
      console.log(`Contract '${name}' is initialized`);
      return ewEscrow.methods.name().call();
    }).then( (name) => {
      console.log(`Contract '${name}' is initialized`);
      return Promise.resolve();
    });
    return promise;
  };

  function configureProviderParams(query) {
    // parse the params & store the PlatformID
    const params = {};
    const queries = query.split('&');
    for (let i = 0; i < queries.length; i++) {
      const split = queries[i].split('=');
      if (split.length != 2) continue;
      params[split[0]] = split[1];
    }
    //todo: remove logs
    console.log(params);

    providerParams.address = params['address'];
    providerParams.will = params['will'];
    providerParams.token = params['token'];
    providerParams.signature = params['signature'];

    if (!providerParams.address || !providerParams.will || !providerParams.signature || !providerParams.token) {
      return Promise.reject('Missing some provider\'s parameters');
    }

    const msg = `${providerParams.address}:${providerParams.will}:${providerParams.token}`;
    //todo: isSigned = (ecrecover(msg, providerParams.signature) == providerParams.address);
    const isSigned = (providerParams.signature == '//todo:');
    if (isSigned !== true) {
      return Promise.reject('The provider\'s signature is corrupted!');
    }

    // request a provider info
    const promise = ewEscrow.methods.providerAddress(providerParams.address).call().then( (address) => {
      providerParams.resolvedAddress = address;
      return ewEscrow.methods.isProviderValid(providerParams.resolvedAddress).call();
    }).then( (isValid) => {
      if (!isValid) {
        return Promise.reject(`The provider ${providerParams.address} is not a valid provider`);
      }
      return ewEscrow.methods.providers(providerParams.resolvedAddress).call();
    }).then( (providerInfo) => {
      //todo: remove logs
      console.log(providerInfo);
      return $.getJSON(`${WPlatformConfig.swarmUrl}/bzz:/${providerInfo.info}/`);
    }).then( (providerInfo) => {
      providerParams.provider = providerInfo;
    });
    return promise;
  };

  function initUserWallet() {
    if (typeof Storage && sessionStorage.userPrivateKey) {
      $('#user-private-key').val(sessionStorage.userPrivateKey);
      $('#unlock-wallet').click();
    }
  };

  function addWillTextRow() {
    const willRow = $('#template-will-text-row').html();
    const compiledWillRow = Handlebars.compile(willRow);

    $('#will-table').append(compiledWillRow({}));
  };

  function addWillFileRow() {
    const willRow = $('#template-will-file-row').html();
    const compiledWillRow = Handlebars.compile(willRow);

    $('#will-table').append(compiledWillRow({}));

    $('input[name="will-file-record-value"]').on('change', fileChangeHandler);
  };

  //todo: lock the screen
  configureContract().then( () => {
    const queryParams = window.location.search.slice(1);
    return configureProviderParams(queryParams);
  }).then( () => {
    initUserWallet();
    addWillTextRow();
    //todo: unlock the screen
  }).catch( (error) => {
    //todo: show UIKit error
    alert(error);
  });
});
