// 🎯 TIMEZONE-SAFE DATE FORMATTING
// Always uses local date components to avoid UTC conversion issues
export const format = (date: Date, formatStr: string): string => {
  console.log('📅 format() called:', {
    inputDate: date.toISOString(),
    localString: date.toString(),
    formatStr,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  // Extract local date components directly (no timezone conversion)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  let result: string;
  
  if (formatStr === 'yyyy-MM-dd') {
    result = `${year}-${month}-${day}`;
  } else if (formatStr === 'MM/dd/yyyy') {
    result = `${month}/${day}/${year}`;
  } else {
    result = date.toDateString();
  }
  
  console.log('✅ format() result:', result);
  return result;
};

// 🎯 TIMEZONE-SAFE DATE PARSING
// Creates local Date object from YYYY-MM-DD string without UTC conversion
export const parseDate = (dateString: string): Date => {
  console.log('📅 parseDate() called with:', dateString);
  
  // Parse date components
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.error('❌ Invalid date string:', dateString);
    const fallback = new Date();
    console.log('🔄 Using fallback date:', format(fallback, 'yyyy-MM-dd'));
    return fallback;
  }
  
  // Create local date (month is 0-indexed in Date constructor)
  const date = new Date(year, month - 1, day);
  
  // Set to noon to avoid any DST/timezone edge cases
  const NOON_HOUR = 12;
  const ZERO_MINUTES = 0;
  const ZERO_SECONDS = 0;
  const ZERO_MILLISECONDS = 0;
  
  date.setHours(NOON_HOUR, ZERO_MINUTES, ZERO_SECONDS, ZERO_MILLISECONDS);
  
  console.log('✅ parseDate() result:', {
    input: dateString,
    output: date.toISOString(),
    localString: date.toString(),
    formatted: format(date, 'yyyy-MM-dd')
  });
  
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

// 🎯 HUMAN-READABLE DATE FORMATTING
// Creates display-friendly date string (e.g., "Monday, January 8, 2025")
export const formatDisplayDate = (date: Date): string => {
  console.log('📅 formatDisplayDate() called:', date.toISOString());
  
  const dayName = getDayName(date);
  const monthName = getMonthName(date);
  const day = date.getDate();
  const year = date.getFullYear();
  
  const result = `${dayName}, ${monthName} ${day}, ${year}`;
  console.log('✅ formatDisplayDate() result:', result);
  
  return result;
};

// 🎯 CREATE LOCAL DATE FROM COMPONENTS
// Creates a Date object from year, month, day without timezone issues
export const createLocalDate = (year: number, month: number, day: number): Date => {
  console.log('📅 createLocalDate() called:', { year, month, day });
  
  // Create date with local timezone (month is 0-indexed)
  const date = new Date(year, month - 1, day);
  
  // Set to noon to avoid DST issues
  const NOON_HOUR = 12;
  date.setHours(NOON_HOUR, 0, 0, 0);
  
  console.log('✅ createLocalDate() result:', {
    input: { year, month, day },
    output: date.toISOString(),
    formatted: format(date, 'yyyy-MM-dd')
  });
  
  return date;
};

// 🎯 GET TODAY'S DATE IN LOCAL TIMEZONE
// Returns today's date as YYYY-MM-DD string in local timezone
export const getTodayString = (): string => {
  const today = new Date();
  const result = format(today, 'yyyy-MM-dd');
  console.log('📅 getTodayString():', result);
  return result;
};