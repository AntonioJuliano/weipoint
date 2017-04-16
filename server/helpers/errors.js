const errorCodes = {
  invalidArguments: 1000,
  notFound: 1001,
  sourceAlreadyExists: 1002,
  serverError: 1003,
  sourceMismatch: 1004,
  sourceNotAvailable: 1005,
  contractFunctionThrewError: 1006,
  tooManyTags: 1007
};

class ClientError {
  constructor(message, code) {
    this.code = code;
    this.message = message;
  }
}

class RequestError {
  constructor(errors) {
    this.errors = errors;
  }
}

module.exports.errorCodes = errorCodes;
module.exports.ClientError = ClientError;
module.exports.RequestError = RequestError;
