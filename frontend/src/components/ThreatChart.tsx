type Point = { label: string; value: number };

export function ThreatChart({ points }: { points: Point[] }) {
  const width = 720;
  const height = 240;
  const padding = 28;
  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const maxValue = Math.max(...points.map((point) => point.value), 3);

  const coordinates = points.map((point, index) => ({
    x: padding + index * xStep,
    y: height - padding - ((point.value / maxValue) * (height - padding * 2)),
    label: point.label,
    value: point.value,
  }));

  const path = coordinates.length > 0
    ? coordinates.reduce((accumulator, point, index) => accumulator + `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y} `, '')
    : '';

  return (
    <div className="rounded-[24px] border border-[#D8D1C7] bg-[#FAF8F5] p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full">
        {[0, 1, 2, 3].map((line) => {
          const y = padding + ((height - padding * 2) / 3) * line;
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(15,23,42,0.1)" />;
        })}
        {path && <path d={path} fill="none" stroke="url(#cyberStroke)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}
        {coordinates.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="6" fill="#FFFFFF" stroke="#16A34A" strokeWidth="2" />
            <circle cx={point.x} cy={point.y} r="14" fill="rgba(22,163,74,0.12)" />
            <text x={point.x} y={height - 8} textAnchor="middle" fill="rgba(71,85,105,0.9)" fontSize="11">{point.label}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="cyberStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}


