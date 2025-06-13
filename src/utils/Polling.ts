import { useEffect, useRef } from "react";

export const usePolling = (callback: () => void, intervalInSeconds: number) => {
  const callbackRef = useRef(callback);

  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Always point to latest callback without causing effect re-runs
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const tick = () => callbackRef.current();
    intervalIdRef.current = setInterval(tick, intervalInSeconds * 1000);

    return () => stopPolling();
  }, []);

  const stopPolling = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  return { stopPolling };
};
