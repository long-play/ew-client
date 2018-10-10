(function () {
  const radioSelect = document.querySelectorAll('.will-form__radio');
  const loadFile = document.querySelector('.load-file');
  const mainPage = document.querySelector('.will-welcome');
  const screen1 = document.querySelectorAll('.login-screen-1');
  const screen2 = document.querySelectorAll('.login-screen-2');
  const screen3 = document.querySelectorAll('.login-screen-3');

  function showScreen1() {
    if (!mainPage.classList.contains('will-welcome--hello')) {
      mainPage.className = 'will-welcome';
    }
    for (let j = 0; j < screen1.length; j++) {
      screen1[j].classList.add('login-screen--show');
    }
    for (let k = 0; k < screen2.length; k++) {
      if (screen2[k].classList.contains('login-screen--show')) {
        screen2[k].classList.remove('login-screen--show')
      }
    }
    for (let l = 0; l < screen3.length; l++) {
      if (screen3[l].classList.contains('login-screen--show')) {
        screen3[l].classList.remove('login-screen--show')
      }
    }
  }
  function showScreen2() {
    if (!mainPage.classList.contains('will-welcome--hello')) {
      mainPage.className = 'will-welcome will-welcome--select';
    }
    for (let k = 0; k < screen2.length; k++) {
      screen2[k].classList.add('login-screen--show');
    }
    for (let j = 0; j < screen1.length; j++) {
      screen1[j].classList.remove('login-screen--show');
    }
    for (let l = 0; l < screen3.length; l++) {
      if(screen3[l].classList.contains('login-screen--show')) {
        screen3[l].classList.remove('login-screen--show')
      }
    }
  }
  function showScreen3() {
    if (!mainPage.classList.contains('will-welcome--hello')) {
      mainPage.className = 'will-welcome will-welcome--password';
    }
    for (let k = 0; k < screen3.length; k++) {
      screen3[k].classList.add('login-screen--show');
    }
  }

  for (let i = 0; i < radioSelect.length; i++) {
    radioSelect[i].addEventListener('click',function () {
      if (this.id === 'PrivKey') {
        showScreen1()
      } else {
        showScreen2()
      }
    })
  }
  loadFile.addEventListener('change', showScreen3);
})();
