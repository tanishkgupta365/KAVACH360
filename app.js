<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#07111f" />
  <meta name="description" content="KAVACH 360 — AI-driven crime analytics and visualization prototype for KSP Datathon 2026." />
  <title>KAVACH 360 | Crime Intelligence Command Center</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64"><path d="M32 4 55 13v17c0 14-9 25-23 30C18 55 9 44 9 30V13L32 4Z"/><path class="brand-mark-inner" d="m21 32 7 7 16-17"/></svg>
        </div>
        <div>
          <strong>KAVACH 360</strong>
          <span>Crime Intelligence</span>
        </div>
      </div>

      <nav class="nav">
        <button class="nav-item active" data-view="overview"><span>⌂</span> Command Center</button>
        <button class="nav-item" data-view="map"><span>⌖</span> Hotspot Map</button>
        <button class="nav-item" data-view="lifecycle"><span>↻</span> Case Lifecycle</button>
        <button class="nav-item" data-view="network"><span>◎</span> Repeat-Accused Network</button>
        <button class="nav-item" data-view="cases"><span>▤</span> Case 360</button>
      </nav>

      <div class="sidebar-card">
        <div class="pulse-dot"></div>
        <div>
          <strong>Prototype Online</strong>
          <span>Synthetic & anonymised data</span>
        </div>
      </div>

      <div class="privacy-note">
        <strong>Privacy by design</strong>
        <p>No real citizen or police operational data is included.</p>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <p class="eyebrow">Karnataka State Police • Datathon 2026</p>
          <h1 id="pageTitle">Crime Intelligence Command Center</h1>
        </div>
        <div class="top-actions">
          <button class="ghost-btn" id="refreshBtn">↻ Refresh</button>
          <button class="primary-btn" id="reportBtn">⇩ Export Brief</button>
          <div class="avatar">TG</div>
        </div>
      </header>

      <section class="control-strip">
        <label>
          <span>District</span>
          <select id="districtFilter"></select>
        </label>
        <label>
          <span>Crime category</span>
          <select id="categoryFilter"></select>
        </label>
        <label>
          <span>Gravity</span>
          <select id="gravityFilter">
            <option value="All">All gravity levels</option>
            <option value="Heinous">Heinous</option>
            <option value="Non-Heinous">Non-Heinous</option>
          </select>
        </label>
        <label>
          <span>Period</span>
          <select id="periodFilter">
            <option value="365">Last 12 months</option>
            <option value="180">Last 6 months</option>
            <option value="90">Last 90 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </label>
        <div class="data-badge"><span></span><strong id="recordCount">0</strong> records analysed</div>
      </section>

      <section class="view active" id="overviewView">
        <div class="metric-grid" id="metricGrid"></div>

        <div class="grid two-one">
          <article class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Temporal intelligence</p>
                <h2>FIR Trend & Forecast</h2>
              </div>
              <span class="confidence-pill">Forecast confidence 87%</span>
            </div>
            <canvas id="trendChart" height="245"></canvas>
            <div class="chart-legend">
              <span><i class="legend-actual"></i> Recorded FIRs</span>
              <span><i class="legend-forecast"></i> Forecast</span>
            </div>
          </article>

          <article class="panel risk-panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Explainable intelligence</p>
                <h2>Operational Risk Index</h2>
              </div>
              <span class="risk-status" id="riskStatus">HIGH</span>
            </div>
            <div class="risk-ring-wrap">
              <div class="risk-ring" id="riskRing"><span id="riskScore">0</span><small>/100</small></div>
              <div>
                <strong id="riskDistrict">Karnataka</strong>
                <p id="riskSummary">Analysing current indicators…</p>
              </div>
            </div>
            <div class="factor-list" id="factorList"></div>
          </article>
        </div>

        <div class="grid two-one">
          <article class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Geospatial prioritisation</p>
                <h2>District Risk Ranking</h2>
              </div>
              <button class="text-btn" data-jump="map">Open hotspot map →</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>District</th><th>FIRs</th><th>Heinous</th><th>Pending</th><th>Risk</th></tr></thead>
                <tbody id="districtTable"></tbody>
              </table>
            </div>
          </article>

          <article class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Attention required</p>
                <h2>Live Anomaly Alerts</h2>
              </div>
              <span class="alert-count" id="alertCount">0</span>
            </div>
            <div class="alert-list" id="alertList"></div>
          </article>
        </div>

        <div class="grid equal">
          <article class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Case mix</p>
                <h2>Crime Distribution</h2>
              </div>
            </div>
            <div class="donut-layout">
              <canvas id="donutChart" width="260" height="260"></canvas>
              <div class="donut-legend" id="donutLegend"></div>
            </div>
          </article>
          <article class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Resource allocation</p>
                <h2>Police Station Workload</h2>
              </div>
            </div>
            <canvas id="workloadChart" height="275"></canvas>
          </article>
        </div>
      </section>

      <section class="view" id="mapView">
        <div class="grid map-layout">
          <article class="panel map-panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Location-aware analytics</p>
                <h2>Karnataka Crime Hotspot Map</h2>
              </div>
              <div class="map-mode">
                <button class="mini-toggle active" data-mapmode="risk">Risk</button>
                <button class="mini-toggle" data-mapmode="volume">Volume</button>
              </div>
            </div>
            <div class="map-stage">
              <svg id="karnatakaMap" viewBox="0 0 500 650" role="img" aria-label="Stylised Karnataka hotspot map">
                <defs>
                  <linearGradient id="mapGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#122846"/>
                    <stop offset="100%" stop-color="#09182c"/>
                  </linearGradient>
                  <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <path class="state-shape" d="M155 25 235 34 305 72 331 128 364 166 346 219 391 253 361 309 402 351 376 409 349 460 311 491 289 551 247 626 202 602 185 542 156 501 141 431 110 381 121 317 81 251 106 196 91 137 121 91Z"/>
                <g id="mapMarkers"></g>
              </svg>
              <div class="map-tooltip" id="mapTooltip"></div>
              <div class="map-legend">
                <span><i class="risk-low"></i> Low</span>
                <span><i class="risk-medium"></i> Medium</span>
                <span><i class="risk-high"></i> High</span>
                <span><i class="risk-critical"></i> Critical</span>
              </div>
            </div>
          </article>

          <aside class="map-side">
            <article class="panel">
              <p class="eyebrow">Selected district</p>
              <h2 id="selectedDistrictName">Bengaluru Urban</h2>
              <div class="district-score" id="selectedDistrictScore">84</div>
              <div class="mini-stats" id="selectedDistrictStats"></div>
            </article>
            <article class="panel">
              <p class="eyebrow">AI recommendation</p>
              <h2>Preventive Action Plan</h2>
              <ol class="recommendations" id="recommendations"></ol>
            </article>
          </aside>
        </div>

        <article class="panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Drilldown</p>
              <h2>Station-Level Hotspots</h2>
            </div>
          </div>
          <div class="station-cards" id="stationCards"></div>
        </article>
      </section>

      <section class="view" id="lifecycleView">
        <div class="metric-grid" id="lifecycleMetrics"></div>

        <div class="grid equal">
          <article class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">End-to-end visibility</p>
                <h2>Case Lifecycle Funnel</h2>
              </div>
            </div>
            <div class="funnel" id="lifecycleFunnel"></div>
          </article>
          <article class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Time-to-action</p>
                <h2>Investigation Turnaround</h2>
              </div>
            </div>
            <canvas id="turnaroundChart" height="310"></canvas>
          </article>
        </div>

        <article class="panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">SLA exception monitoring</p>
              <h2>Delayed Cases Requiring Attention</h2>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Crime No.</th><th>District / Station</th><th>Category</th><th>Age</th><th>Status</th><th>Priority</th><th></th></tr></thead>
              <tbody id="delayedTable"></tbody>
            </table>
          </div>
        </article>
      </section>

      <section class="view" id="networkView">
        <div class="grid network-layout">
          <article class="panel network-panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Relationship intelligence</p>
                <h2>Repeat-Accused & Co-Accused Network</h2>
              </div>
              <span class="privacy-chip">Recorded associations only</span>
            </div>
            <div class="network-stage">
              <svg id="networkSvg" viewBox="0 0 900 540"></svg>
              <div class="network-key">
                <span><i class="node-repeat"></i> Repeat accused</span>
                <span><i class="node-accused"></i> Accused ID</span>
                <span><i class="node-case"></i> FIR</span>
              </div>
            </div>
          </article>
          <aside class="network-side">
            <article class="panel">
              <p class="eyebrow">Entity profile</p>
              <h2 id="entityTitle">Select a network node</h2>
              <div id="entityDetails" class="empty-state">Click any node to inspect its recorded associations.</div>
            </article>
            <article class="panel">
              <p class="eyebrow">Ethical guardrail</p>
              <h2>Human Review Required</h2>
              <p class="muted">KAVACH 360 does not infer guilt. It highlights data relationships for authorised operational review, with auditability and role-based access proposed for production.</p>
            </article>
          </aside>
        </div>
      </section>

      <section class="view" id="casesView">
        <article class="panel">
          <div class="panel-head case-head">
            <div>
              <p class="eyebrow">Unified FIR intelligence</p>
              <h2>Case 360 Explorer</h2>
            </div>
            <div class="search-box">
              <span>⌕</span>
              <input id="caseSearch" placeholder="Search crime no., district, station or category…" />
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Crime No.</th><th>Registered</th><th>District</th><th>Station</th><th>Crime</th><th>Gravity</th><th>Status</th><th>Risk</th><th></th></tr></thead>
              <tbody id="caseTable"></tbody>
            </table>
          </div>
          <div class="pagination">
            <button id="prevPage">← Previous</button>
            <span id="pageInfo">Page 1</span>
            <button id="nextPage">Next →</button>
          </div>
        </article>
      </section>

      <section class="ask-panel">
        <div class="ask-icon">✦</div>
        <div class="ask-copy">
          <strong>Ask KAVACH</strong>
          <span>Try: “Show high-risk districts”, “open delayed cases”, or “robbery in Bengaluru”</span>
        </div>
        <input id="askInput" placeholder="Ask an operational question…" />
        <button id="askBtn">Analyse</button>
      </section>
    </main>
  </div>

  <div class="modal-backdrop" id="caseModal">
    <div class="modal">
      <button class="modal-close" id="modalClose">×</button>
      <div id="modalContent"></div>
    </div>
  </div>

  <div class="toast" id="toast"></div>
  <script src="app.js"></script>
</body>
</html>
