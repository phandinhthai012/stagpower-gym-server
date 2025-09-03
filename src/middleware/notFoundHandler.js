export const notFoundHandler = (req, res) => {
    const statusCode = 404;
  
    // console.warn('Route not found:', {
    //   url: req.originalUrl,
    //   method: req.method,
    //   ip: req.ip,
    //   timestamp: new Date().toISOString()
    // });
  
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: 'Route not found',
      code: 'NOT_FOUND',
      data: null,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  };