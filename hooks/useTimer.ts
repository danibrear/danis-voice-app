import { useMemo, useRef, useState } from "react";

export const useTimer = (
  timeout: number,
  options?: { immediate?: boolean },
) => {
  const [time, setTime] = useState(-1);

  const oldTime = useRef(-1);

  const [fn, setFn] = useState<() => void>(() => {});

  const clear = () => {
    setTime(-1);
    setFn(() => {});
    oldTime.current = -1;
  };

  const start = (newFn: () => void) => {
    setFn(() => newFn);
    setTime(0);
  };

  useMemo(() => {
    if (
      time === oldTime.current ||
      time < 0 ||
      (time > 0 && oldTime.current < 0)
    ) {
      oldTime.current = time;
      return;
    }
    oldTime.current = time;
    if (options?.immediate && time === 0) {
      fn();
    }
    const timer = setTimeout(() => {
      if (!options?.immediate && oldTime.current >= 0) {
        fn();
      }
      setTime(time + timeout);
    }, timeout);
    return () => clearTimeout(timer);
  }, [time, options?.immediate, timeout, fn]);

  return { start, clear };
};
