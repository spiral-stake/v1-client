import { toastError } from "./toastWrapper";

export const handleAsync = <T extends any[]>(
  fn: (...args: T) => Promise<void>,
  setLoading: (value: boolean) => void
) => {
  return async (...args: T) => {
    setLoading(true);

    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      console.dir(error);
      toastError("Error", error.shortMessage);
      return undefined;
    } finally {
      setLoading(false);
    }
  };
};
