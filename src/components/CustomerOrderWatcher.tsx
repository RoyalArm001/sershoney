"use client";

import { useEffect } from "react";
import type { Lang } from "@/lib/i18n";
import {
  notifyOrderStatusChanges,
} from "@/lib/customer-notifications";
import {
  ORDER_HISTORY_EVENT,
  mergeOrderStatuses,
  readOrderHistory,
} from "@/lib/order-history";
import type { OrderStatusSnapshot } from "@/types/order";

/**
 * Keeps polling local order history on the customer's device and
 * fires confirmation notifications only on that same device.
 */
export function CustomerOrderWatcher({ lang }: { lang: Lang }) {
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const localOrders = readOrderHistory();
      if (localOrders.length === 0 || cancelled) return;

      try {
        const params = new URLSearchParams();
        localOrders.forEach((order) => params.append("id", order.id));

        const response = await fetch(`/api/orders?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const result = (await response.json()) as {
          orders?: OrderStatusSnapshot[];
        };
        const merged = mergeOrderStatuses(
          Array.isArray(result.orders) ? result.orders : [],
        );
        if (!cancelled) {
          await notifyOrderStatusChanges(merged, lang);
        }
      } catch (error) {
        console.warn("Customer order watcher sync failed:", error);
      }
    };

    void sync();

    const timer = window.setInterval(() => void sync(), 12_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };

    window.addEventListener(ORDER_HISTORY_EVENT, sync);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener(ORDER_HISTORY_EVENT, sync);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [lang]);

  return null;
}
