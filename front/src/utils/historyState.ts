export function cloneHistoryValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

export function pushHistoryEntry(historyRef, snapshot, limit = 80) {
  historyRef.current = [...historyRef.current, cloneHistoryValue(snapshot)].slice(-limit);
}

export function popHistoryEntry(historyRef) {
  if (!historyRef.current.length) {
    return null;
  }

  const nextHistory = [...historyRef.current];
  const snapshot = nextHistory.pop() || null;
  historyRef.current = nextHistory;
  return snapshot ? cloneHistoryValue(snapshot) : null;
}
