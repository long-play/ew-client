(function () {
  const QUESTION__CLOSED = 'questions__question--closed';
  const QUESTION__OPENED = 'questions__question--opened';
  const ANSWER__CLOSED = 'questions__answer--hidden';
  const questions = document.querySelectorAll('.questions__question');
  const answers = document.querySelectorAll('.questions__answer');

  for (let i = 0; i < questions.length; i++) {
    window.util.toggleBlock(questions[i], answers[i], QUESTION__CLOSED, QUESTION__OPENED, ANSWER__CLOSED)
  }
})();
