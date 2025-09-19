export function daysLeft(dateString: string): number {
  // Parse the string into a Date
  const targetDate = new Date(dateString);

  // Ensure it's valid
  if (isNaN(targetDate.getTime())) {
    throw new Error("Invalid date format. Use format like '20 NOV 2025'");
  }

  // Normalize today's date (midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Difference in ms → number
  const diff: number = targetDate.getTime() - today.getTime();

  // Convert to days
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}