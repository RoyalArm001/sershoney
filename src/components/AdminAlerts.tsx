"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type WakeLockHandle = {
  release: () => Promise<void>;
  addEventListener: (type: string, listener: () => void) => void;
};

const NOTIFY_STORAGE_KEY = "sers-admin.notifications.enabled";

async function ensureServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.warn("Service worker registration failed:", error);
    return null;
  }
}

export function useAdminAlerts() {
  const [canInstall, setCanInstall] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const wakeLockRef = useRef<WakeLockHandle | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandalone(standalone);

    const permission =
      "Notification" in window ? Notification.permission : "denied";
    const stored = window.localStorage.getItem(NOTIFY_STORAGE_KEY) === "1";
    setNotificationsEnabled(stored && permission === "granted");

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      installPromptRef.current = event as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    void (async () => {
      registrationRef.current = await ensureServiceWorker();
    })();

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      void wakeLockRef.current?.release().catch(() => undefined);
      wakeLockRef.current = null;
    };
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator) || document.visibilityState !== "visible") {
      return;
    }

    try {
      wakeLockRef.current = await (
        navigator as Navigator & {
          wakeLock: { request: (type: "screen") => Promise<WakeLockHandle> };
        }
      ).wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
    } catch {
      /* unsupported / denied */
    }
  }, []);

  useEffect(() => {
    void requestWakeLock();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [requestWakeLock]);

  const enableNotifications = useCallback(async () => {
    if (!("Notification" in window)) {
      return { ok: false as const, reason: "unsupported" as const };
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") {
      setNotificationsEnabled(false);
      window.localStorage.setItem(NOTIFY_STORAGE_KEY, "0");
      return { ok: false as const, reason: "denied" as const };
    }

    registrationRef.current = await ensureServiceWorker();
    window.localStorage.setItem(NOTIFY_STORAGE_KEY, "1");
    setNotificationsEnabled(true);
    return { ok: true as const };
  }, []);

  const alertNewOrders = useCallback(
    async (count: number, preview?: string) => {
      if (!notificationsEnabled || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const title =
        count === 1
          ? "Նոր պատվեր — Sers Honey"
          : `${count} նոր պատվեր — Sers Honey`;
      const body = preview || "Բացեք ադմին պանելը պատվերը տեսնելու համար";

      try {
        const registration =
          registrationRef.current ||
          (await navigator.serviceWorker.getRegistration("/"));

        if (registration?.active) {
          registration.active.postMessage({
            type: "ORDER_ALERT",
            title,
            body,
            tag: `sers-admin-order-${Date.now()}`,
            url: "/admin",
            requireInteraction: true,
          });
          return;
        }
      } catch {
        /* fall through */
      }

      try {
        new Notification(title, {
          body,
          icon: "/images/sers-honey-icon-192.png",
          tag: `sers-admin-order-${Date.now()}`,
        });
      } catch {
        /* ignore */
      }

      try {
        window.navigator.vibrate?.([200, 100, 200]);
      } catch {
        /* ignore */
      }
    },
    [notificationsEnabled],
  );

  const promptInstall = useCallback(async () => {
    const promptEvent = installPromptRef.current;
    if (!promptEvent) return false;

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    installPromptRef.current = null;
    setCanInstall(false);
    return choice.outcome === "accepted";
  }, []);

  return {
    canInstall,
    isStandalone,
    notificationsEnabled,
    enableNotifications,
    alertNewOrders,
    promptInstall,
  };
}
