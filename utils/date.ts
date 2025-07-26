export const format = (date: Date, formatStr: string): string => {
  // Create a new date to avoid timezone issues
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  
  if (formatStr === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`;
  }
  
  if (formatStr === 'MM/dd/yyyy') {
    return `${month}/${day}/${year}`;
  }
  
  return date.toDateString();
};

export const parseDate = (dateString: string): Date => {
  // Parse date string in YYYY-MM-DD format and return local date
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getDayName = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

export const getMonthName = (date: Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[date.getMonth()];
};

export const formatDisplayDate = (date: Date): string => {
  const dayName = getDayName(date);
  const monthName = getMonthName(date);
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${dayName}, ${monthName} ${day}, ${year}`;
};