export const format = (date: Date, formatStr: string): string => {
  // Use local date components directly to avoid timezone issues
  // Create a new date to avoid mutating the original
  const localDate = new Date(date.getTime());
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  
  if (formatStr === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`;
  }
  
  if (formatStr === 'MM/dd/yyyy') {
    return `${month}/${day}/${year}`;
  }
  
  return localDate.toDateString();
};

export const parseDate = (dateString: string): Date => {
  // Parse date string in YYYY-MM-DD format and return local date
  // This ensures we get the exact date without timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Validate the parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.error('Invalid date string:', dateString);
    return new Date();
  }
  
  const date = new Date(year, month - 1, day);
  // Set time to noon to avoid any timezone edge cases
  date.setHours(12, 0, 0, 0);
  
  console.log('parseDate:', dateString, '->', date.toISOString(), 'local:', format(date, 'yyyy-MM-dd'));
  return date;
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