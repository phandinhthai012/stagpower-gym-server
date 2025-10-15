const socketRateLimit = (socket, next) => {
    // Simple rate limiting for socket events
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100; // max 100 requests per minute
  
    if (!socket.rateLimit) {
      socket.rateLimit = {
        requests: [],
        blocked: false
      };
    }
  
    // Clean old requests
    socket.rateLimit.requests = socket.rateLimit.requests.filter(
      time => now - time < windowMs
    );
  
    // Check if rate limit exceeded
    if (socket.rateLimit.requests.length >= maxRequests) {
      socket.rateLimit.blocked = true;
      return next(new Error('Rate limit exceeded'));
    }
  
    // Add current request
    socket.rateLimit.requests.push(now);
    next();
  };
  
  export default socketRateLimit;