const Crypto = require('wcrypto');

$( () => {

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
  $('#create-will').click( (e) => {
    // request PlatformID from the backend
    // redirect to a choosen provider's site
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
