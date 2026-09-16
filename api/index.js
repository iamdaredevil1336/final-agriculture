// ============================================================
//  Vercel Serverless Function Handler
//  Wraps and exports the Express app for Vercel Edge/Node runtime
// ============================================================
const app = require('../server.js');

module.exports = app;
