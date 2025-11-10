const defaults = {
  windowMs: 60 * 1000, // 1 phút
  maxRequests: 100, // tối đa 100 sự kiện / phút
};

const initialiseRateLimitState = (socket) => {
  if (!socket.rateLimit) {
    socket.rateLimit = {
      timestamps: [],
      blockedUntil: null,
    };
  }
  return socket.rateLimit;
};

const createSocketRateLimit = (options = {}) => {
  const { windowMs, maxRequests } = { ...defaults, ...options };

  return (socket) => {
    const rateLimitState = initialiseRateLimitState(socket);

    return (packet, next) => {
      const now = Date.now();

      if (rateLimitState.blockedUntil && now < rateLimitState.blockedUntil) {
        return next(new Error('Rate limit exceeded'));
      }

      rateLimitState.timestamps = rateLimitState.timestamps.filter(
        (time) => now - time < windowMs
      );

      if (rateLimitState.timestamps.length >= maxRequests) {
        rateLimitState.blockedUntil = now + windowMs;
        return next(new Error('Rate limit exceeded'));
      }

      rateLimitState.timestamps.push(now);
      rateLimitState.blockedUntil = null;
      return next();
    };
  };
};

export default createSocketRateLimit;