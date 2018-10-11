class EWillError extends Error {
  constructor(message, code, popup = false) {
    super(message);
    this._message = message;
    this._code = code;
    this._popup = popup;
  }

  get message() {
    return this._message;
  }

  get code() {
    return this._code;
  }

  get popup() {
    return this._popup;
  }

  static generalError(text = 'Something went wrong. Please try again.', code = 100) {
    return new EWillError(text, code, true);
  }

  static securityError(code = 1001) {
    return new EWillError('Failed to verify the response. Please double check you are using the correct URL and try again.', code, true);
  }

  static silentError(text = 'Something went wrong.', code = 1002) {
    return new EWillError(text, code, false);
  }
}

exports.EWillError = EWillError;
window.EWillError = EWillError;
