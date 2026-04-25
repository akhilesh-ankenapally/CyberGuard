import type { AnalysisResult, ThreatRecord } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function analyzeViaBackend(message: string): Promise<AnalysisResult> {
  return requestJson<AnalysisResult>('/analyze', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function fetchThreats(): Promise<ThreatRecord[]> {
  return requestJson<ThreatRecord[]>('/threats?limit=50');
}

export async function sendStreamPayload(payload: { message: string; platform: string; sender: string }): Promise<AnalysisResult> {
  return requestJson<AnalysisResult>('/stream', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function analyzeWithFallback(message: string, platform: string) {
  const result = await analyzeViaBackend(message);
  return { ...result, source: 'backend' as const };
}

export async function loadThreatsWithFallback(): Promise<ThreatRecord[]> {
  return fetchThreats();
}


