// React Native compatible — pure JS date arithmetic, no browser/DOM APIs used.
export const formatLastActive = (dateString) => {
  if (!dateString) return "";
  const now = new Date()
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}