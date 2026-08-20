const { validationResult } = require('express-validator');

/**
 * Common middleware to handle validation results from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors.array();
    return res.status(400).json({
      error: validationErrors[0].msg,
      errors: validationErrors,
    });
  }
  next();
};

module.exports = {
  validate,
};
