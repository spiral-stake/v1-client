import Tag from "./Tag";

export const renderCountdownTag = ({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) => {
  const formattedTime = `${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(
    2,
    "0"
  )}m : ${String(seconds).padStart(2, "0")}s`; // Needs to change on production, need to add days as well

  return <Tag dot={false} color="green" text={formattedTime} />;
};

export const renderCountdown = ({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) => {
  return `${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(
    seconds
  ).padStart(2, "0")}s`;
};
