import React from 'react';
import { ArrowUp, ArrowDown, MessageSquare, Bookmark, Search } from 'lucide-react';

export const IconUpvote = ({ active, className = '' }) => (
  <ArrowUp className={className} strokeWidth={active ? 3 : 2} size={18} />
);

export const IconDownvote = ({ active, className = '' }) => (
  <ArrowDown className={className} strokeWidth={active ? 3 : 2} size={18} />
);

export const IconComment = ({ className = '' }) => (
  <MessageSquare className={className} strokeWidth={2} size={18} />
);

export const IconBookmark = ({ active, className = '' }) => (
  <Bookmark className={className} strokeWidth={2} fill={active ? "currentColor" : "none"} size={18} />
);

export const IconSearch = ({ className = '' }) => (
  <Search className={className} strokeWidth={2} size={18} />
);
