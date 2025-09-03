const formatResponse = ({ success, statusCode, message, data, code }) => ({
    success,
    statusCode,
    message,
    data,
    code,
    timestamp: new Date().toISOString()
});

const response = (res, opts = {}) => {
    const success = opts.success ?? true;
    const computedStatus = opts.statusCode ?? (success ? 200 : 400);
    const payload = {
        success: success,
        statusCode: computedStatus,
        message: opts.message ?? (success ? 'OK' : 'Bad Request'),
        data: opts.data ?? null,
        code: opts.code ?? (success ? 'OK' : 'BAD_REQUEST')
    };
    return res.status(computedStatus).json(formatResponse(payload));
};

export default response;