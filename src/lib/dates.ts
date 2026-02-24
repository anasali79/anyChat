import { format, isToday, isThisYear } from "date-fns";

export function formatMessageTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "p");
  }

  if (isThisYear(date)) {
    return format(date, "MMM d, p");
  }

  return format(date, "MMM d, yyyy, p");
}

