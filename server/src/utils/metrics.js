export const securityMetrics = {
  requestCounts: {}, // endpoint -> count
  totalRequests: 0,
  activeConnections: 0,
  abuseEvents: 0,
  rateLimitViolations: 0,
  temporaryBans: 0,
  slowQueries: 0,
  queryTimeouts: 0,
};

// Tracks requests per second
let requestBuffer = [];
export const trackRequest = (route) => {
  const now = Date.now();
  securityMetrics.totalRequests++;
  securityMetrics.requestCounts[route] = (securityMetrics.requestCounts[route] || 0) + 1;
  requestBuffer.push(now);
};

export const getRPS = () => {
  const now = Date.now();
  // filter out timestamps older than 1 second
  requestBuffer = requestBuffer.filter(t => now - t < 1000);
  return requestBuffer.length;
};
