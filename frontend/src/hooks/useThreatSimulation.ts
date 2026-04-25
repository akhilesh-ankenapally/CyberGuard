import { useEffect, useMemo, useState } from 'react';
import type { AnalysisResult, DashboardStats, Platform, ThreatRecord } from '../types';
import { analyzeWithFallback, fetchThreats } from '../lib/api';

const initialStats: DashboardStats = {
  totalMessages: 0,
  threatsDetected: 0,
  safeMessages: 0,
  suspiciousMessages: 0,
};

function deriveStats(records: ThreatRecord[]): DashboardStats {
  return records.reduce<DashboardStats>(
    (accumulator, record) => {
      accumulator.totalMessages += 1;
      if (record.risk_level === 'Threat') accumulator.threatsDetected += 1;
      if (record.risk_level === 'Safe') accumulator.safeMessages += 1;
      if (record.risk_level === 'Suspicious') accumulator.suspiciousMessages += 1;
      return accumulator;
    },
    { ...initialStats },
  );
}

export function useThreatSimulation() {
  const [records, setRecords] = useState<ThreatRecord[]>([]);
  const [newThreatIds, setNewThreatIds] = useState<Set<string>>(new Set());
  const [incomingThreats, setIncomingThreats] = useState<ThreatRecord[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'All'>('All');
  const [selectedRisk, setSelectedRisk] = useState<'All' | 'Safe' | 'Suspicious' | 'Threat'>('All');
  const [monitoringState, setMonitoringState] = useState<'Live Monitoring' | 'Secure Network Status'>('Live Monitoring');
  const [connectionState, setConnectionState] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [aiActive, setAiActive] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState('Analyzing message...');
  const [customMessage, setCustomMessage] = useState('');

  function mergeThreats(current: ThreatRecord[], incoming: ThreatRecord[]) {
    const currentMap = new Map(current.map((item) => [item.id, item]));
    const next: ThreatRecord[] = [];
    const newlyArrived: string[] = [];

    for (const item of incoming) {
      const existing = currentMap.get(item.id);
      if (!existing) {
        newlyArrived.push(item.id);
        next.push(item);
        continue;
      }

      const isSame =
        existing.message === item.message &&
        existing.risk_level === item.risk_level &&
        existing.confidence === item.confidence &&
        existing.timestamp === item.timestamp &&
        existing.platform === item.platform &&
        existing.sender === item.sender;
      next.push(isSame ? existing : item);
    }

    return {
      items: next.slice(0, 100),
      newlyArrived,
    };
  }

  useEffect(() => {
    let active = true;
    let timerId: number | undefined;
    let clearHighlightTimer: number | undefined;

    const scheduleNext = () => {
      if (!active) return;
      const nextDelay = 3000 + Math.random() * 2000;
      timerId = window.setTimeout(pollThreats, nextDelay);
    };

    const pollThreats = async () => {
      try {
        const remoteThreats = await fetchThreats();
        if (!active) return;
        setConnectionState('connected');
        setRecords((current) => {
          const merged = mergeThreats(current, remoteThreats);
          if (merged.newlyArrived.length > 0) {
            const arrivedRecords = merged.items.filter((record) => merged.newlyArrived.includes(record.id));
            setIncomingThreats(arrivedRecords);
            setNewThreatIds(new Set(merged.newlyArrived));
            if (clearHighlightTimer) {
              window.clearTimeout(clearHighlightTimer);
            }
            clearHighlightTimer = window.setTimeout(() => {
              setNewThreatIds(new Set());
              setIncomingThreats([]);
            }, 2200);
          }
          return merged.items;
        });
        setMonitoringState('Live Monitoring');
      } catch {
        if (!active) return;
        setMonitoringState('Secure Network Status');
        setConnectionState('disconnected');
      }
      scheduleNext();
    };

    void pollThreats();

    return () => {
      active = false;
      if (timerId) {
        window.clearTimeout(timerId);
      }
      if (clearHighlightTimer) {
        window.clearTimeout(clearHighlightTimer);
      }
    };
  }, []);

  const stats = useMemo(() => deriveStats(records), [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const platformMatch = selectedPlatform === 'All' || record.platform === selectedPlatform;
      const riskMatch = selectedRisk === 'All' || record.risk_level === selectedRisk;
      return platformMatch && riskMatch;
    });
  }, [records, selectedPlatform, selectedRisk]);

  async function runAnalysis(input: string) {
    const text = input.trim();
    if (!text) return;
    setCustomMessage(text);
    setIsScanning(true);
    setScanStage('Analyzing message...');
    setTimeout(() => setScanStage('Checking patterns...'), 450);
    setTimeout(() => setScanStage('Evaluating threat signals...'), 900);
    try {
      const result = await analyzeWithFallback(text, 'SMS');
      setTimeout(() => {
        setAnalysis(result);
        setIsScanning(false);
        setRecords((current) => [result, ...current.filter((item) => item.id !== result.id)].slice(0, 100));
        setIncomingThreats([result]);
        setNewThreatIds(new Set([result.id]));
        setMonitoringState('Live Monitoring');
        setConnectionState('connected');
        setAiActive(true);
        window.setTimeout(() => {
          setIncomingThreats([]);
          setNewThreatIds(new Set());
        }, 2200);
      }, 1100 + Math.random() * 700);
    } catch {
      setIsScanning(false);
      setMonitoringState('Secure Network Status');
      setConnectionState('disconnected');
    }
  }

  const platformDistribution = useMemo(() => {
    const total = records.length || 1;
    const counts = records.reduce<Record<Platform, number>>(
      (acc, record) => {
        acc[record.platform] += 1;
        return acc;
      },
      { WhatsApp: 0, Instagram: 0, Email: 0, SMS: 0 },
    );
    return (Object.entries(counts) as Array<[Platform, number]>).map(([platform, count]) => ({
      platform,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [records]);

  return {
    records: filteredRecords,
    allRecords: records,
    stats,
    selectedPlatform,
    selectedRisk,
    setSelectedPlatform,
    setSelectedRisk,
    monitoringState,
    connectionState,
    aiActive,
    analysis,
    isScanning,
    scanStage,
    newThreatIds,
    incomingThreats,
    platformDistribution,
    customMessage,
    setCustomMessage,
    runAnalysis,
  };
}


