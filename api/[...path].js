// ============================================================
//  Vercel Catch-All Serverless Route for /api/*
// ============================================================
const app = require('../server.js');

module.exports = (req, res) => {
  if (req.url.startsWith('/api/index.js')) {
    const originalPath = req.headers['x-matched-path'] ||
                         req.headers['x-vercel-matched-path'] ||
                         req.headers['x-forwarded-uri'] ||
                         req.headers['x-original-url'];
    if (originalPath) {
      const qIndex = req.url.indexOf('?');
      const query = (qIndex !== -1 && !originalPath.includes('?')) ? req.url.substring(qIndex) : '';
      req.url = originalPath + query;
    }
  }
  return app(req, res);
};
