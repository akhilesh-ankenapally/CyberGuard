export function getRelativeTimeLabel(timestamp: string | Date): string {
  const source = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - source.getTime()) / 1000));

  if (deltaSeconds <= 3) return 'Just now';
  if (deltaSeconds < 60) return `${deltaSeconds} sec ago`;

  const minutes = Math.floor(deltaSeconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function formatUpdatedNow(): string {
  return 'Updated: Just now';
}


