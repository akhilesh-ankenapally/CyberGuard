export function ActivityIndicator({ active }: { active: boolean }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <span className={`relative inline-flex h-3 w-3 rounded-full ${active ? 'bg-cyber-green' : 'bg-cyber-yellow'}`}>
        <span className={`absolute inset-0 rounded-full ${active ? 'animate-ping bg-cyber-green/40' : 'animate-pulse bg-cyber-yellow/30'}`} />
      </span>
      <span className="text-sm font-semibold text-cyber-text">AI ACTIVE</span>
    </div>
  );
}


