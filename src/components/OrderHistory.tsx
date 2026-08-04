"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatAmd } from "@/content/regions";
import type { Lang } from "@/lib/i18n";
import {
  ORDER_HISTORY_EVENT,
  mergeOrderStatuses,
  readOrderHistory,
} from "@/lib/order-history";
import type {
  CustomerOrderSummary,
  OrderStatus,
  OrderStatusSnapshot,
} from "@/types/order";

type HistoryCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  localNote: string;
  loading: string;
  refresh: string;
  refreshing: string;
  syncError: string;
  emptyTitle: string;
  emptyText: string;
  order: string;
  delivery: string;
  pickup: string;
  location: string;
  package: string;
  total: string;
  updated: string;
  statuses: Record<OrderStatus, string>;
};

const HISTORY_COPY: Record<Lang, HistoryCopy> = {
  hy: {
    eyebrow: "Պատվերների պատմություն",
    title: "Իմ պատվերները",
    lead: "Այս սարքից ուղարկված պատվերները և դրանց ընթացիկ կարգավիճակները։",
    localNote: "Պահվում է այս դիտարկիչում",
    loading: "Պատվերները բեռնվում են...",
    refresh: "Թարմացնել",
    refreshing: "Թարմացվում է...",
    syncError: "Կարգավիճակը հիմա չհաջողվեց թարմացնել։ Պատվերը պահպանված է։",
    emptyTitle: "Դեռ պահպանված պատվեր չունեք",
    emptyText: "Հաջող ուղարկված պատվերը կհայտնվի այստեղ։",
    order: "Պատվեր",
    delivery: "Առաքում",
    pickup: "Ինքնաառաքում",
    location: "Վայր",
    package: "Քանակ",
    total: "Ընդհանուր",
    updated: "Թարմացվել է",
    statuses: {
      new: "Ընդունված է",
      seen: "Մշակվում է",
      completed: "Ավարտված է",
    },
  },
  en: {
    eyebrow: "Order history",
    title: "My orders",
    lead: "Orders sent from this device and their current status.",
    localNote: "Saved in this browser",
    loading: "Loading orders...",
    refresh: "Refresh",
    refreshing: "Refreshing...",
    syncError: "The status could not be refreshed. Your order is still saved.",
    emptyTitle: "No saved orders yet",
    emptyText: "A successfully submitted order will appear here.",
    order: "Order",
    delivery: "Delivery",
    pickup: "Pickup",
    location: "Location",
    package: "Quantity",
    total: "Total",
    updated: "Updated",
    statuses: {
      new: "Received",
      seen: "In progress",
      completed: "Completed",
    },
  },
  ru: {
    eyebrow: "История заказов",
    title: "Мои заказы",
    lead: "Заказы, отправленные с этого устройства, и их текущий статус.",
    localNote: "Сохранено в этом браузере",
    loading: "Заказы загружаются...",
    refresh: "Обновить",
    refreshing: "Обновляется...",
    syncError: "Не удалось обновить статус. Ваш заказ сохранен.",
    emptyTitle: "Сохраненных заказов пока нет",
    emptyText: "Успешно отправленный заказ появится здесь.",
    order: "Заказ",
    delivery: "Доставка",
    pickup: "Самовывоз",
    location: "Место",
    package: "Количество",
    total: "Итого",
    updated: "Обновлено",
    statuses: {
      new: "Принят",
      seen: "В обработке",
      completed: "Завершен",
    },
  },
};

const DATE_LOCALES: Record<Lang, string> = {
  hy: "hy-AM",
  en: "en-US",
  ru: "ru-RU",
};

function formatDate(value: string, lang: Lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(DATE_LOCALES[lang], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatWeight(weightG: number, lang: Lang) {
  if (weightG >= 1000) {
    const value = weightG / 1000;
    return `${value} ${lang === "hy" ? "կգ" : lang === "ru" ? "кг" : "kg"}`;
  }

  return `${weightG} ${lang === "hy" ? "գ" : lang === "ru" ? "г" : "g"}`;
}

function statusTone(status: OrderStatus) {
  if (status === "completed") {
    return "order-status-completed";
  }

  if (status === "seen") {
    return "order-status-seen";
  }

  return "order-status-new";
}

export function OrderHistory({ lang }: { lang: Lang }) {
  const copy = HISTORY_COPY[lang];
  const [orders, setOrders] = useState<CustomerOrderSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  const syncOrders = useCallback(async () => {
    const localOrders = readOrderHistory();
    setOrders(localOrders);
    setLoaded(true);
    setSyncError(false);

    if (localOrders.length === 0) return;

    setSyncing(true);

    try {
      const params = new URLSearchParams();
      localOrders.forEach((order) => params.append("id", order.id));

      const response = await fetch(`/api/orders?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Order status request failed with ${response.status}`);
      }

      const result = (await response.json()) as {
        orders?: OrderStatusSnapshot[];
      };
      const merged = mergeOrderStatuses(
        Array.isArray(result.orders) ? result.orders : []
      );
      setOrders(merged);
    } catch (error) {
      console.error(error);
      setSyncError(true);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    void syncOrders();

    const handleHistoryChange = () => void syncOrders();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void syncOrders();
    };
    const refreshTimer = window.setInterval(() => void syncOrders(), 30_000);

    window.addEventListener(ORDER_HISTORY_EVENT, handleHistoryChange);
    window.addEventListener("storage", handleHistoryChange);
    window.addEventListener("focus", handleHistoryChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener(ORDER_HISTORY_EVENT, handleHistoryChange);
      window.removeEventListener("storage", handleHistoryChange);
      window.removeEventListener("focus", handleHistoryChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncOrders]);

  return (
    <section
      id="my-orders"
      className="mx-auto mt-10 w-full min-w-0 max-w-[920px] border-t border-[var(--line)] pt-8 sm:mt-14 sm:pt-10"
      aria-labelledby="my-orders-title"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--gold)]">
            {copy.eyebrow}
          </p>
          <h2
            id="my-orders-title"
            className="mt-2 text-[clamp(1.65rem,3vw,2.35rem)] font-semibold leading-tight text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {copy.title}
          </h2>
          <p className="mt-2 max-w-[42rem] text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {copy.lead}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
            {copy.localNote}
          </span>
          <button
            type="button"
            onClick={() => void syncOrders()}
            disabled={syncing}
            className="button-ink-hover min-h-10 border border-[var(--gold)] px-3 text-sm font-semibold text-[var(--gold-soft)] transition hover:bg-[var(--gold)] disabled:cursor-wait disabled:opacity-60"
          >
            {syncing ? copy.refreshing : copy.refresh}
          </button>
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {!loaded ? (
          <div className="border border-[var(--line)] bg-[var(--surface)] p-7 text-center text-sm text-[var(--muted)]">
            {copy.loading}
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-dashed border-[var(--line)] bg-[var(--surface)] p-7 text-center sm:p-9">
            <p className="font-semibold text-[var(--gold-soft)]">
              {copy.emptyTitle}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{copy.emptyText}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence initial={false}>
              {orders.map((order) => (
                <motion.article
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="theme-history-card min-w-0 border border-[var(--line)] p-4 sm:p-5"
                >
                  <div className="flex min-w-0 flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                        {copy.order} #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm text-[var(--ink)]">
                        {formatDate(order.createdAt, lang)}
                      </p>
                    </div>
                    <span
                      className={`w-fit shrink-0 rounded-sm border px-2.5 py-1 text-xs font-semibold ${statusTone(
                        order.status
                      )}`}
                    >
                      {copy.statuses[order.status]}
                    </span>
                  </div>

                  <dl className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="min-w-0">
                      <dt className="text-xs uppercase text-[var(--muted)]">
                        {order.fulfillment === "pickup"
                          ? copy.pickup
                          : copy.delivery}
                      </dt>
                      <dd className="mt-1 break-words text-sm text-[var(--ink)]">
                        {copy.location}: {order.region}, {order.city}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs uppercase text-[var(--muted)]">
                        {copy.package}
                      </dt>
                      <dd className="mt-1 text-sm text-[var(--ink)]">
                        {formatWeight(order.weightG, lang)} × {order.quantity}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs uppercase text-[var(--muted)]">
                        {copy.total}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-[var(--gold-soft)]">
                        {formatAmd(order.totalAmd, lang)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs uppercase text-[var(--muted)]">
                        {copy.updated}
                      </dt>
                      <dd className="mt-1 text-sm text-[var(--ink)]">
                        {formatDate(order.updatedAt, lang)}
                      </dd>
                    </div>
                  </dl>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        {syncError && (
          <p className="order-sync-error mt-3 border p-3 text-sm">
            {copy.syncError}
          </p>
        )}
      </div>
    </section>
  );
}
