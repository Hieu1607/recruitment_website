const ApiError = require("./ApiError");

class NotFoundError extends ApiError {
  constructor(resource = "Resource") {
    super(404, `${resource} not found`);
  }
}

module.exports = NotFoundError;