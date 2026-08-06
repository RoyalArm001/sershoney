/* Shared service worker for Admin + customer order alerts. */
const CACHE_NAME = "sers-honey-sw-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

async function showAlert(data) {
  const title = data.title || "Sers Honey";
  const options = {
    body: data.body || "",
    icon: "/images/sers-honey-icon-192.png",
    badge: "/images/sers-honey-icon-192.png",
    tag: data.tag || "sers-honey",
    renotify: true,
    requireInteraction: Boolean(data.requireInteraction),
    data: { url: data.url || "/" },
    vibrate: [180, 80, 180],
  };

  await self.registration.showNotification(title, options);
}

self.addEventListener("push", (event) => {
  let data = {
    title: "Նոր պատվեր — Sers Honey",
    body: "Բացեք ադմին պանելը պատվերը տեսնելու համար",
    url: "/admin",
    tag: `sers-admin-order-${Date.now()}`,
    requireInteraction: true,
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    try {
      if (event.data) {
        data.body = event.data.text();
      }
    } catch {
      /* keep defaults */
    }
  }

  event.waitUntil(showAlert(data));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clientsList) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(targetUrl);
            } catch {
              /* ignore */
            }
          }
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || (data.type !== "ORDER_ALERT" && data.type !== "CUSTOMER_ALERT")) {
    return;
  }

  event.waitUntil(
    showAlert({
      title: data.title,
      body: data.body,
      tag: data.tag,
      url: data.url,
      requireInteraction: data.requireInteraction,
    }),
  );
});
