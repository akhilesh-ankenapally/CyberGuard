import type { Platform } from '../types';
import { platformMeta } from '../data/platforms';

type DistributionItem = {
  platform: Platform;
  count: number;
  percentage: number;
};

export function PlatformDistribution({ items }: { items: DistributionItem[] }) {
  return (
    <div className="rounded-[24px] border border-[#D8D1C7] bg-[#FAF8F5] p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
      <div className="mb-3 text-sm font-semibold text-cyber-text">Platform Distribution</div>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = platformMeta[item.platform].icon;
          return (
            <div key={item.platform}>
              <div className="mb-1 flex items-center justify-between text-xs text-cyber-muted">
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: platformMeta[item.platform].accent }} />
                  {item.platform}
                </span>
                <span>{item.percentage}% ({item.count})</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    background: `linear-gradient(90deg, ${platformMeta[item.platform].accent}, rgba(15,23,42,0.08))`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



