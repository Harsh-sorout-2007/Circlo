import React from 'react';
export const Avatar = ({ src, alt = "Avatar", size = 32, className = '' }) => {
  return (
    <img 
      src={src || "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png"} 
      alt={alt} 
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      className={className}
    />
  );
};