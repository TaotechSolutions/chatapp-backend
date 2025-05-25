const errorResponse = (res, status_code, message, data = null, errors) => {
    return res.status(status_code).json({
        status: status_code,
        success: false, message,
        data: data || null,
        errors: errors || null
    });
};

const successResponse = (res, status_code, message, data = null) => {
    return res.status(status_code).json({
        status: status_code,
        success: true, message,
        data: data || null
    });
};

module.exports = { errorResponse, successResponse };
