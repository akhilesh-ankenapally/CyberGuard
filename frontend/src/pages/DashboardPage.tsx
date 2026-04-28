import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformMeta, threatPalette } from '../data/platforms';
import { useCyberGuard } from '../context/CyberGuardContext';
import { getRelativeTimeLabel } from '../lib/time';
import type { AppAlert } from '../types';

type ThreatSummaryTone = 'green' | 'yellow' | 'red';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getRiskTone(score: number): ThreatSummaryTone {
  if (score >= 65) return 'red';
  if (score >= 35) return 'yellow';
  return 'green';
}

function getStatusLabel(score: number) {
  if (score >= 65) return 'Threat Activity Detected';
  if (score >= 35) return 'Elevated Risk Signals';
  return 'Protected';
}

function getDisplayScore(statsThreats: number, statsSafe: number, statsSuspicious: number) {
  const total = statsThreats + statsSafe + statsSuspicious;
  if (total === 0) return 12;
  const weighted = statsThreats * 18 + statsSuspicious * 9 - statsSafe * 4;
  return clamp(Math.round(20 + weighted), 8, 98);
}

type TrendPoint = {
  label: string;
  time: number;
  count: number;
};

function buildThreatTrend(records: { timestamp: string; risk_level: string }[]) {
  const now = Date.now();
  const bucketMs = 60_000;
  const buckets = 6;
  const start = now - bucketMs * (buckets - 1);

  const counts = new Array<number>(buckets).fill(0);

  records.forEach((record) => {
    if (record.risk_level !== 'Threat') return;
    const ts = new Date(record.timestamp).getTime();
    if (Number.isNaN(ts) || ts < start || ts > now) return;
    const index = Math.min(buckets - 1, Math.floor((ts - start) / bucketMs));
    counts[index] += 1;
  });

  const points: TrendPoint[] = counts.map((count, index) => {
    const ts = start + index * bucketMs;
    const date = new Date(ts);
    return {
      time: ts,
      count,
      label: date.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
    };
  });

  return points;
}

function getSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midpointX = (previous.x + current.x) / 2;
    d += ` Q ${previous.x} ${previous.y}, ${midpointX} ${(previous.y + current.y) / 2}`;
    d += ` T ${current.x} ${current.y}`;
  }
  return d;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const { allRecords, alerts, stats, connectionState, monitoringState } = useCyberGuard();
  const latestThreat = allRecords[0] || null;
  const displayScore = getDisplayScore(stats.threatsDetected, stats.safeMessages, stats.suspiciousMessages);
  const systemStatus = getStatusLabel(displayScore);
  const riskTone = getRiskTone(displayScore);
  const statusTone: ThreatSummaryTone = connectionState === 'disconnected' ? 'red' : riskTone;

  const trendPoints = useMemo(() => buildThreatTrend(allRecords), [allRecords]);
  const hasTrendData = useMemo(() => trendPoints.some((point) => point.count > 0), [trendPoints]);

  const chart = useMemo(() => {
    const width = 330;
    const height = 170;
    const padLeft = 30;
    const padRight = 12;
    const padTop = 12;
    const padBottom = 30;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    const yMaxRaw = Math.max(...trendPoints.map((point) => point.count), 1);
    const yMax = Math.max(2, Math.ceil(yMaxRaw / 2) * 2);
    const yTicks = [0, Math.round(yMax / 2), yMax];

    const points = trendPoints.map((point, index) => {
      const x = padLeft + (plotWidth * index) / Math.max(1, trendPoints.length - 1);
      const y = padTop + plotHeight - (point.count / yMax) * plotHeight;
      return { ...point, x, y };
    });

    const linePath = getSmoothPath(points);
    const areaPath = points.length
      ? `${linePath} L ${points[points.length - 1].x} ${padTop + plotHeight} L ${points[0].x} ${padTop + plotHeight} Z`
      : '';
    const peakValue = Math.max(...points.map((point) => point.count), 0);

    return {
      width,
      height,
      padLeft,
      padTop,
      plotHeight,
      yTicks,
      points,
      linePath,
      areaPath,
      peakValue,
    };
  }, [trendPoints]);

  const filteredAlerts = useMemo(() => {
    return [...alerts]
      .filter((alert) => alert.risk_level === 'Threat' || alert.risk_level === 'Suspicious')
      .sort((left, right) => Number(new Date(right.timestamp)) - Number(new Date(left.timestamp)));
  }, [alerts]);

  const recentAlerts = useMemo(() => filteredAlerts.slice(0, 5), [filteredAlerts]);

  const toAppSecurity = (alert: AppAlert) => {
    const appName = alert.platform === 'Instagram' ? 'Instagram' : alert.platform === 'WhatsApp' ? 'WhatsApp' : '';
    if (!appName) return;
    navigate(`/app-security?app=${encodeURIComponent(appName)}`);
  };

  return (
    <div className="mt-4 space-y-3 pb-4">
      <section className="rounded-[24px] border border-[rgba(255,255,255,0.5)] bg-[linear-gradient(140deg,rgba(224,231,255,0.88),rgba(238,242,255,0.8))] p-4 shadow-[0_16px_34px_rgba(15,23,42,0.28)] transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-cyber-muted">System Status</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-cyber-text">{systemStatus}</h2>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${statusTone === 'red' ? 'bg-cyber-red/15 text-cyber-red' : statusTone === 'yellow' ? 'bg-cyber-yellow/15 text-cyber-yellow' : 'bg-cyber-green/15 text-cyber-green'}`}>
            <span className={`relative inline-flex h-2 w-2 rounded-full ${statusTone === 'red' ? 'bg-cyber-red' : statusTone === 'yellow' ? 'bg-cyber-yellow' : 'bg-cyber-green'}`}>
              <span className={`absolute inset-0 animate-ping rounded-full ${statusTone === 'red' ? 'bg-cyber-red/45' : statusTone === 'yellow' ? 'bg-cyber-yellow/45' : 'bg-cyber-green/45'}`} />
            </span>
            {connectionState === 'disconnected' ? 'Offline' : 'Live'}
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-cyber-muted">Risk Score</p>
            <motion.div key={displayScore} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-bold text-cyber-text">
              {displayScore} / 100
            </motion.div>
            <p className="mt-2 text-sm text-cyber-muted">{monitoringState}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/activity')}
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6366F1,#8B5CF6)] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-95 active:brightness-90"
          >
            Permissions
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="rounded-[24px] border border-[rgba(255,255,255,0.5)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-cyber-muted">Threat Trend</p>
          <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(59,130,246,0.1))] px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-cyber-blue" />
            <span className="text-xs text-cyber-muted">Threat Activity</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-cyber-muted">Threat count per minute across the last 6 minutes.</p>

        <div className="mt-3 rounded-[16px] bg-[linear-gradient(140deg,rgba(238,242,255,0.78),rgba(255,255,255,0.7))] p-2">
          {hasTrendData ? (
            <div className="relative">
              <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[170px] w-full">
                <defs>
                  <linearGradient id="threatTrendStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#22C55E" />
                  </linearGradient>
                  <linearGradient id="threatTrendFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
                    <stop offset="100%" stopColor="rgba(59,130,246,0.03)" />
                  </linearGradient>
                </defs>

                <text x="12" y="16" fill="rgba(71,85,105,0.9)" fontSize="10" transform="rotate(-90 12 16)">
                  Threat count
                </text>

                {chart.yTicks.map((tick) => {
                  const y = chart.padTop + chart.plotHeight - (tick / chart.yTicks[2]) * chart.plotHeight;
                  return (
                    <g key={`grid-${tick}`}>
                      <line x1={chart.padLeft} x2={chart.width - 12} y1={y} y2={y} stroke="rgba(15,23,42,0.12)" strokeDasharray="3 5" />
                      <text x={4} y={y + 4} fill="rgba(71,85,105,0.9)" fontSize="10">
                        {tick}
                      </text>
                    </g>
                  );
                })}

                <motion.path
                  key={`area-${chart.areaPath}`}
                  d={chart.areaPath}
                  fill="url(#threatTrendFill)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.path
                  key={`line-${chart.linePath}`}
                  d={chart.linePath}
                  fill="none"
                  stroke="url(#threatTrendStroke)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />

                {chart.points.map((point, index) => {
                  const isPeak = point.count === chart.peakValue && point.count > 0;
                  return (
                    <g key={`pt-${point.time}`}>
                      <circle cx={point.x} cy={point.y} r="4" fill="#3B82F6" stroke="#F8FAFC" strokeWidth="2" />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="11"
                        fill="transparent"
                        onMouseEnter={() => setHoveredPoint(index)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onTouchStart={() => setHoveredPoint(index)}
                      />
                      {isPeak && (
                        <text x={point.x} y={point.y - 10} textAnchor="middle" fill="rgba(30,41,59,0.9)" fontSize="10">
                          {point.count}
                        </text>
                      )}
                    </g>
                  );
                })}

                {chart.points.map((point) => (
                  <text key={`x-${point.time}`} x={point.x} y={chart.height - 8} textAnchor="middle" fill="rgba(71,85,105,0.85)" fontSize="10">
                    {point.label}
                  </text>
                ))}
                <text x={chart.width / 2} y={chart.height - 1} textAnchor="middle" fill="rgba(71,85,105,0.85)" fontSize="10">
                  Time (last 6 min)
                </text>
              </svg>

              {hoveredPoint !== null && chart.points[hoveredPoint] && (
                <div className="pointer-events-none absolute right-2 top-2 rounded-[12px] border border-[rgba(255,255,255,0.4)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] px-3 py-2 shadow-[0_8px_22px_rgba(15,23,42,0.12)]">
                  <p className="text-xs text-cyber-muted">{chart.points[hoveredPoint].label}</p>
                  <p className="text-sm font-semibold text-cyber-text">{chart.points[hoveredPoint].count} threats</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-[170px] items-center justify-center text-sm text-cyber-muted">No recent threat activity</div>
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-[rgba(255,255,255,0.5)] bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(224,231,255,0.72))] p-4 shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-cyber-muted">Recent Alerts</p>
          <button
            type="button"
            onClick={() => setShowAllAlerts(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6366F1,#8B5CF6)] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-95 active:brightness-90"
          >
            View All Alerts
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => {
                const meta = platformMeta[alert.platform];
                const Icon = meta.icon;
                const palette = threatPalette[alert.risk_level];

                return (
                  <motion.button
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toAppSecurity(alert)}
                    className="flex w-full items-center justify-between gap-3 rounded-[16px] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] p-3 text-left transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.1))]">
                        <Icon className="h-4 w-4" style={{ color: meta.accent }} />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 break-words text-sm font-semibold text-cyber-text">{alert.message}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-cyber-muted">{alert.platform}</span>
                          <span className="text-xs text-cyber-muted">•</span>
                          <span className="text-xs text-cyber-muted">{getRelativeTimeLabel(alert.timestamp)}</span>
                          <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ backgroundColor: palette.background, color: palette.foreground }}>
                            {alert.risk_level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-cyber-muted" />
                  </motion.button>
                );
              })
            ) : (
              <div className="rounded-[16px] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] p-3 text-sm text-cyber-muted">No active alerts.</div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {showAllAlerts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end bg-indigo-200/35 backdrop-blur-sm"
            onClick={() => setShowAllAlerts(false)}
          >
            <motion.div
              initial={{ y: 260 }}
              animate={{ y: 0 }}
              exit={{ y: 260 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full rounded-t-[24px] border border-[rgba(255,255,255,0.5)] bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(224,231,255,0.75))] p-4 shadow-[0_-8px_26px_rgba(15,23,42,0.14)]"
            >
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300" />
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-cyber-text">All Alerts</h3>
                <span className="rounded-full bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(59,130,246,0.1))] px-3 py-2 text-xs text-cyber-muted">{filteredAlerts.length}</span>
              </div>

              <div className="mt-3 max-h-[55vh] space-y-2 overflow-y-auto">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => {
                    const meta = platformMeta[alert.platform];
                    const Icon = meta.icon;
                    const palette = threatPalette[alert.risk_level];
                    return (
                      <button
                        key={`all-${alert.id}`}
                        type="button"
                        onClick={() => toAppSecurity(alert)}
                        className="flex w-full items-center justify-between gap-3 rounded-[12px] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] p-3 text-left transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.1))]">
                            <Icon className="h-4 w-4" style={{ color: meta.accent }} />
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 break-words text-sm font-semibold text-cyber-text">{alert.message}</p>
                            <p className="mt-1 text-xs text-cyber-muted">{alert.platform} • {getRelativeTimeLabel(alert.timestamp)}</p>
                          </div>
                        </div>
                        <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ backgroundColor: palette.background, color: palette.foreground }}>
                          {alert.risk_level}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-[12px] bg-[linear-gradient(140deg,rgba(238,242,255,0.76),rgba(255,255,255,0.68))] p-3 text-sm text-cyber-muted">No alerts yet.</div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAllAlerts(false)}
                className="mt-3 inline-flex w-full items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#6366F1,#8B5CF6)] px-3 py-3 text-sm font-semibold text-white transition hover:brightness-95 active:brightness-90"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-sm text-cyber-muted">
        {latestThreat ? `Latest signal: ${latestThreat.platform} • ${latestThreat.risk_level}` : 'Waiting for first signal'}
      </p>
    </div>
  );
}



