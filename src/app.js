const os = require('node:os');

const startTime = Date.now();

function getSystemMetrics() {
  const memoryUsage = process.memoryUsage();
  return {
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    hostname: os.hostname(),
    platform: `${os.platform()} (${os.arch()})`,
    nodeVersion: process.version,
    memoryRssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
    memoryHeapMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
    cpuCores: os.cpus().length,
    environment: process.env.NODE_ENV || 'development'
  };
}

function renderHtmlDashboard() {
  const metrics = getSystemMetrics();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CI/CD Pipeline Dashboard | Docker & GitHub Actions</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --success: #22c55e;
      --accent: #818cf8;
      --warning: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(34, 197, 94, 0.15);
      color: var(--success);
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .badge .pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: var(--primary);
    }
    .card-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
      font-weight: 700;
    }
    .metric-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      word-break: break-all;
    }
    .metric-sub {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .pipeline-flow {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .pipeline-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .steps {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      justify-content: space-between;
    }
    .step {
      flex: 1;
      min-width: 140px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .step-number {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }
    .step-name {
      font-weight: 600;
      font-size: 0.95rem;
    }
    .step-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .arrow {
      color: var(--text-muted);
      font-size: 1.2rem;
      font-weight: bold;
    }
    .actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #2563eb;
      color: white;
      text-decoration: none;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: #1d4ed8; }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text);
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.15); }
    footer {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 3rem;
      border-top: 1px solid var(--card-border);
      padding-top: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">
        <span class="pulse"></span>
        <span>DEPLOYMENT LIVE & HEALTHY</span>
      </div>
      <h1>CI/CD Pipeline with Docker & GitHub Actions</h1>
      <p class="subtitle">Self-contained, automated build, test & local deployment workflow</p>
    </header>

    <div class="pipeline-flow">
      <div class="pipeline-title">
        <span>🚀</span> CI/CD Workflow Stages (Zero Cloud Required)
      </div>
      <div class="steps">
        <div class="step">
          <div class="step-number">Stage 1</div>
          <div class="step-name">GitHub Actions</div>
          <div class="step-desc">Linting & Unit Tests</div>
        </div>
        <div class="arrow">→</div>
        <div class="step">
          <div class="step-number">Stage 2</div>
          <div class="step-name">Docker Build</div>
          <div class="step-desc">Multi-arch Buildx</div>
        </div>
        <div class="arrow">→</div>
        <div class="step">
          <div class="step-number">Stage 3</div>
          <div class="step-name">Docker Hub</div>
          <div class="step-desc">Free Registry Push</div>
        </div>
        <div class="arrow">→</div>
        <div class="step">
          <div class="step-number">Stage 4</div>
          <div class="step-name">Local Runtime</div>
          <div class="step-desc">Minikube / Docker VM</div>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Container / Node Host</div>
        <div class="metric-value" id="hostname">${metrics.hostname}</div>
        <div class="metric-sub">Platform: ${metrics.platform}</div>
      </div>
      <div class="card">
        <div class="card-title">Service Uptime</div>
        <div class="metric-value" id="uptime">${metrics.uptimeSeconds}s</div>
        <div class="metric-sub">Live process timer</div>
      </div>
      <div class="card">
        <div class="card-title">Memory (RSS / Heap)</div>
        <div class="metric-value">${metrics.memoryRssMb} <span style="font-size: 1rem; color: var(--text-muted);">MB</span></div>
        <div class="metric-sub">Heap: ${metrics.memoryHeapMb} MB</div>
      </div>
      <div class="card">
        <div class="card-title">Environment & Runtime</div>
        <div class="metric-value" style="font-size: 1.4rem;">${metrics.environment}</div>
        <div class="metric-sub">Node: ${metrics.nodeVersion} (${metrics.cpuCores} Cores)</div>
      </div>
    </div>

    <div class="pipeline-flow">
      <div class="pipeline-title">
        <span>⚡</span> Live API Endpoints & Health Probe
      </div>
      <div class="actions">
        <a href="/health" class="btn" target="_blank">View /health (Liveness Probe)</a>
        <a href="/api/info" class="btn btn-secondary" target="_blank">View /api/info (JSON Metrics)</a>
        <a href="/api/ping" class="btn btn-secondary" target="_blank">View /api/ping</a>
      </div>
    </div>

    <footer>
      Built with GitHub Actions, Docker, Docker Hub, and Minikube &bull; No Cloud Required
    </footer>
  </div>
</body>
</html>`;
}

function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // JSON helper
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(JSON.stringify(data, null, 2));
  };

  // Routes
  if (req.method === 'GET' && pathname === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    return res.end(renderHtmlDashboard());
  }

  if (req.method === 'GET' && pathname === '/health') {
    return sendJson(200, {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000)
    });
  }

  if (req.method === 'GET' && pathname === '/api/info') {
    return sendJson(200, {
      app: 'github-actions-docker-cicd',
      version: '1.0.0',
      status: 'healthy',
      metrics: getSystemMetrics(),
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'GET' && pathname === '/api/ping') {
    return sendJson(200, { message: 'pong', timestamp: Date.now() });
  }

  // 404 handler
  return sendJson(404, {
    error: 'Not Found',
    path: pathname,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  handleRequest,
  getSystemMetrics,
  renderHtmlDashboard
};

