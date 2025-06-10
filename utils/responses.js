const errorResponse = (res, status_code, message, data = null, errors) => {
    return res.status(status_code).json({
        status: status_code,
        success: false, message,
        data: data || null,
        errors: errors || null
    });
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    return res.status(statusCode).json({
        status: statusCode,
        success: false,
        message: err.message || "An error has occurred. Please try again later",
        errors: err || null
    });
};

const successResponse = (res, status_code, message, data = null) => {
    return res.status(status_code).json({
        status: status_code,
        success: true, message,
        data: data || null
    });
};

module.exports = { errorResponse, successResponse, errorHandler };
