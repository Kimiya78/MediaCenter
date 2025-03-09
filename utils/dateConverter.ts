import moment from 'jalali-moment';

/**
 * Converts Gregorian date to Jalali (Shamsi) date
 * @param date - Date string or Date object
 * @param outputFormat - Output format for Jalali date (default: 'jYYYY/jMM/jDD')
 * @returns Formatted Jalali date string
 */
export const toJalali = (date: string | Date, outputFormat: string = 'jYYYY/jMM/jDD'): string => {
  try {
    const gregorianDate = moment(date);
    if (!gregorianDate.isValid()) {
      return 'تاریخ نامعتبر';
    }
    return gregorianDate.locale('fa').format(outputFormat);
  } catch (error) {
    console.error('خطا در تبدیل تاریخ:', error);
    return 'تاریخ نامعتبر';
  }
};

/**
 * Converts Gregorian date to Jalali (Shamsi) date with time
 * @param date - Date string or Date object
 * @returns Formatted Jalali date and time string
 */
export const toJalaliWithTime = (date: string | Date): string => {
  return toJalali(date, 'jYYYY/jMM/jDD HH:mm:ss');
};

/**
 * Get current date in Jalali format
 * @param withTime - Include time in output
 * @returns Current date in Jalali format
 */
export const getCurrentJalaliDate = (withTime: boolean = false): string => {
  const now = new Date();
  return withTime ? toJalaliWithTime(now) : toJalali(now);
};

/**
 * Get Jalali month name
 * @param date - Date string or Date object
 * @returns Persian month name
 */
export const getJalaliMonthName = (date: string | Date): string => {
  try {
    const gregorianDate = moment(date);
    if (!gregorianDate.isValid()) {
      return 'ماه نامعتبر';
    }
    return gregorianDate.locale('fa').format('jMMMM');
  } catch (error) {
    console.error('خطا در دریافت نام ماه:', error);
    return 'ماه نامعتبر';
  }
};

/**
 * Format Jalali date with full text representation
 * @param date - Date string or Date object
 * @returns Formatted Jalali date in text format
 */
export const toJalaliText = (date: string | Date): string => {
  try {
    const gregorianDate = moment(date);
    if (!gregorianDate.isValid()) {
      return 'تاریخ نامعتبر';
    }
    return gregorianDate.locale('fa').format('dddd، jD jMMMM jYYYY');
  } catch (error) {
    console.error('خطا در تبدیل تاریخ به متن:', error);
    return 'تاریخ نامعتبر';
  }
}; 