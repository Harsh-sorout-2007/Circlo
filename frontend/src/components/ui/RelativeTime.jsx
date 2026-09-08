import { useState, useEffect } from 'react';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  
  if (diff < 0) return 'Just now';
  
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
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    if (!dateStr) return;
    
    const timer = setTimeout(() => {
      setFormattedTime(formatTimeAgo(dateStr));
    }, 0);

    const interval = setInterval(() => {
      setFormattedTime(formatTimeAgo(dateStr));
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [dateStr]);

  if (!dateStr) return null;

  return (
    <span className={className} title={new Date(dateStr).toLocaleString()}>
      {formattedTime}
    </span>
  );
};
