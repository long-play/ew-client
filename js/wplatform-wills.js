const Crypto = require('wcrypto');

$( () => {

  // Button actions handlers
  $('#create-will').click( (e) => {
  });

  // Initialize the page
  function initProvidersTable(providersData) {
    const data = { providers: [
        { name: 'WPlatform', tags: 'email', help: 'Here is a description', tariffs: [
            { id: '0100', name: 'Basic    $12' },
            { id: '0500', name: 'Pro      $49' },
            { id: '1000', name: 'Ultimate $99' }
        ]},
        { name: 'PFR RF', tags: 'passport', help: 'Here is a description', tariffs: [
            { id: '0100', name: 'Basic    $12' },
            { id: '0100', name: 'Pro      $49' },
            { id: '0100', name: 'Ultimate $99' }
        ]},
        { name: 'Zombie Inc', tags: 'phone, vk.com', help: 'Here is a description', tariffs: [
            { id: '0100', name: 'Basic    $12' },
            { id: '0100', name: 'Pro      $49' },
            { id: '0100', name: 'Ultimate $99' }
        ]}
    ]};
    providersData = data;
    const providers = $('#template-providers').html();
    const table = Handlebars.compile(providers);

    const container = $('#container-providers')[0];
    container.innerHTML = table(providersData);
  };

  initProvidersTable();
});
