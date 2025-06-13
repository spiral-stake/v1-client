export function getLocalTimeFromTimestamp(timestamp: number) {
  // Ensure the timestamp is in milliseconds. If it's in seconds, convert it to milliseconds.
  if (timestamp.toString().length === 10) {
    timestamp *= 1000; // Convert seconds to milliseconds
  }

  // Create a new Date object using the provided timestamp
  const date = new Date(timestamp);

  // Array of month abbreviations
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Extract the date components
  const day = date.getDate().toString().padStart(2, "0");
  const month = monthNames[date.getMonth()]; // Get abbreviated month

  // Extract the time components
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  // Format date and time
  const formattedDate = `${day} ${month}`;
  const formattedTime = `${hours}:${minutes}`;

  // Return the full formatted date and time
  return { formattedDate, formattedTime };
}

export function parseTime(time: string, unit: string) {
  let _time = parseInt(time);

  if (unit === "mins" || unit === "min") {
    _time = _time * 60;
  }

  if (unit === "hours" || unit === "hour") {
    _time = _time * 60 * 60;
  }

  if (unit === "days" || unit === "day") {
    _time = _time * 60 * 60 * 24;
  }

  if (unit === "weeks" || unit === "week") {
    _time = _time * 60 * 60 * 24 * 7;
  }

  if (unit === "months" || unit === "month") {
    _time = _time * 60 * 60 * 24 * 30.44;
  }

  return _time.toString();
}

export function getCurrentTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function formatTime(timeInSeconds: number) {
  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInMonth = secondsInDay * 30.44; // Approximate average month length
  const secondsInYear = secondsInDay * 365.25; // Approximate average year length

  let timeUnit;
  let timeValue;

  if (timeInSeconds < secondsInMinute) {
    timeUnit = "Second";
    timeValue = timeInSeconds;
  } else if (timeInSeconds < secondsInHour) {
    timeUnit = "Minute";
    timeValue = Math.floor(timeInSeconds / secondsInMinute);
  } else if (timeInSeconds < secondsInDay) {
    timeUnit = "Hour";
    timeValue = Math.floor(timeInSeconds / secondsInHour);
  } else if (timeInSeconds < secondsInMonth) {
    timeUnit = "Day";
    timeValue = Math.floor(timeInSeconds / secondsInDay);
  } else if (timeInSeconds < secondsInYear) {
    timeUnit = "Month";
    timeValue = Math.floor(timeInSeconds / secondsInMonth);
  } else {
    timeUnit = "Year";
    timeValue = Math.floor(timeInSeconds / secondsInYear);
  }

  return { value: timeValue, unit: timeValue > 1 ? timeUnit + "s" : timeUnit };
}

export function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}
