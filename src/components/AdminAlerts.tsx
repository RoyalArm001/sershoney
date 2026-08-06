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

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function ensureServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.warn("Service worker registration failed:", error);
    return null;
  }
}

async function subscribeAdminPush(
  registration: ServiceWorkerRegistration,
) {
  if (!("PushManager" in window)) {
    return { ok: false as const, reason: "unsupported" as const };
  }

  const keyResponse = await fetch("/api/admin/push", { cache: "no-store" });
  if (!keyResponse.ok) {
    return { ok: false as const, reason: "unsupported" as const };
  }

  const { publicKey } = (await keyResponse.json()) as { publicKey?: string };
  if (!publicKey) {
    return { ok: false as const, reason: "unsupported" as const };
  }

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  const saveResponse = await fetch("/api/admin/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });

  if (!saveResponse.ok) {
    return { ok: false as const, reason: "unsupported" as const };
  }

  return { ok: true as const };
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
      if (
        stored &&
        permission === "granted" &&
        registrationRef.current
      ) {
        await subscribeAdminPush(registrationRef.current).catch(() => undefined);
      }
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
    if (!registrationRef.current) {
      return { ok: false as const, reason: "unsupported" as const };
    }

    const pushResult = await subscribeAdminPush(registrationRef.current);
    if (!pushResult.ok) {
      return pushResult;
    }

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
