const Crypto = require('wcrypto');
const EthUtil = require('ethereumjs-util');
const Transaction = require('ethereumjs-tx');
const rpc = require('ethrpc');
const abi = require('ethereumjs-abi');
const BN = require('bn.js');
const keccak256 = require('js-sha3').keccak256;

$( () => {
  // State
  const willStateNames = [ 'None', 'Created', 'Activated', 'Pending', 'Claimed', 'Declined' ];
  const contract = '0xdedb3540843af498192723f836db218569f000e4'; // 0x976541a3803e7a14757b5f348a1a44366c5acbe2
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

  function ethCall(payload) {
    const promise = new Promise( (resolve, reject) => {
      const rawTx = {
        to: contract,
        data: EthUtil.bufferToHex(payload)
      };
      rpc.eth.call([rawTx, 'pending'], (res) => {
        if (res.error) reject(res);
        else resolve(res);
      });
    });
    return promise;
  };

  function requestWill(willNumber) {
    const payload = abi.simpleEncode('userWills(address,uint256)',
      theState.userAddress,
      willNumber
    );
    const promise = ethCall(payload).then( (willId) => {
      const payload = abi.simpleEncode('wills(uint256)', willId);
      return ethCall(payload);
    }).then( (payload) => {
      console.log(payload);
      payload = EthUtil.toBuffer(payload);
      //const fieldValues = abi.simpleDecode('wills(uint256):(uint256,uint256,uint256,uint256,uint256,uint256,address,uint8,uint256,uint256,address)', payload);
      const fieldValues = abi.simpleDecode('wills(uint256):(uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256)', payload);
      const will = {
        willId: fieldValues[0],
        storageId: fieldValues[1],
        balance: fieldValues[2],
        annualFee: fieldValues[3],
        beneficiaryHash: fieldValues[4],
        decryptionKey: fieldValues[5],
        owner: fieldValues[6],
        state: fieldValues[7],
        updatedAt: fieldValues[8],
        validTill: fieldValues[9],
        provider: fieldValues[10],
      };
      return Promise.resolve(will);
    });
    return promise;
  };

  async function requestAllWills() {
    let finished = false;
    let idx = 0;
    const wills = [];

    do {
      try {
        const will = await requestWill(idx);
        if (will) {
          wills.push(will);
          idx++;
        } else {
          finished = true;
        }
      } catch (err) {
        console.error(err);
        finished = true;
      }
    } while (finished == false);

    return wills;
  };

  // Button actions handlers
  $('#unlock-wallet').click( (e) => {
    // unlock a user's wallet & extract the private key
    theState.userPrivateKey = $('#user-private-key').val();
    theState.userAddress = '0x' + EthUtil.privateToAddress(theState.userPrivateKey).toString('hex');
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

      const willsTemplate = $('#template-wills').html();
      const table = Handlebars.compile(willsTemplate);

      const container = $('#container-wills')[0];
      container.innerHTML = table(willsData);
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
