const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { handleRequest, getSystemMetrics, renderHtmlDashboard } = require('../src/app');

// Helper to simulate HTTP requests in-memory without network sockets
function simulateRequest({ method = 'GET', url = '/', headers = {} } = {}) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost:3000', ...headers };

    const res = new EventEmitter();
    let statusCode = 200;
    const responseHeaders = {};
    let body = '';

    res.writeHead = (code, headersObj = {}) => {
      statusCode = code;
      Object.assign(responseHeaders, headersObj);
      return res;
    };

    res.setHeader = (key, val) => {
      responseHeaders[key.toLowerCase()] = val;
    };

    res.end = (chunk) => {
      if (chunk) body += chunk;
      resolve({
        statusCode,
        headers: responseHeaders,
        body,
        json: () => JSON.parse(body)
      });
    };

    // Trigger handler
    handleRequest(req, res);
  });
}

describe('CI/CD Application Test Suite (In-Memory & Fast)', () => {
  test('GET / should return 200 OK and render HTML dashboard', async () => {
    const res = await simulateRequest({ method: 'GET', url: '/' });
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['Content-Type'], /text\/html/);
    assert.match(res.body, /CI\/CD Pipeline/);
    assert.match(res.body, /DEPLOYMENT LIVE & HEALTHY/);
    assert.match(res.body, /Docker &amp; GitHub Actions|Docker & GitHub Actions/);
  });

  test('GET /health should return 200 and healthy status (Liveness probe)', async () => {
    const res = await simulateRequest({ method: 'GET', url: '/health' });
    assert.equal(res.statusCode, 200);
    assert.match(res.headers['Content-Type'], /application\/json/);
    const data = res.json();
    assert.equal(data.status, 'UP');
    assert.ok(typeof data.uptimeSeconds === 'number');
    assert.ok(data.timestamp);
  });

  test('GET /api/info should return system metrics and app metadata', async () => {
    const res = await simulateRequest({ method: 'GET', url: '/api/info' });
    assert.equal(res.statusCode, 200);
    const data = res.json();
    assert.equal(data.app, 'github-actions-docker-cicd');
    assert.equal(data.version, '1.0.0');
    assert.equal(data.status, 'healthy');
    assert.ok(data.metrics);
    assert.ok(data.metrics.hostname);
    assert.ok(data.metrics.platform);
  });

  test('GET /api/ping should return pong message', async () => {
    const res = await simulateRequest({ method: 'GET', url: '/api/ping' });
    assert.equal(res.statusCode, 200);
    const data = res.json();
    assert.equal(data.message, 'pong');
    assert.ok(data.timestamp);
  });

  test('GET /non-existent-route should return 404 Not Found', async () => {
    const res = await simulateRequest({ method: 'GET', url: '/random-route' });
    assert.equal(res.statusCode, 404);
    const data = res.json();
    assert.equal(data.error, 'Not Found');
    assert.equal(data.path, '/random-route');
  });

  test('getSystemMetrics() should return valid system diagnostic numbers', () => {
    const metrics = getSystemMetrics();
    assert.ok(metrics.uptimeSeconds >= 0);
    assert.ok(typeof metrics.hostname === 'string');
    assert.ok(metrics.cpuCores > 0);
    assert.ok(parseFloat(metrics.memoryRssMb) > 0);
    assert.ok(metrics.environment);
  });

  test('renderHtmlDashboard() should output a valid HTML document', () => {
    const html = renderHtmlDashboard();
    assert.ok(html.startsWith('<!DOCTYPE html>'));
    assert.ok(html.includes('</html>'));
    assert.ok(html.includes('Stage 1'));
    assert.ok(html.includes('Stage 4'));
  });
});
