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

  static generalError(text = 'Something went wrong. Please try again.') {
    return new EWillError(text, 1000, true);
  }

  static securityError() {
    return new EWillError('Failed to verify the response. Please double check you are using the correct URL and try again.', 1001, true);
  }
}

exports.EWillError = EWillError;
window.EWillError = EWillError;
