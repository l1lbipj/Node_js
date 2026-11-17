const apiResponse = require('../utils/apiResponse');

const notFound = (req, res, next) =>{
    apiResponse.errorResponse(res, 'Route not found', 404);
};

module.exports = notFound;