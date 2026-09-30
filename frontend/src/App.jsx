
import { useCallback, useEffect, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight,
  Bell, CheckCircle2, ChevronRight, Droplets, Flower2,
  Gauge, LayoutDashboard, Leaf, LoaderCircle, RefreshCw,
  Sprout, Thermometer, Waves, Wind, Clock3, Cloud,
  Wifi, WifiOff, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import "./index.css";

const API = "http://127.0.0.1:8000";

function formatTime(value) {
  if (!value) return "Waiting for data";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently updated"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MetricCard({ icon: Icon, label, value, unit, note, accent }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className={`metric-icon ${accent}`}><Icon size={19} /></span>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-value">{value}<span>{unit}</span></div>
      <div className="metric-note"><span className="note-dot" />{note}</div>
    </article>
  );
}

export default function App() {
  const [plants, setPlants] = useState([]);
  const [readings, setReadings] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyPlant, setBusyPlant] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [statusResponse, readingResponse, eventResponse] =
        await Promise.all([
          fetch(`${API}/api/status`),
          fetch(`${API}/api/readings`),
          fetch(`${API}/api/watering-events`)
        ]);

      if (!statusResponse.ok || !readingResponse.ok || !eventResponse.ok) {
        throw new Error("The API returned an error.");
      }

      const [statusData, readingData, eventData] = await Promise.all([
        statusResponse.json(),
        readingResponse.json(),
        eventResponse.json()
      ]);

      setPlants(statusData);
      setReadings(readingData);
      setEvents(eventData);
      setLastSync(new Date());
      setError("");
    } catch {
      setError("Can't reach the backend. Check that FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function waterPlant(deviceId) {
    setBusyPlant(deviceId);
    setNotice("");
    try {
      const response = await fetch(
        `${API}/api/water/${encodeURIComponent(deviceId)}`,
        { method: "POST" }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail || "Watering request failed.");
      }
      setNotice(`Watering simulation completed for ${deviceId}.`);
      await refresh();
    } catch (err) {
      setNotice(err.message || "Could not complete watering request.");
    } finally {
      setBusyPlant("");
    }
  }

  const latest = readings[0] || plants[0];
  const averageMoisture = plants.length
    ? Math.round(plants.reduce((sum, p) => sum + Number(p.soil_moisture || 0), 0) / plants.length)
    : null;
  const healthyCount = plants.filter(p => p.soil_moisture >= 30).length;
  const onlineCount = plants.filter(p => p.device_status === "online").length;

  const chartData = [...readings]
    .slice(0, 20)
    .reverse()
    .map((r, i) => ({
      time: formatTime(r.timestamp),
      moisture: Number(r.soil_moisture),
      temperature: Number(r.temperature),
      humidity: Number(r.humidity),
      index: i
    }));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-mark"><Sprout size={25} /></span>
          <span className="brand-copy">
            <strong>Verdant<span>.</span></strong>
            <small>PLANT INTELLIGENCE</small>
          </span>
        </a>

        <div className="side-caption">WORKSPACE</div>
        <nav className="side-nav">
          <a className="nav-item active" href="#overview">
            <LayoutDashboard size={18} /> Overview
          </a>
          <a className="nav-item" href="#plants">
            <Flower2 size={18} /> My plants
            <span className="nav-count">{plants.length}</span>
          </a>
          <a className="nav-item" href="#analytics">
            <Activity size={18} /> Analytics
          </a>
          <a className="nav-item" href="#activity">
            <Droplets size={18} /> Watering log
          </a>
        </nav>

        <div className="sidebar-spacer" />

        <div className="cloud-card">
          <div className="cloud-symbol"><Cloud size={20} /></div>
          <strong>Cloud connected</strong>
          <p>Sensor data is synced with your cloud database.</p>
          <div className="cloud-status"><span /> Firestore storage</div>
        </div>

        <div className="sidebar-footer">
          <span className="avatar"><Leaf size={18} /></span>
          <span><strong>PlantCare System</strong><small>IoT monitoring</small></span>
          <span className="footer-dots">···</span>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span><ChevronRight size={14} /><strong>Overview</strong>
          </div>
          <div className="topbar-actions">
            <span className="live-pill"><span /> SYSTEM {error ? "OFFLINE" : "MONITORING"}</span>
            <button className="icon-button" title="Refresh data" onClick={refresh}>
              <RefreshCw size={17} />
            </button>
            <button className="icon-button" title="Notifications" onClick={() => setNotice("No new notifications.")}>
              <Bell size={17} />
            </button>
            <span className="top-avatar"><Sprout size={19} /></span>
          </div>
        </header>

        <div className="page-body">
          <section className="welcome-banner">
            <div className="welcome-content">
              <div className="eyebrow"><span /> YOUR PERSONAL GREENHOUSE</div>
              <h1>Grow better.<br /><em>Live greener.</em></h1>
              <p>Every leaf tells a story. Keep your plants thriving with intelligent monitoring and cloud-connected care.</p>
              <a className="banner-link" href="#plants">Explore your plants <ChevronRight size={16} /></a>
            </div>
            <div className="banner-art" aria-hidden="true">
              <div className="art-glow" />
              <div className="art-ring ring-one" />
              <div className="art-ring ring-two" />
              <div className="plant-emoji">🪴</div>
              <span className="floating-leaf leaf-one">✳</span>
              <span className="floating-leaf leaf-two">✦</span>
              <span className="art-label"><Activity size={13} /> Nature, in sync</span>
            </div>
            <div className="banner-index">01 — GROW</div>
          </section>

          {error && (
            <div className="alert-box">
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button onClick={refresh}>Retry</button>
            </div>
          )}

          {notice && (
            <div className="notice-box">
              <CheckCircle2 size={17} />
              <span>{notice}</span>
              <button onClick={() => setNotice("")}>Dismiss</button>
            </div>
          )}

          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="eyebrow muted-eyebrow">AT A GLANCE</div>
                <h2>Your garden, <span>in numbers.</span></h2>
              </div>
              <div className="sync-label">
                <span className="sync-dot" />
                Updated {lastSync ? formatTime(lastSync) : "—"}
              </div>
            </div>

            <div className="metrics-grid">
              <MetricCard icon={Flower2} label="Registered plants"
                value={plants.length} unit="" note={`${onlineCount} devices online`} accent="mint" />
              <MetricCard icon={Droplets} label="Average moisture"
                value={averageMoisture === null ? "—" : averageMoisture} unit={averageMoisture === null ? "" : "%"}
                note={averageMoisture === null ? "Awaiting sensor data" : averageMoisture < 30 ? "Below moisture target" : "Moisture target met"}
                accent="blue" />
              <MetricCard icon={Thermometer} label="Temperature"
                value={latest ? latest.temperature : "—"} unit={latest ? "°C" : ""}
                note="Latest sensor reading" accent="amber" />
              <MetricCard icon={Waves} label="Air humidity"
                value={latest ? latest.humidity : "—"} unit={latest ? "%" : ""}
                note="Latest sensor reading" accent="violet" />
            </div>
          </section>

          <section className="content-grid" id="analytics">
            <article className="panel analytics-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow muted-eyebrow">SENSOR INSIGHTS</div>
                  <h2>Moisture over time</h2>
                  <p>Recent soil readings from your connected devices</p>
                </div>
                <span className="chart-badge"><Activity size={14} /> LIVE DATA</span>
              </div>

              {chartData.length > 1 ? (
                <div className="chart-area">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="moistureFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#72C79B" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#72C79B" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#26382F" strokeDasharray="3 5" vertical={false} />
                      <XAxis dataKey="time" tick={{ fill: "#84958A", fontSize: 10 }}
                        tickLine={false} axisLine={false} minTickGap={28} />
                      <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]}
                        tick={{ fill: "#84958A", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#14231B", border: "1px solid #31483A", borderRadius: 12, color: "#E8F2EB" }}
                        labelStyle={{ color: "#A7CBB3" }}
                        formatter={(value) => [`${value}%`, "Soil moisture"]}
                      />
                      <Area type="monotone" dataKey="moisture" stroke="#78D6A1"
                        strokeWidth={2.5} fill="url(#moistureFill)" activeDot={{ r: 5, fill: "#B2F0C9", stroke: "#214B34" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="chart-empty">
                  <Activity size={26} />
                  <strong>{chartData.length === 0 ? "Waiting for sensor readings" : "Collecting trend data"}</strong>
                  <p>Send a few readings from your simulator or API to build the moisture chart.</p>
                </div>
              )}

              <div className="chart-footer">
                <span><i className="legend-dot" /> Soil moisture</span>
                <span><span className="target-line" /> Target threshold: 30%</span>
              </div>
            </article>

            <article className="panel health-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow muted-eyebrow">PLANT WELLNESS</div>
                  <h2>Garden health</h2>
                  <p>A snapshot of your plants</p>
                </div>
                <span className="health-symbol"><Sprout size={20} /></span>
              </div>

              <div className="health-score">
                <div className="score-number">{plants.length ? Math.round(healthyCount / plants.length * 100) : 0}<span>%</span></div>
                <div>
                  <strong>{plants.length ? (healthyCount === plants.length ? "Looking leafy" : "Needs attention") : "Awaiting data"}</strong>
                  <p>{plants.length ? `${healthyCount} of ${plants.length} plants meet the moisture threshold.` : "Connect a sensor to view plant health."}</p>
                </div>
              </div>

              <div className="health-bar">
                <div style={{ width: `${plants.length ? healthyCount / plants.length * 100 : 0}%` }} />
              </div>

              <div className="health-stats">
                <div><span className="health-key"><i className="healthy-dot" /> Moisture adequate</span><strong>{healthyCount}</strong></div>
                <div><span className="health-key"><i className="warning-dot" /> Needs water</span><strong>{plants.length - healthyCount}</strong></div>
                <div><span className="health-key"><i className="online-dot" /> Devices online</span><strong>{onlineCount}</strong></div>
              </div>

              <div className="health-tip">
                <Zap size={16} />
                <p><strong>Care tip</strong><br />Check soil moisture before watering to avoid overwatering your plants.</p>
              </div>
            </article>
          </section>

          <section className="section-block plants-section" id="plants">
            <div className="section-heading">
              <div>
                <div className="eyebrow muted-eyebrow">YOUR COLLECTION</div>
                <h2>Meet your <span>green friends.</span></h2>
              </div>
              <span className="count-label">{plants.length} REGISTERED</span>
            </div>

            {loading ? (
              <div className="empty-state"><LoaderCircle className="spin" size={25} /><p>Loading your garden…</p></div>
            ) : plants.length === 0 ? (
              <div className="empty-state">
                <Sprout size={30} />
                <h3>Your garden is ready to grow</h3>
                <p>Send sensor data to <code>POST /api/sensor-data</code> to register your first plant.</p>
              </div>
            ) : (
              <div className="plants-grid">
                {plants.map((plant, index) => {
                  const needsWater = Number(plant.soil_moisture) < 30;
                  const online = plant.device_status === "online";
                  return (
                    <article className="plant-card" key={plant.device_id}>
                      <div className={`plant-visual plant-visual-${index % 3}`}>
                        <span className="plant-card-status">
                          <i className={online ? "status-online" : "status-offline"} />
                          {online ? "ONLINE" : "OFFLINE"}
                        </span>
                        <span className="plant-card-number">PLANT 0{index + 1}</span>
                        <div className="plant-illustration">{["🪴", "🌿", "🪴"][index % 3]}</div>
                        <div className="plant-visual-ring" />
                      </div>
                      <div className="plant-card-body">
                        <div className="plant-title-row">
                          <div><h3>{plant.device_id}</h3><p>Smart sensor device</p></div>
                          <span className={`plant-health-tag ${needsWater ? "needs-water-tag" : "healthy-tag"}`}>
                            {needsWater ? "Needs water" : "Healthy"}
                          </span>
                        </div>
                        <div className="plant-moisture">
                          <div><span>Soil moisture</span><strong>{plant.soil_moisture}%</strong></div>
                          <div className="moisture-track">
                            <div className={needsWater ? "moisture-low" : ""} style={{ width: `${Math.max(0, Math.min(100, Number(plant.soil_moisture)))}%` }} />
                          </div>
                        </div>
                        <div className="plant-environment">
                          <div><Thermometer size={15} /><span>{plant.temperature}°C</span></div>
                          <div><Wind size={15} /><span>{plant.humidity}% RH</span></div>
                          <div>{online ? <Wifi size={15} /> : <WifiOff size={15} />}<span>{online ? "Connected" : "Offline"}</span></div>
                        </div>
                        <button className="water-button" disabled={!!busyPlant || !online}
                          onClick={() => waterPlant(plant.device_id)}>
                          {busyPlant === plant.device_id
                            ? <><LoaderCircle className="spin" size={16} /> Processing…</>
                            : <><Droplets size={16} /> Run watering simulation <ArrowUpRight size={15} /></>}
                        </button>
                        <p className="simulation-note">Software simulation · No physical pump connected</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="panel activity-panel" id="activity">
            <div className="panel-heading">
              <div>
                <div className="eyebrow muted-eyebrow">RECENT EVENTS</div>
                <h2>Watering activity</h2>
                <p>Recent recorded watering actions</p>
              </div>
              <span className="count-label">{events.length} EVENTS</span>
            </div>
            {events.length === 0 ? (
              <div className="activity-empty"><Clock3 size={19} /><span>No watering events recorded yet.</span></div>
            ) : (
              <div className="activity-list">
                {events.slice(0, 6).map((event, i) => (
                  <div className="activity-row" key={`${event.timestamp}-${i}`}>
                    <span className="activity-icon"><Droplets size={17} /></span>
                    <div className="activity-description">
                      <strong>{event.device_id}</strong>
                      <span>{String(event.reason || "watering").replaceAll("_", " ")} · {event.status}</span>
                    </div>
                    <span className="activity-duration">{event.duration_seconds}s</span>
                    <time>{formatTime(event.timestamp)}</time>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="app-footer">
            <span>© 2026 VERDANT PLANT INTELLIGENCE</span>
            <span><span className="footer-status-dot" /> FASTAPI <b>·</b> FIRESTORE <b>·</b> REACT</span>
          </footer>
        </div>
      </main>
    </div>
  );
}