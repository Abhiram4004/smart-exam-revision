export function calculateStreak(activityLogs) {
  if (!activityLogs || activityLogs.length === 0) return 0;

  const sorted = [...activityLogs]
    .map((log) => {
      const d = new Date(log.date);
      return { ...log, dateStr: d.toISOString().split('T')[0] };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (sorted[0].dateStr !== today && sorted[0].dateStr !== yesterday) return 0;

  let streak = 0;
  let checkDate = new Date(sorted[0].dateStr);

  const dateSet = new Set(sorted.map((l) => l.dateStr));

  while (dateSet.has(checkDate.toISOString().split('T')[0])) {
    streak++;
    checkDate = new Date(checkDate.getTime() - 86400000);
  }

  return streak;
}

export function getTodayProgress(activityLogs) {
  if (!activityLogs || activityLogs.length === 0) return 0;
  const today = new Date().toISOString().split('T')[0];
  const todayLog = activityLogs.find((l) => new Date(l.date).toISOString().split('T')[0] === today);
  return todayLog ? todayLog.cardsReviewed : 0;
}
