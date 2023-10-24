"use client";

import { useEffect, useState } from "react";

type WindowDimensions = {
  width: number;
  height: number;
};

function getWindowDimensions(): WindowDimensions {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function useWindowDimensions(): WindowDimensions {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Set initial dimensions when running on client
    setWindowDimensions(getWindowDimensions());

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export function useIsMobile(): boolean {
  return useWindowDimensions().width < 768;
}
