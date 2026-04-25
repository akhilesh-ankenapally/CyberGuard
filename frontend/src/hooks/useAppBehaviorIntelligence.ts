import { useEffect, useMemo, useRef, useState } from 'react';
import { analyzeAppRisk, initialAppSecurityData, mutateUsageState } from '../data/appSecurity';
import type { AppSecurityRecord } from '../types';

export function useAppBehaviorIntelligence(onThreatDetected?: (app: AppSecurityRecord) => void) {
  const [apps, setApps] = useState<AppSecurityRecord[]>(initialAppSecurityData);
  const [selectedAppId, setSelectedAppId] = useState(initialAppSecurityData[0]?.id || '');
  const [lastThreatApp, setLastThreatApp] = useState<AppSecurityRecord | null>(null);
  const seenThreatKeysRef = useRef(new Set<string>());
  const threatCallbackRef = useRef(onThreatDetected);

  useEffect(() => {
    threatCallbackRef.current = onThreatDetected;
  }, [onThreatDetected]);

  useEffect(() => {
    let active = true;
    let timerId: number | undefined;

    const scheduleNext = () => {
      if (!active) return;
      const nextDelay = 10000 + Math.floor(Math.random() * 5000);
      timerId = window.setTimeout(() => {
        setApps((current) => {
          if (!current.length) return current;
          const index = Math.floor(Math.random() * current.length);
          const target = current[index];
          const updated = analyzeAppRisk({
            id: target.id,
            name: target.name,
            permissions: target.permissions,
            usage: mutateUsageState(target.usage),
          });

          const nextApps = current.map((item, itemIndex) => (itemIndex === index ? updated : item));

          if (updated.risk_level === 'Threat') {
            const threatKey = `${updated.id}-${updated.risk_score}-${updated.updated_at.slice(0, 16)}`;
            if (!seenThreatKeysRef.current.has(threatKey)) {
              seenThreatKeysRef.current.add(threatKey);
              setLastThreatApp(updated);
              threatCallbackRef.current?.(updated);
            }
          }

          return nextApps;
        });
        scheduleNext();
      }, nextDelay);
    };

    scheduleNext();
    return () => {
      active = false;
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  const selectedApp = useMemo(() => apps.find((item) => item.id === selectedAppId) || apps[0] || null, [apps, selectedAppId]);

  const riskSummary = useMemo(() => {
    return apps.reduce(
      (acc, app) => {
        acc.total += 1;
        if (app.risk_level === 'Threat') acc.threat += 1;
        if (app.risk_level === 'Suspicious') acc.suspicious += 1;
        if (app.risk_level === 'Safe') acc.safe += 1;
        return acc;
      },
      { total: 0, threat: 0, suspicious: 0, safe: 0 },
    );
  }, [apps]);

  return {
    apps,
    selectedApp,
    selectedAppId,
    setSelectedAppId,
    lastThreatApp,
    riskSummary,
  };
}


