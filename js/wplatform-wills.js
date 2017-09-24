const Crypto = require('wcrypto');
const EthUtil = require('ethereumjs-util');
const Transaction = require('ethereumjs-tx');
const rpc = require('ethrpc');
const abi = require('ethereumjs-abi');
const BN = require('bn.js');
const keccak256 = require('js-sha3').keccak256;

$( () => {
  // State
  const nodeHost = 'http://localhost:8545';
  const theState = {};

  const connectionConfiguration = {
    httpAddresses: [nodeHost],
    wsAddresses: [],
    ipcAddresses: [],
    networkID: 666,
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

  // Button actions handlers
  $('#unlock-wallet').click( (e) => {
    // unlock a user's wallet & extract the private key
    theState.userPrivateKey = $('#user-private-key').val();
    theState.userAddress = '0x' + EthUtil.privateToAddress(theState.userPrivateKey).toString('hex');
    $('#user-address').text(theState.userAddress);

    const payload = abi.simpleEncode('userWills(address,uint256)',
      theState.userAddress,
      0
    );
    const rawTx = {
      to: '0x976541a3803e7a14757b5f348a1a44366c5acbe2',
      data: '0x' + payload.toString('hex')
    };
    rpc.eth.call([rawTx, 'pending'], (res) => {
      console.log(res);
    });
  });


  // Initialize the page
  function initProvidersTable(providersData) {
    requestServer('swarm/providers.json').then( (response) => {
      const providersData = { providers: [] };

      for (let address in response.providers) {
        const provider = response.providers[address];
        providersData.providers.push(provider);
      }

      const providers = $('#template-providers').html();
      const table = Handlebars.compile(providers);
  
      const container = $('#container-providers')[0];
      container.innerHTML = table(providersData);
    }).catch( (error) => {
      //todo: show UIKit error
      alert(error);
    });
  };

  initProvidersTable();
});
