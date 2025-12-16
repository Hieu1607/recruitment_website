/**
 * Validation Middleware
 * Request validation middleware using libraries like express-validator or joi
 */

module.exports = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors
    });
  }
};