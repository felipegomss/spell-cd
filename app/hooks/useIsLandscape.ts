import { useEffect, useState } from "react";

export function useIsLandscape() {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    function update() {
      if (typeof window === "undefined") return;
      setIsLandscape(window.innerWidth > window.innerHeight);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isLandscape;
}
