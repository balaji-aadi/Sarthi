const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        return Promise.resolve(requestHandler(req, res, next))
            .catch((err) => {
                const statusCode = err.statusCode || err.status || 500;
                return res.status(statusCode).json({
                    message: err.message,
                    error: err
                });
            });
    };
};

export { asyncHandler };
