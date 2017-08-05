const Crypto = require('wcrypto');

$( () => {

  // Button actions handlers
  $('#find-benificiary').click( (e) => {
    // request a transaction from etherscan & parse pub key
  });

  $('#request-key').click( (e) => {
    // pass the user's address to the server and get server's public key
  });

  $('#create-will').click( (e) => {
    // encrypt the will & generate a transactoin
  });

  $('#publish-will').click( (e) => {
    // send the trasaction to the network
  });

  // Initialize the page
  function configure(query) {
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

  configure(window.location.search.slice(1));
});
