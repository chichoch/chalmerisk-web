import { useState, useEffect } from 'react';

const MAP_WIDTH = 1360;
const MAP_HEIGHT = 650;
const CHROME_HEIGHT = 120; // top bar + bottom bar approximate height
const MOBILE_BREAKPOINT = 768;
const MOBILE_MIN_SCALE = 0.5;

function computeScale() {
  const viewportWidth = window.innerWidth;
  const availableHeight = window.innerHeight - CHROME_HEIGHT;
  const heightScale = availableHeight / MAP_HEIGHT;

  let scale: number;

  if (viewportWidth < MOBILE_BREAKPOINT) {
    // On mobile, prefer a larger map and allow horizontal panning.
    scale = Math.min(Math.max(heightScale, MOBILE_MIN_SCALE), 1);
  } else {
    const widthScale = viewportWidth / MAP_WIDTH;
    scale = Math.min(widthScale, heightScale, 1);
  }

  const shouldCenterMap = MAP_WIDTH * scale <= viewportWidth;

  return { scale, shouldCenterMap };
}

export function useMapScale() {
  const [state, setState] = useState(computeScale);

  useEffect(() => {
    function handleResize() {
      setState(computeScale());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
