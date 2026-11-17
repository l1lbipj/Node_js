const apiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
    apiResponse.errorResponse(res, err.message || 'Internal Server Error', statusCode);
};
module.exports = errorHandler;