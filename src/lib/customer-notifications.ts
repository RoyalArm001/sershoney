import type { Lang } from "@/lib/i18n";
import type { CustomerOrderSummary, OrderStatus } from "@/types/order";

export const CUSTOMER_NOTIFY_KEY = "sers-honey.customer-notifications.v1";

const NOTIFIED_STATUSES_KEY = "sers-honey.customer-notified-statuses.v1";

type CustomerNotifyCopy = {
  enableTitle: string;
  enableBody: string;
  enableCta: string;
  enabled: string;
  denied: string;
  unsupported: string;
  savedLocal: string;
  placedTitle: string;
  placedBody: string;
  confirmedTitle: string;
  confirmedBody: string;
  completedTitle: string;
  completedBody: string;
};

export const CUSTOMER_NOTIFY_COPY: Record<Lang, CustomerNotifyCopy> = {
  hy: {
    enableTitle: "Միացնե՞լ ծանուցումները",
    enableBody:
      "Երբ ձեր պատվերը հաստատվի, ծանուցում կստանաք այս սարքում։ Պատվերը նաև պահվում է տեղում՝ որպես հիշողություն։",
    enableCta: "Միացնել ծանուցումները",
    enabled: "Ծանուցումները միացված են այս սարքում",
    denied: "Ծանուցումները արգելափակված են բրաուզերի կարգավորումներում",
    unsupported: "Այս սարքը չի աջակցում ծանուցումներին",
    savedLocal: "Պատվերը պահպանված է այս սարքում՝ «Իմ պատվերները» բաժնում",
    placedTitle: "Պատվերը ընդունված է",
    placedBody: "Շուտով կհաստատենք։ Կարող եք հետևել «Իմ պատվերները» բաժնում։",
    confirmedTitle: "Պատվերը հաստատվել է",
    confirmedBody: "Ձեր պատվերը մշակվում է։ Շնորհակալություն Sers Honey-ին վստահելու համար։",
    completedTitle: "Պատվերն ավարտված է",
    completedBody: "Ձեր պատվերն ավարտվել է։ Շնորհակալություն։",
  },
  en: {
    enableTitle: "Enable notifications?",
    enableBody:
      "When your order is confirmed, you will get a notification on this device. The order is also saved locally as a reminder.",
    enableCta: "Enable notifications",
    enabled: "Notifications are enabled on this device",
    denied: "Notifications are blocked in your browser settings",
    unsupported: "This device does not support notifications",
    savedLocal: "Your order is saved on this device under “My orders”",
    placedTitle: "Order received",
    placedBody: "We will confirm it soon. You can track it under My orders.",
    confirmedTitle: "Order confirmed",
    confirmedBody: "Your order is being prepared. Thank you for choosing Sers Honey.",
    completedTitle: "Order completed",
    completedBody: "Your order is complete. Thank you.",
  },
  ru: {
    enableTitle: "Включить уведомления?",
    enableBody:
      "Когда заказ подтвердят, вы получите уведомление на этом устройстве. Заказ также сохранён локально.",
    enableCta: "Включить уведомления",
    enabled: "Уведомления включены на этом устройстве",
    denied: "Уведомления заблокированы в настройках браузера",
    unsupported: "Это устройство не поддерживает уведомления",
    savedLocal: "Заказ сохранён на этом устройстве в разделе «Мои заказы»",
    placedTitle: "Заказ принят",
    placedBody: "Скоро подтвердим. Следите в разделе «Мои заказы».",
    confirmedTitle: "Заказ подтверждён",
    confirmedBody: "Ваш заказ обрабатывается. Спасибо, что выбрали Sers Honey.",
    completedTitle: "Заказ завершён",
    completedBody: "Ваш заказ завершён. Спасибо.",
  },
};

function readNotifiedMap(): Record<string, OrderStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(NOTIFIED_STATUSES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, OrderStatus>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeNotifiedMap(map: Record<string, OrderStatus>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NOTIFIED_STATUSES_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function customerNotificationsEnabled() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  return (
    window.localStorage.getItem(CUSTOMER_NOTIFY_KEY) === "1" &&
    Notification.permission === "granted"
  );
}

export async function enableCustomerNotifications() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { ok: false as const, reason: "unsupported" as const };
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    window.localStorage.setItem(CUSTOMER_NOTIFY_KEY, "0");
    return { ok: false as const, reason: "denied" as const };
  }

  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch {
      /* page Notification still works */
    }
  }

  window.localStorage.setItem(CUSTOMER_NOTIFY_KEY, "1");
  return { ok: true as const };
}

export async function showCustomerAlert(options: {
  title: string;
  body: string;
  tag: string;
  url: string;
}) {
  if (!customerNotificationsEnabled()) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    if (registration?.active) {
      registration.active.postMessage({
        type: "CUSTOMER_ALERT",
        title: options.title,
        body: options.body,
        tag: options.tag,
        url: options.url,
        requireInteraction: true,
      });
      return;
    }
  } catch {
    /* fall through */
  }

  try {
    new Notification(options.title, {
      body: options.body,
      icon: "/images/sers-honey-icon-192.png",
      tag: options.tag,
    });
  } catch {
    /* ignore */
  }
}

export async function notifyOrderPlaced(
  order: CustomerOrderSummary,
  lang: Lang,
) {
  const copy = CUSTOMER_NOTIFY_COPY[lang];
  await showCustomerAlert({
    title: copy.placedTitle,
    body: copy.placedBody,
    tag: `sers-customer-placed-${order.id}`,
    url: `/${lang}/order#my-orders`,
  });

  const map = readNotifiedMap();
  map[order.id] = order.status;
  writeNotifiedMap(map);
}

export async function notifyOrderStatusChanges(
  orders: CustomerOrderSummary[],
  lang: Lang,
) {
  if (!customerNotificationsEnabled()) return;

  const copy = CUSTOMER_NOTIFY_COPY[lang];
  const map = readNotifiedMap();
  let changed = false;

  for (const order of orders) {
    const previous = map[order.id];
    if (previous === order.status) continue;

    if (order.status === "seen" && previous !== "seen") {
      await showCustomerAlert({
        title: copy.confirmedTitle,
        body: copy.confirmedBody,
        tag: `sers-customer-confirmed-${order.id}`,
        url: `/${lang}/order#my-orders`,
      });
    }

    if (order.status === "completed" && previous !== "completed") {
      await showCustomerAlert({
        title: copy.completedTitle,
        body: copy.completedBody,
        tag: `sers-customer-completed-${order.id}`,
        url: `/${lang}/order#my-orders`,
      });
    }

    map[order.id] = order.status;
    changed = true;
  }

  if (changed) writeNotifiedMap(map);
}
