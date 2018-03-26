const keccak256 = require('js-sha3').keccak256;
const EthUtil = require('ethereumjs-util');
const Crypto = require('wcrypto');
const Web3 = require('web3');
const BN = require('bn.js');

$( () => {
  // State
  const willStateNames = [ 'None', 'Created', 'Activated', 'Pending', 'Claimed', 'Declined' ];
  const theState = {};

  const web3 = new Web3(WPlatformConfig.gethUrl);

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

  function requestAllWills() {
    const wills = [];
    const promises = [];

    const promise = ewPlatform.methods.numberOfUserWills(theState.userAccount.address).call().then( (numberOfWills) => {
      for (let idx = 0; idx < numberOfWills; idx++) {
        const promise = ewPlatform.methods.userWills(
          theState.userAccount.address,
          idx
        ).call().then( (willId) => {
          return ewPlatform.methods.wills(willId).call();
        }).call().then( (will) => {
          wills.push(will);
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    }).then( () => {
      return Promise.resolve(wills);
    });

    return promise;
  };

  // Button actions handlers
  $('#unlock-wallet').click( (e) => {
    // unlock a user's wallet & extract the private key
    theState.userPrivateKey = $('#user-private-key').val();
    theState.userAddress = '0x' + EthUtil.privateToAddress(theState.userPrivateKey).toString('hex');

    if (typeof Storage && sessionStorage.userPrivateKey != theState.userPrivateKey) {
      sessionStorage.userPrivateKey = theState.userPrivateKey;
    }

    $('#user-address').text(theState.userAddress);

    requestAllWills().then( (wills) => {
      console.log(wills);
      const willsData = { wills: [] };

      for (let idx in wills) {
        const will = {
          willId: wills[idx].willId.toString(16),
          annualFee: wills[idx].annualFee.toString(10),
          state: wills[idx].state.toString(10),
          stateName: willStateNames[wills[idx].state.toString(10)],
          validTill: wills[idx].validTill.toString(10),
        };
        willsData.wills.push(will);
      }

      Handlebars.registerHelper('maskBN', (arg) => {
        return arg.slice(0, 6) + '..' + arg.slice(-6);
      });

      Handlebars.registerHelper('weiToEth', (arg) => {
        return parseFloat(arg) / 1.0e+18;
      });

      Handlebars.registerHelper('formatDate', (arg) => {
        return moment.unix(arg).format('LLL');
      });

      const willsTemplate = $('#template-wills').html();
      const table = Handlebars.compile(willsTemplate);

      const container = $('#container-wills')[0];
      container.innerHTML = table(willsData);
    });
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

  function requestValidProviders(addresses) {
    const promises = addresses.map( (addr) => {
      return ewEscrow.methods.isProviderValid(addr).call().then( (isValid) => {
        return isValid ? ewEscrow.methods.providers(addr).call() : Promise.resolve({ invalid: true });
      });
    });
    const promise = Promise.all(promises).then( (providersInfo) => {
      return Promise.resolve(providersInfo.filter( pi => !pi.invalid ));
    });
    return promise;
  };

  function initProvidersTable() {
    const promise = ewEscrow.getPastEvents('Registered', { fromBlock: '0x1' }).then( (events) => {
      return requestValidProviders(events.map( ev => ev.returnValues.provider ));
    }).then( (providersInfo) => {
      const promises = providersInfo.map( (providerInfo) => {
        const info = new BN(providerInfo.info, 10);
        return $.getJSON(`${WPlatformConfig.swarmUrl}/bzz:/${info.toString('hex')}/`);
      });
      return Promise.all(promises);
    }).then( (providersInfo) => {
      const providersData = { providers: providersInfo };
      const providers = $('#template-providers').html();
      const table = Handlebars.compile(providers);
      const container = $('#container-providers')[0];
      container.innerHTML = table(providersData);
    });
    return promise;
  };

  function initUserWallet() {
    if (typeof Storage && sessionStorage.userPrivateKey) {
      $('#user-private-key').val(sessionStorage.userPrivateKey);
      $('#unlock-wallet').click();
    }
  };

  //todo: lock the screen
  configureContract().then( () => {
    initUserWallet();
    return initProvidersTable();
    //todo: unlock the screen
  }).catch( (error) => {
    //todo: show UIKit error
    alert(error);
  });
});
