import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToJalali(date: Date | string): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Parse the date string in the format "YYYY/MM/DD - HH:mm"
    const [datePart, timePart] = date.split(" - ");
    const [year, month, day] = datePart.split("/");
    const [hour, minute] = timePart.split(":");
    dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
  } else {
    dateObj = date;
  }
  
  const persianDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);

  // Convert the format from "۱۴۰۳/۱۲/۱۸, ۱۳:۳۹" to "۱۳:۳۹ - ۱۴۰۳/۱۲/۱۸"
  return persianDate.replace(/(\d{4}\/\d{2}\/\d{2}), (\d{2}:\d{2})/, "$2 - $1");
}
