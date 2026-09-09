import { useState, useEffect } from 'react';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diff = Math.max(0, Date.now() - date.getTime());
  
  if (diff === 0) return 'Just now';
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 52) return `${weeks}w`;
  return `${years}y`;
};

export const RelativeTime = ({ dateStr, className = "" }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!dateStr) return null;

  const formattedTime = formatTimeAgo(dateStr);

  return (
    <span className={className} title={new Date(dateStr).toLocaleString()}>
      {formattedTime}
    </span>
  );
};
