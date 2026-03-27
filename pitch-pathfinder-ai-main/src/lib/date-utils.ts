/**
 * Formats a date string into a relative time string (e.g., "2 hours ago")
 * 
 * @param dateString - ISO date string to format
 * @returns Formatted relative time string
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  // Less than an hour
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  // Less than a day
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  // Less than a week
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  // Less than a month
  if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)}w ago`;
  }
  
  // Less than a year
  if (diffInDays < 365) {
    return `${Math.floor(diffInDays / 30)}mo ago`;
  }
  
  // More than a year
  return `${Math.floor(diffInDays / 365)}y ago`;
}

/**
 * Formats a date string into a localized date format
 * 
 * @param dateString - ISO date string to format
 * @param options - Intl.DateTimeFormatOptions for customizing the output
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Formats a date string into a localized time format
 * 
 * @param dateString - ISO date string to format
 * @param options - Intl.DateTimeFormatOptions for customizing the output
 * @returns Formatted time string
 */
export function formatTime(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: 'numeric',
    hour12: true
  }
): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}