(function () {
  const query = window.location.search.slice(1);
  const ewill = new window.EWillCreate(query);
  window.ewill = ewill;

  if (ewill.loginIfPossible() !== true) {
    console.log('not logged in');
    location.href = '/login.html?redirect=create-will.html&' + query;
    return;
  }

  ewill.configure().then( () => {
    ;
  }).catch( (err) => {
    ;
  });

  // handle input of beneficiary info
  window.ui.screens.toWillContent.addEventListener('click', (e) => {
    const benInfo = window.ui.delegate.canGoToWillContent();
    if (benInfo.result !== true) {
      window.ui.delegate.showBenficiaryInfoError(benInfo.error);
      return;
    }

    const switcher = window.ui.screens.authTypeSelector.value;
    let promise = null;

    if (switcher === 'existing_address') {
      promise = ewill.findBeneficiary(benInfo.address, benInfo.contacts, benInfo.title);
    } else if (switcher === 'generate_new_address') {
      promise = ewill.createBeneficiary(benInfo.contacts, benInfo.title);
      //todo: show the created keys to the user
    } else if (switcher === 'generate_from_questions') {
      //todo: implement questionnaire
    } else { // unknown
      promise = Promise.reject('Unknown error');
    }

    promise.then( () => {
      return ewill.getTotalFee();
    }).then( () => {
      window.ui.delegate.goToWillContent(e);
      window.util.stopButtonAnimation(window.ui.screens.toWillContent);
    }).catch( (err) => {
      window.ui.delegate.showBenficiaryInfoError(err);
      window.util.stopButtonAnimation(window.ui.screens.toWillContent);
    });

    window.util.startButtonAnimation(window.ui.screens.toWillContent);
  });

  // submit will records
  window.ui.screens.toValidation.addEventListener('click', (e) => {
    const willContent = window.ui.delegate.canGoToValidation();
    if (willContent.result !== true) {
      window.ui.delegate.showWillContentError(willContent.error);
      return;
    }

    const readFileContent = (file) => {
      const promise = new Promise( (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>  {
          resolve(new Uint8Array(reader.result, 0, reader.result.byteLength));
        };
        reader.readAsArrayBuffer(file);
      });
      return promise;
    };

    const promises = [];
    for (let record of willContent.records) {
      if (record.type !== 'file' || !record.file) continue;
      promises.push(readFileContent(record.file).then( (content) => record.value = content ));
    }

    const promise = Promise.all(promises).then(() => {
      return ewill.requestProviderKey();
    }).then( () => {
      return ewill.encryptWillContent(willContent.records);
    }).then( () => {
      window.ui.delegate.goToValidation(ewill.provider, willContent.records);
      window.util.stopButtonAnimation(window.ui.screens.toValidation);
    }).catch( (err) => {
      window.ui.delegate.showWillContentError(err);
      window.util.stopButtonAnimation(window.ui.screens.toValidation);
    });

    window.util.startButtonAnimation(window.ui.screens.toValidation);
  });

  // go back to wills
  window.ui.screens.backToWillContent.addEventListener('click', (e) => {
    e.preventDefault();
    window.ui.delegate.goBackToWills();
  });

  // confirm the will
  window.ui.screens.validationValidate.addEventListener('click', (e) => {
    const willTitle = window.ui.screens.willTitle.value;
    ewill.createWill(willTitle, ewill.provider.params.period).then( (will) => {
      window.ui.delegate.submitValidation(will, e);
      window.util.stopButtonAnimation(window.ui.screens.validationValidate);
    }).catch( (err) => {
      window.ui.delegate.showValidationError(err);
      window.util.stopButtonAnimation(window.ui.screens.validationValidate);
    });

    window.util.startButtonAnimation(window.ui.screens.validationValidate);
  });

  // confirm the transaction
  window.ui.screens.modalConfirmCancel.addEventListener('click', (e) => {
    window.ui.delegate.cancelConfirmation(e);
  });

  window.ui.screens.modalConfirmSubmit.addEventListener('click', (e) => {
    ewill.submitWill().then( (txId) => {
      window.ui.delegate.submitConfirmation(txId, e);
      window.util.stopButtonAnimation(window.ui.screens.modalConfirmSubmit);
    }).catch( (err) => {
      window.ui.delegate.showConfirmationError(err);
      window.util.stopButtonAnimation(window.ui.screens.modalConfirmSubmit);
    });

    window.util.startButtonAnimation(window.ui.screens.modalConfirmSubmit);
  });
})();
