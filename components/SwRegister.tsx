"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        // eslint-disable-next-line no-console
        console.log("Service worker registered:", reg.scope);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Service worker registration failed:", err);
      }
    };

    // Register after load to avoid interfering with Next hydration
    if (document.readyState === "complete") {
      registerSW();
    } else {
      const onLoad = () => registerSW();
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return null;
}
