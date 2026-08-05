"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { OrderRecord, OrderStatus } from "@/types/order";
import { useAdminAlerts } from "@/components/AdminAlerts";
import { AdminPartnerships } from "@/components/AdminPartnerships";

type Lang = "hy" | "en" | "ru";

interface Size {
  weight: string;
  name: string;
  text: string;
  featured?: boolean;
}

interface LocaleCopy {
  metaTitle: string;
  metaDescription: string;
  nav: {
    about: string;
    products: string;
    gifts: string;
    quality: string;
    contact: string;
    menuLabel: string;
  };
  hero: {
    title: string;
    subtitle: string;
    lead: string;
    browse: string;
    learnMore: string;
    scroll: string;
  };
  sections: {
    aboutEyebrow: string;
    aboutTitle: string;
    aboutBody: string;
    qualityEyebrow: string;
    qualityTitle: string;
    productsEyebrow: string;
    productsTitle: string;
    productsLead: string;
    giftsEyebrow: string;
    giftsTitle: string;
    giftsBody: string;
    contactEyebrow: string;
    contactTitle: string;
    contactLead: string;
  };
  facts: Array<{ label: string; value: string }>;
  values: Array<{ title: string; text: string }>;
  sizes: Size[];
  featuredBadge: string;
  nutritionTitle: string;
  nutrition: Array<{ label: string; value: string }>;
  ctaGift: string;
  form: {
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    orderLabel: string;
    orderPlaceholder: string;
    submit: string;
    success: string;
  };
  footerLine: string;
  footerMeta: string;
}

type DbData = Record<Lang, LocaleCopy>;
type OrderFilter = "all" | OrderStatus;
type TranslationTarget = Exclude<Lang, "hy">;
type AutoTranslationSettings = Record<TranslationTarget, boolean>;

const AUTO_TRANSLATION_STORAGE_KEY =
  "sers-honey.admin.auto-translation.v1";
const DEFAULT_AUTO_TRANSLATION: AutoTranslationSettings = {
  en: true,
  ru: true,
};
const TRANSLATION_DEBOUNCE_MS = 900;

const LANG_LABELS: Record<Lang, string> = {
  hy: "Հայերեն (HY)",
  en: "English (EN)",
  ru: "Русский (RU)",
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Նոր",
  seen: "Մշակվում է",
  completed: "Ավարտված",
};

function setValueAtPath(target: Record<string, any>, path: string, value: string) {
  const keys = path.split(".");
  let current = target;

  for (let index = 0; index < keys.length - 1; index += 1) {
    current = current[keys[index]];
  }

  current[keys[keys.length - 1]] = value;
}

function updateLocalizedValues(
  source: DbData,
  path: string,
  values: Partial<Record<Lang, string>>
) {
  const updated = structuredClone(source);

  (Object.entries(values) as Array<[Lang, string]>).forEach(
    ([lang, value]) => {
      setValueAtPath(
        updated[lang] as unknown as Record<string, any>,
        path,
        value
      );
    }
  );

  return updated;
}

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("hy-AM", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatOrderWeight(weightG: number) {
  if (weightG >= 1000) {
    return `${weightG / 1000} կգ`;
  }

  return `${weightG} գ`;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DbData | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersRefreshing, setOrdersRefreshing] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [lastOrdersCheckAt, setLastOrdersCheckAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "partnerships" | "content" | "sizes">("orders");
  const [editLang, setEditLang] = useState<Lang>("hy");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [autoTranslation, setAutoTranslation] =
    useState<AutoTranslationSettings>(DEFAULT_AUTO_TRANSLATION);
  const [pendingTranslationPaths, setPendingTranslationPaths] = useState<
    Set<string>
  >(new Set());
  const [translationError, setTranslationError] = useState<string | null>(null);
  const autoTranslationRef = useRef<AutoTranslationSettings>(
    DEFAULT_AUTO_TRANSLATION
  );
  const translationTimersRef = useRef<Map<string, number>>(new Map());
  const translationControllersRef = useRef<Map<string, AbortController>>(
    new Map()
  );
  const translationSequencesRef = useRef<Map<string, number>>(new Map());
  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const notificationTimerRef = useRef<number | null>(null);
  const router = useRouter();
  const {
    canInstall,
    isStandalone,
    notificationsEnabled,
    enableNotifications,
    alertNewOrders,
    promptInstall,
  } = useAdminAlerts();

  const showNotification = useCallback(
    (text: string, type: "success" | "error" = "success") => {
      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current);
      }

      setMessage({ text, type });
      notificationTimerRef.current = window.setTimeout(
        () => setMessage(null),
        4000
      );
    },
    []
  );

  useEffect(() => {
    const translationTimers = translationTimersRef.current;
    const translationControllers = translationControllersRef.current;

    try {
      const raw = window.localStorage.getItem(AUTO_TRANSLATION_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<AutoTranslationSettings>;
        const settings: AutoTranslationSettings = {
          en:
            typeof stored.en === "boolean"
              ? stored.en
              : DEFAULT_AUTO_TRANSLATION.en,
          ru:
            typeof stored.ru === "boolean"
              ? stored.ru
              : DEFAULT_AUTO_TRANSLATION.ru,
        };
        autoTranslationRef.current = settings;
        setAutoTranslation(settings);
      }
    } catch (error) {
      console.warn("Could not read automatic translation settings:", error);
    }

    return () => {
      translationTimers.forEach((timer) => window.clearTimeout(timer));
      translationControllers.forEach((controller) => controller.abort());
    };
  }, []);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        router.push("/admin/login");
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Տվյալների բեռնումը ձախողվեց:", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchOrders = useCallback(async () => {
    setOrdersRefreshing(true);
    setOrdersError(null);

    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        throw new Error(`Orders request failed with status ${res.status}`);
      }

      const json = (await res.json()) as {
        orders?: OrderRecord[];
        checkedAt?: string;
      };
      const nextOrders = Array.isArray(json.orders) ? json.orders : [];
      const knownOrderIds = knownOrderIdsRef.current;

      if (knownOrderIds) {
        const newArrivals = nextOrders.filter(
          (order) => !knownOrderIds.has(order.id)
        );

        if (newArrivals.length > 0) {
          const preview = newArrivals
            .slice(0, 2)
            .map(
              (order) =>
                `${order.name} ${order.surname} · ${order.totalAmd.toLocaleString("hy-AM")}֏`,
            )
            .join(" · ");

          showNotification(
            newArrivals.length === 1
              ? "Նոր պատվեր է ստացվել"
              : `${newArrivals.length} նոր պատվեր է ստացվել`,
          );
          void alertNewOrders(newArrivals.length, preview);
        }
      }

      knownOrderIdsRef.current = new Set(nextOrders.map((order) => order.id));
      setOrders(nextOrders);
      setLastOrdersCheckAt(json.checkedAt ?? new Date().toISOString());
    } catch (err) {
      console.error(err);
      setOrdersError(
        "Պատվերների սերվերի հետ կապը չհաջողվեց։ Փորձեք կրկին թարմացնել։"
      );
    } finally {
      setOrdersLoading(false);
      setOrdersRefreshing(false);
    }
  }, [alertNewOrders, router, showNotification]);

  useEffect(() => {
    void fetchContent();
    void fetchOrders();

    let refreshTimer = window.setInterval(() => void fetchOrders(), 8_000);

    const syncPolling = () => {
      window.clearInterval(refreshTimer);
      const interval =
        document.visibilityState === "visible" ? 5_000 : 12_000;
      refreshTimer = window.setInterval(() => void fetchOrders(), interval);
      if (document.visibilityState === "visible") {
        void fetchOrders();
      }
    };

    const onFocus = () => void fetchOrders();

    document.addEventListener("visibilitychange", syncPolling);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", syncPolling);
      window.removeEventListener("focus", onFocus);
      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current);
      }
    };
  }, [fetchContent, fetchOrders]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const changeOrderStatus = async (id: string, status: OrderStatus) => {
    setUpdatingOrderId(id);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        throw new Error(`Order update failed with status ${res.status}`);
      }

      const json = (await res.json()) as { order: OrderRecord };
      setOrders((current) =>
        current.map((order) => (order.id === id ? json.order : order))
      );
      setLastOrdersCheckAt(new Date().toISOString());
      showNotification("Պատվերի կարգավիճակը թարմացվեց");
    } catch (err) {
      console.error(err);
      showNotification("Պատվերի թարմացումը ձախողվեց", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const deleteAdminOrder = async (id: string) => {
    if (
      !window.confirm(
        "Հաստատո՞ւմ եք պատվերի ջնջումը։ Այս գործողությունը հնարավոր չէ հետարկել։"
      )
    ) {
      return;
    }

    setDeletingOrderId(id);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error(`Order deletion failed with status ${res.status}`);
      }

      setOrders((current) => current.filter((order) => order.id !== id));
      knownOrderIdsRef.current?.delete(id);
      setLastOrdersCheckAt(new Date().toISOString());
      showNotification("Պատվերը ջնջվեց");
    } catch (err) {
      console.error(err);
      showNotification("Պատվերի ջնջումը ձախողվեց", "error");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const cancelTranslationJobs = useCallback((pathPrefix?: string) => {
    const matches = (path: string) =>
      !pathPrefix || path.startsWith(pathPrefix);

    translationTimersRef.current.forEach((timer, path) => {
      if (!matches(path)) return;
      window.clearTimeout(timer);
      translationTimersRef.current.delete(path);
    });
    translationControllersRef.current.forEach((controller, path) => {
      if (!matches(path)) return;
      controller.abort();
      translationControllersRef.current.delete(path);
    });
    translationSequencesRef.current.forEach((sequence, path) => {
      if (matches(path)) {
        translationSequencesRef.current.set(path, sequence + 1);
      }
    });
    setPendingTranslationPaths((current) => {
      const next = new Set(current);
      [...next].forEach((path) => {
        if (matches(path)) next.delete(path);
      });
      return next;
    });
  }, []);

  const toggleAutoTranslation = useCallback(
    (target: TranslationTarget) => {
      const next: AutoTranslationSettings = {
        ...autoTranslationRef.current,
        [target]: !autoTranslationRef.current[target],
      };

      autoTranslationRef.current = next;
      setAutoTranslation(next);
      setTranslationError(null);

      try {
        window.localStorage.setItem(
          AUTO_TRANSLATION_STORAGE_KEY,
          JSON.stringify(next)
        );
      } catch (error) {
        console.warn("Could not save automatic translation settings:", error);
      }

      if (!next.en && !next.ru) {
        cancelTranslationJobs();
      }
    },
    [cancelTranslationJobs]
  );

  const scheduleAutoTranslation = useCallback(
    (path: string, sourceText: string) => {
      const targets = (["en", "ru"] as TranslationTarget[]).filter(
        (target) => autoTranslationRef.current[target]
      );
      const previousTimer = translationTimersRef.current.get(path);
      const previousController = translationControllersRef.current.get(path);

      if (previousTimer) window.clearTimeout(previousTimer);
      previousController?.abort();
      translationTimersRef.current.delete(path);
      translationControllersRef.current.delete(path);

      const sequence =
        (translationSequencesRef.current.get(path) ?? 0) + 1;
      translationSequencesRef.current.set(path, sequence);

      if (targets.length === 0) {
        setPendingTranslationPaths((current) => {
          const next = new Set(current);
          next.delete(path);
          return next;
        });
        return;
      }

      setTranslationError(null);
      setPendingTranslationPaths((current) => {
        const next = new Set(current);
        next.add(path);
        return next;
      });

      if (!sourceText.trim()) {
        const emptyTranslations: Partial<Record<Lang, string>> = {};
        targets.forEach((target) => {
          emptyTranslations[target] = "";
        });
        setData((current) =>
          current
            ? updateLocalizedValues(current, path, emptyTranslations)
            : current
        );
        setPendingTranslationPaths((current) => {
          const next = new Set(current);
          next.delete(path);
          return next;
        });
        return;
      }

      const timer = window.setTimeout(async () => {
        translationTimersRef.current.delete(path);
        const controller = new AbortController();
        translationControllersRef.current.set(path, controller);

        try {
          const response = await fetch("/api/admin/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: sourceText, targets }),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(
              `Translation request failed with status ${response.status}`
            );
          }

          const result = (await response.json()) as {
            translations?: Partial<Record<TranslationTarget, string>>;
            failedTargets?: TranslationTarget[];
          };

          if (translationSequencesRef.current.get(path) !== sequence) return;

          const translatedValues: Partial<Record<Lang, string>> = {};
          targets.forEach((target) => {
            const translatedText = result.translations?.[target];
            if (
              autoTranslationRef.current[target] &&
              typeof translatedText === "string"
            ) {
              translatedValues[target] = translatedText;
            }
          });

          if (Object.keys(translatedValues).length > 0) {
            setData((current) =>
              current
                ? updateLocalizedValues(current, path, translatedValues)
                : current
            );
          }

          const activeFailures = (result.failedTargets ?? []).filter(
            (target) => autoTranslationRef.current[target]
          );
          if (activeFailures.length > 0) {
            setTranslationError(
              `Չհաջողվեց թարգմանել՝ ${activeFailures
                .map((target) => target.toUpperCase())
                .join(", ")}։`
            );
          }
        } catch (error) {
          if (
            translationSequencesRef.current.get(path) === sequence &&
            !(error instanceof DOMException && error.name === "AbortError")
          ) {
            console.error(error);
            setTranslationError(
              "Ավտոմատ թարգմանությունը ժամանակավորապես չհաջողվեց։ Տեքստը հայերենով պահպանված է։"
            );
          }
        } finally {
          if (translationSequencesRef.current.get(path) === sequence) {
            translationControllersRef.current.delete(path);
            setPendingTranslationPaths((current) => {
              const next = new Set(current);
              next.delete(path);
              return next;
            });
          }
        }
      }, TRANSLATION_DEBOUNCE_MS);

      translationTimersRef.current.set(path, timer);
    },
    []
  );

  const handleTextChange = (lang: Lang, path: string, value: string) => {
    setData((current) =>
      current
        ? updateLocalizedValues(current, path, { [lang]: value })
        : current
    );

    if (lang === "hy") {
      scheduleAutoTranslation(path, value);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    if (pendingTranslationPaths.size > 0) {
      showNotification(
        "Սպասեք, մինչև ավտոմատ թարգմանությունն ավարտվի։",
        "error"
      );
      return;
    }
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showNotification("Փոփոխությունները հաջողությամբ պահպանվեցին / Saved successfully");
      } else {
        showNotification("Պահպանումը ձախողվեց / Save failed", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Ցանցային սխալ / Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  // Synchronized sizes controls
  const handleSizePropChange = (index: number, key: keyof Size, value: any) => {
    setData((current) => {
      if (!current) return current;

      const updated = structuredClone(current);
      const langs: Lang[] = ["hy", "en", "ru"];

      langs.forEach((lang) => {
        if (!updated[lang]?.sizes?.[index]) return;

        if (key === "weight" || key === "featured") {
          updated[lang].sizes[index][key] = value as never;
        } else if (lang === editLang) {
          updated[lang].sizes[index][key] = value as never;
        }
      });

      return updated;
    });

    if (
      editLang === "hy" &&
      (key === "name" || key === "text") &&
      typeof value === "string"
    ) {
      scheduleAutoTranslation(`sizes.${index}.${key}`, value);
    }
  };

  const addSize = () => {
    setData((current) => {
      if (!current) return current;

      const updated = structuredClone(current);
      const langs: Lang[] = ["hy", "en", "ru"];

      langs.forEach((lang) => {
        if (!updated[lang].sizes) {
          updated[lang].sizes = [];
        }
        updated[lang].sizes.push({
          weight: "0 g",
          name:
            lang === "hy"
              ? "Նոր չափս"
              : lang === "ru"
                ? "Новый размер"
                : "New Size",
          text:
            lang === "hy"
              ? "Նկարագրություն"
              : lang === "ru"
                ? "Описание"
                : "Description",
          featured: false,
        });
      });

      return updated;
    });
    showNotification("Նոր չափսն ավելացված է (խմբագրեք ստորև) / New size added");
  };

  const deleteSize = (index: number) => {
    if (!window.confirm("Համոզվա՞ծ եք, որ ցանկանում եք ջնջել այս չափսը / Delete this size?")) return;

    cancelTranslationJobs("sizes.");
    setData((current) => {
      if (!current) return current;

      const updated = structuredClone(current);
      (["hy", "en", "ru"] as Lang[]).forEach((lang) => {
        updated[lang]?.sizes?.splice(index, 1);
      });

      return updated;
    });
    showNotification("Չափսը ջնջված է / Size deleted");
  };

  const newOrdersCount = orders.filter((order) => order.status === "new").length;
  const seenOrdersCount = orders.filter((order) => order.status === "seen").length;
  const completedOrdersCount = orders.filter(
    (order) => order.status === "completed"
  ).length;
  const normalizedOrderQuery = orderQuery.trim().toLocaleLowerCase("hy-AM");
  const visibleOrders = orders.filter((order) => {
    if (orderFilter !== "all" && order.status !== orderFilter) return false;
    if (!normalizedOrderQuery) return true;

    return [
      order.id,
      order.name,
      order.surname,
      order.phone,
      order.region,
      order.city,
      order.address,
    ]
      .join(" ")
      .toLocaleLowerCase("hy-AM")
      .includes(normalizedOrderQuery);
  });

  if (loading) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-[#0c0a07] text-[#f3ebe0]">
        <div className="text-center">
          <div className="mb-4 h-10 w-10 animate-spin border-4 border-[var(--gold)] border-t-transparent mx-auto rounded-full" />
          <p className="text-sm uppercase tracking-widest text-[#b8a990]">Բեռնվում է / Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="admin-theme min-h-screen bg-[#0c0a07] pb-24 font-sans text-[#f3ebe0]">
      {/* Background elements */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(201,162,39,0.05),transparent_60%)]" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[rgba(12,10,7,0.9)] px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="text-[var(--gold)]">✦</span>
          <span className="truncate text-lg font-semibold tracking-wider font-serif sm:text-xl">
            Sers <em className="font-normal italic text-[var(--gold-soft)]">Honey</em>
          </span>
          <span className="text-xs bg-[var(--gold)] text-[#120f0b] px-2 py-0.5 uppercase font-semibold">
            Admin
          </span>
        </div>
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {!notificationsEnabled && (
            <button
              type="button"
              onClick={() => {
                void enableNotifications().then((result) => {
                  if (result.ok) {
                    showNotification("Ծանուցումները միացված են");
                  } else if (result.reason === "denied") {
                    showNotification(
                      "Ծանուցումները արգելափակված են բրաուզերում",
                      "error",
                    );
                  } else {
                    showNotification(
                      "Այս սարքը չի աջակցում ծանուցումներին",
                      "error",
                    );
                  }
                });
              }}
              className="border border-[var(--gold)] bg-[rgba(201,162,39,0.12)] px-3 py-2 text-xs text-[var(--gold-soft)] transition hover:bg-[rgba(201,162,39,0.2)] sm:text-sm"
            >
              Միացնել ծանուցումները
            </button>
          )}
          {notificationsEnabled && (
            <span className="hidden text-xs text-green-300/90 sm:inline">
              Ծանուցումները միացված են
            </span>
          )}
          {canInstall && (
            <button
              type="button"
              onClick={() => {
                void promptInstall().then((accepted) => {
                  if (accepted) {
                    showNotification("Admin հավելվածը տեղադրվեց");
                  }
                });
              }}
              className="border border-[var(--gold)] bg-gradient-to-b from-[var(--gold-soft)] to-[var(--gold)] px-3 py-2 text-xs font-semibold text-[#16120b] sm:text-sm"
            >
              Ներբեռնել Admin
            </button>
          )}
          {!isStandalone && !canInstall && (
            <span className="hidden max-w-[14rem] text-[0.68rem] leading-snug text-[#b8a990] md:inline">
              Chrome/Android՝ ընտրացանկ → «Install app» / «Ավելացնել հիմնական էկրան»
            </span>
          )}
          {(activeTab === "content" || activeTab === "sizes") && (
            <button
              onClick={handleSave}
              disabled={saving || pendingTranslationPaths.size > 0}
              className="bg-gradient-to-b from-[var(--gold-soft)] to-[var(--gold)] px-3 py-2 text-sm font-semibold text-[#16120b] transition hover:brightness-105 disabled:opacity-50 sm:px-5 sm:text-base"
            >
              {saving
                ? "Պահպանվում է..."
                : pendingTranslationPaths.size > 0
                  ? `Թարգմանվում է (${pendingTranslationPaths.size})...`
                  : "Պահպանել բոլորը"}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="border border-[rgba(201,162,39,0.3)] bg-white/5 px-3 py-2 text-xs text-[#b8a990] transition hover:text-white sm:px-4 sm:text-sm"
          >
            Ելք (Logout)
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed right-4 top-20 z-50 max-w-[calc(100vw-2rem)] border px-4 py-3 text-sm shadow-lg sm:right-6 sm:px-6 ${
              message.type === "success"
                ? "bg-[rgba(20,40,20,0.9)] border-green-500 text-green-200"
                : "bg-[rgba(50,20,20,0.9)] border-red-500 text-red-200"
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto mt-6 max-w-[1120px] px-4 sm:mt-8 sm:px-6">
        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-6 overflow-x-auto border-b border-[var(--line)]">
          <button
            onClick={() => setActiveTab("orders")}
            className={`relative flex shrink-0 items-center gap-2 pb-3 text-lg font-medium transition ${
              activeTab === "orders" ? "text-[var(--gold-soft)]" : "text-[#b8a990] hover:text-white"
            }`}
          >
            Պատվերներ
            {newOrdersCount > 0 && (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--gold)] px-1.5 py-0.5 text-xs font-bold text-[#120f0b]">
                {newOrdersCount}
              </span>
            )}
            {activeTab === "orders" && (
              <motion.div layoutId="tabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-[var(--gold)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`relative shrink-0 pb-3 text-lg font-medium transition ${
              activeTab === "content" ? "text-[var(--gold-soft)]" : "text-[#b8a990] hover:text-white"
            }`}
          >
            Էջի Տեքստեր (General Content)
            {activeTab === "content" && (
              <motion.div layoutId="tabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-[var(--gold)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("partnerships")}
            className={`relative shrink-0 pb-3 text-lg font-medium transition ${
              activeTab === "partnerships" ? "text-[var(--gold-soft)]" : "text-[#b8a990] hover:text-white"
            }`}
          >
            Համագործակցություն
            {activeTab === "partnerships" && (
              <motion.div layoutId="tabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-[var(--gold)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("sizes")}
            className={`relative shrink-0 pb-3 text-lg font-medium transition ${
              activeTab === "sizes" ? "text-[var(--gold-soft)]" : "text-[#b8a990] hover:text-white"
            }`}
          >
            Ապրանքների չափսեր (Product Sizes)
            {activeTab === "sizes" && (
              <motion.div layoutId="tabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-[var(--gold)]" />
            )}
          </button>
        </div>

        {/* Global Language Selector for editable content */}
        {(activeTab === "content" || activeTab === "sizes") && (
          <div className="mb-6 grid gap-3">
            <div className="flex w-fit max-w-full items-center gap-2 overflow-x-auto border border-[var(--line)] bg-black/35 p-1.5">
              <span className="shrink-0 px-3 text-xs uppercase tracking-wider text-[#b8a990]">
                Խմբագրման լեզու՝
              </span>
              {(["hy", "en", "ru"] as Lang[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEditLang(item)}
                  className={`shrink-0 px-4 py-1.5 text-xs uppercase tracking-wider font-semibold transition ${
                    editLang === item
                      ? "bg-[var(--gold)] text-[#120f0b]"
                      : "text-[#b8a990] hover:text-white"
                  }`}
                >
                  {LANG_LABELS[item]}
                </button>
              ))}
            </div>

            <div className="border border-[var(--line)] bg-black/25 p-3 sm:p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--gold-soft)]">
                    Ավտոմատ թարգմանություն հայերենից
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#b8a990]">
                    Անջատեք լեզուն, որպեսզի ձեռքով խմբագրված տեքստը հայերենի
                    հաջորդ փոփոխությունից չվերագրվի։
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {(["en", "ru"] as TranslationTarget[]).map((target) => {
                    const enabled = autoTranslation[target];
                    return (
                      <button
                        key={target}
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        onClick={() => toggleAutoTranslation(target)}
                        className={`inline-flex min-h-10 items-center gap-2 border px-3 text-xs font-semibold uppercase transition ${
                          enabled
                            ? "border-[var(--gold)] bg-[rgba(201,162,39,0.1)] text-[var(--gold-soft)]"
                            : "border-[var(--line)] bg-black/30 text-[#b8a990] hover:border-[#8f826f]"
                        }`}
                      >
                        <span>{target}</span>
                        <span
                          className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                            enabled ? "bg-[var(--gold)]" : "bg-[#4d463c]"
                          }`}
                          aria-hidden="true"
                        >
                          <span
                            className={`h-4 w-4 rounded-full bg-[#120f0b] transition-transform ${
                              enabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </span>
                        <span>{enabled ? "Auto" : "Ձեռքով"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={`mt-3 border-t pt-3 text-xs ${
                  translationError
                    ? "border-red-500/25 text-red-200"
                    : "border-white/10 text-[#9f927f]"
                }`}
                aria-live="polite"
              >
                {translationError ? (
                  translationError
                ) : pendingTranslationPaths.size > 0 ? (
                  `Թարգմանվում է ${pendingTranslationPaths.size} դաշտ...`
                ) : editLang === "hy" ? (
                  "Հայերենը հիմնական լեզուն է։ Փոփոխությունները ավտոմատ կանցնեն միացված լեզուներին։"
                ) : autoTranslation[editLang] ? (
                  `${editLang.toUpperCase()} ավտոմատ ռեժիմում է։ Ձեռքով վերջնական տարբերակի համար անջատեք համապատասխան Auto կոճակը։`
                ) : (
                  `${editLang.toUpperCase()} ձեռքով խմբագրման ռեժիմում է և ավտոմատ չի վերագրվի։`
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <section className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-[var(--gold-soft)] font-serif">
                  Հաճախորդների պատվերներ
                </h1>
                <p className="mt-1 text-sm text-[#b8a990]">
                  Նոր պատվերները ստուգվում են ավտոմատ՝ յուրաքանչյուր 15 վայրկյանը մեկ։
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex min-h-10 items-center gap-2 border border-[var(--line)] bg-black/25 px-3 text-xs text-[#b8a990]">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      ordersError
                        ? "bg-red-400"
                        : ordersLoading
                          ? "animate-pulse bg-amber-300"
                          : "bg-emerald-400"
                    }`}
                    aria-hidden="true"
                  />
                  <span>
                    {ordersError
                      ? "Կապի խնդիր"
                      : ordersLoading
                        ? "Ստուգվում է..."
                        : `Կապը ակտիվ է · ${
                            lastOrdersCheckAt
                              ? formatOrderDate(lastOrdersCheckAt)
                              : "հենց հիմա"
                          }`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void fetchOrders()}
                  disabled={ordersRefreshing}
                  className="inline-flex min-h-10 items-center justify-center border border-[var(--gold)] px-4 text-sm font-semibold text-[var(--gold-soft)] transition hover:bg-[var(--gold)] hover:text-[#120f0b] disabled:cursor-wait disabled:opacity-50"
                >
                  {ordersRefreshing ? "Թարմացվում է..." : "Թարմացնել"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] lg:grid-cols-4">
              {(
                [
                  ["all", "Բոլորը", orders.length],
                  ["new", "Նոր", newOrdersCount],
                  ["seen", "Մշակվող", seenOrdersCount],
                  ["completed", "Ավարտված", completedOrdersCount],
                ] as Array<[OrderFilter, string, number]>
              ).map(([filter, label, count]) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setOrderFilter(filter)}
                  className={`min-h-[74px] px-4 py-3 text-left transition ${
                    orderFilter === filter
                      ? "bg-[rgba(201,162,39,0.13)] text-[var(--gold-soft)]"
                      : "bg-[#0c0a07] text-[#b8a990] hover:bg-[#15110b] hover:text-white"
                  }`}
                >
                  <span className="block text-xs uppercase tracking-[0.08em]">
                    {label}
                  </span>
                  <span className="mt-1 block text-2xl font-semibold text-current">
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Փնտրել պատվեր</span>
                <input
                  type="search"
                  value={orderQuery}
                  onChange={(event) => setOrderQuery(event.target.value)}
                  placeholder="Փնտրել պատվերներում"
                  className="min-h-11 w-full border border-[var(--line)] bg-black/30 px-4 text-sm text-white outline-none placeholder:text-[#746a5c] focus:border-[var(--gold)]"
                />
              </label>
              {(orderFilter !== "all" || orderQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderFilter("all");
                    setOrderQuery("");
                  }}
                  className="min-h-11 shrink-0 border border-[var(--line)] px-4 text-sm text-[#b8a990] transition hover:border-[var(--gold)] hover:text-white"
                >
                  Մաքրել ֆիլտրերը
                </button>
              )}
            </div>

            {ordersError && orders.length > 0 && (
              <div
                role="alert"
                className="border border-red-500/40 bg-red-950/25 p-4 text-sm text-red-100"
              >
                {ordersError} Վերջին հաջող բեռնված տվյալները պահպանվել են էկրանին։
              </div>
            )}

            {ordersLoading ? (
              <div className="border border-[var(--line)] bg-black/25 p-8 text-center text-[#b8a990]">
                Պատվերները բեռնվում են...
              </div>
            ) : ordersError && orders.length === 0 ? (
              <div className="border border-red-500/35 bg-red-950/20 p-8 text-center">
                <p className="text-lg text-red-100">Պատվերների պահոցը հասանելի չէ</p>
                <button
                  type="button"
                  onClick={() => void fetchOrders()}
                  className="mt-4 min-h-10 border border-red-300/50 px-4 text-sm text-red-100 transition hover:bg-red-100 hover:text-red-950"
                >
                  Կրկին ստուգել
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-dashed border-[var(--line)] bg-black/20 p-10 text-center">
                <p className="text-lg text-[var(--gold-soft)]">Դեռ պատվերներ չկան</p>
                <p className="mt-1 text-sm text-[#b8a990]">
                  Պահոցը հասանելի է։ Առաջին հաջող ուղարկված պատվերը կհայտնվի այստեղ։
                </p>
              </div>
            ) : visibleOrders.length === 0 ? (
              <div className="border border-dashed border-[var(--line)] bg-black/20 p-8 text-center">
                <p className="text-[var(--gold-soft)]">Համընկնող պատվեր չի գտնվել</p>
                <p className="mt-1 text-sm text-[#b8a990]">
                  Փոխեք որոնումը կամ ընտրեք այլ կարգավիճակ։
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {visibleOrders.map((order) => {
                  const isUpdating = updatingOrderId === order.id;
                  const isDeleting = deletingOrderId === order.id;
                  const isBusy = isUpdating || isDeleting;
                  const statusClass =
                    order.status === "new"
                      ? "border-[var(--gold)] bg-[rgba(201,162,39,0.09)]"
                      : order.status === "completed"
                        ? "border-emerald-500/35 bg-emerald-950/15"
                        : "border-[var(--line)] bg-black/25";

                  return (
                    <article
                      key={order.id}
                      className={`min-w-0 border p-4 sm:p-6 ${statusClass}`}
                    >
                      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="break-words text-lg font-semibold text-white">
                              {order.name} {order.surname}
                            </h2>
                            <span
                              className={`rounded-sm px-2.5 py-1 text-xs font-bold ${
                                order.status === "new"
                                  ? "bg-[var(--gold)] text-[#120f0b]"
                                  : order.status === "completed"
                                    ? "bg-emerald-700 text-white"
                                    : "bg-white/10 text-[#d8cdbd]"
                              }`}
                            >
                              {ORDER_STATUS_LABELS[order.status]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#8f826f]">
                            {formatOrderDate(order.createdAt)} · #{order.id.slice(0, 8)}
                          </p>
                        </div>
                        <p className="text-xl font-semibold text-[var(--gold-soft)]">
                          {order.totalAmd.toLocaleString("hy-AM")} դրամ
                        </p>
                      </div>

                      <dl className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="min-w-0">
                          <dt className="text-xs uppercase text-[#8f826f]">Հեռախոս</dt>
                          <dd className="mt-1 break-all">
                            <a
                              href={`tel:${order.phone}`}
                              className="text-[var(--gold-soft)] hover:underline"
                            >
                              {order.phone}
                            </a>
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs uppercase text-[#8f826f]">Մարզ / քաղաք</dt>
                          <dd className="mt-1 break-words text-[#eee5d8]">
                            {order.region}, {order.city}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs uppercase text-[#8f826f]">Ստացում</dt>
                          <dd className="mt-1 text-[#eee5d8]">
                            {order.fulfillment === "pickup" ? "Ինքնաառաքում" : "Առաքում"}
                            {order.comboId ? ` · ${order.comboId}` : ""}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs uppercase text-[#8f826f]">Հասցե</dt>
                          <dd className="mt-1 break-words text-[#eee5d8]">{order.address}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs uppercase text-[#8f826f]">Պատվեր</dt>
                          <dd className="mt-1 text-[#eee5d8]">
                            {formatOrderWeight(order.weightG)} × {order.quantity}
                          </dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-xs uppercase text-[#8f826f]">Լեզու</dt>
                          <dd className="mt-1 uppercase text-[#eee5d8]">{order.lang}</dd>
                        </div>
                      </dl>

                      <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
                        <a
                          href={`tel:${order.phone}`}
                          className="inline-flex min-h-10 items-center justify-center border border-[var(--line)] px-4 text-sm text-[var(--gold-soft)] transition hover:border-[var(--gold)] sm:mr-auto"
                        >
                          Զանգահարել
                        </a>
                        {order.status === "new" && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => changeOrderStatus(order.id, "seen")}
                            className="min-h-10 border border-[var(--line)] px-4 text-sm text-[#d8cdbd] transition hover:border-[var(--gold)] hover:text-white disabled:opacity-50"
                          >
                            Նշել մշակվող
                          </button>
                        )}
                        {order.status !== "completed" && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => changeOrderStatus(order.id, "completed")}
                            className="min-h-10 bg-[var(--gold)] px-4 text-sm font-semibold text-[#120f0b] transition hover:brightness-110 disabled:opacity-50"
                          >
                            Նշել ավարտված
                          </button>
                        )}
                        {order.status === "completed" && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => changeOrderStatus(order.id, "seen")}
                            className="min-h-10 border border-[var(--line)] px-4 text-sm text-[#d8cdbd] transition hover:border-[var(--gold)] hover:text-white disabled:opacity-50"
                          >
                            Վերադարձնել մշակվող
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void deleteAdminOrder(order.id)}
                          className="min-h-10 border border-red-500/35 px-4 text-sm text-red-200 transition hover:border-red-400 hover:bg-red-950/35 disabled:opacity-50"
                        >
                          {isDeleting ? "Ջնջվում է..." : "Ջնջել"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "partnerships" && <AdminPartnerships />}

        {/* Content Tab Section */}
        {activeTab === "content" && (
          <div className="space-y-8">
            {/* Meta tags section */}
            <div className="border border-[var(--line)] bg-black/20 p-6">
              <h3 className="text-lg font-semibold text-[var(--gold-soft)] mb-4 border-b border-[var(--line)] pb-2 font-serif">
                SEO & Meta Տվյալներ (SEO & Page Meta)
              </h3>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Meta Title (Կայքի վերնագիր)</label>
                  <input
                    type="text"
                    value={data[editLang].metaTitle || ""}
                    onChange={(e) => handleTextChange(editLang, "metaTitle", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Meta Description (Կայքի նկարագրություն)</label>
                  <textarea
                    rows={3}
                    value={data[editLang].metaDescription || ""}
                    onChange={(e) => handleTextChange(editLang, "metaDescription", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)] resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="border border-[var(--line)] bg-black/20 p-6">
              <h3 className="text-lg font-semibold text-[var(--gold-soft)] mb-4 border-b border-[var(--line)] pb-2 font-serif">
                Գլխավոր բաժին (Hero Section)
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Վերնագիր (Title)</label>
                  <input
                    type="text"
                    value={data[editLang].hero.title || ""}
                    onChange={(e) => handleTextChange(editLang, "hero.title", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Ենթավերնագիր (Subtitle)</label>
                  <input
                    type="text"
                    value={data[editLang].hero.subtitle || ""}
                    onChange={(e) => handleTextChange(editLang, "hero.subtitle", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm text-[#b8a990]">Ներածական տեքստ (Lead Text)</label>
                  <textarea
                    rows={2}
                    value={data[editLang].hero.lead || ""}
                    onChange={(e) => handleTextChange(editLang, "hero.lead", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)] resize-y"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Կոճակ 1 (Browse Products)</label>
                  <input
                    type="text"
                    value={data[editLang].hero.browse || ""}
                    onChange={(e) => handleTextChange(editLang, "hero.browse", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Կոճակ 2 (Learn More)</label>
                  <input
                    type="text"
                    value={data[editLang].hero.learnMore || ""}
                    onChange={(e) => handleTextChange(editLang, "hero.learnMore", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>
            </div>

            {/* About & Quality Section */}
            <div className="border border-[var(--line)] bg-black/20 p-6">
              <h3 className="text-lg font-semibold text-[var(--gold-soft)] mb-4 border-b border-[var(--line)] pb-2 font-serif">
                Մեր մասին և Որակ (About & Quality)
              </h3>
              <div className="grid gap-6">
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm text-[#b8a990]">Մեր մասին Eyebrow</label>
                    <input
                      type="text"
                      value={data[editLang].sections.aboutEyebrow || ""}
                      onChange={(e) => handleTextChange(editLang, "sections.aboutEyebrow", e.target.value)}
                      className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm text-[#b8a990]">Մեր մասին Վերնագիր</label>
                    <input
                      type="text"
                      value={data[editLang].sections.aboutTitle || ""}
                      onChange={(e) => handleTextChange(editLang, "sections.aboutTitle", e.target.value)}
                      className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Մեր մասին Տեքստ (About Body)</label>
                  <textarea
                    rows={3}
                    value={data[editLang].sections.aboutBody || ""}
                    onChange={(e) => handleTextChange(editLang, "sections.aboutBody", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)] resize-y"
                  />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm text-[#b8a990]">Առավելություններ Eyebrow</label>
                    <input
                      type="text"
                      value={data[editLang].sections.qualityEyebrow || ""}
                      onChange={(e) => handleTextChange(editLang, "sections.qualityEyebrow", e.target.value)}
                      className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm text-[#b8a990]">Առավելություններ Վերնագիր</label>
                    <input
                      type="text"
                      value={data[editLang].sections.qualityTitle || ""}
                      onChange={(e) => handleTextChange(editLang, "sections.qualityTitle", e.target.value)}
                      className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products (Sizes) Header & Gifts & Contact Texts */}
            <div className="border border-[var(--line)] bg-black/20 p-6">
              <h3 className="text-lg font-semibold text-[var(--gold-soft)] mb-4 border-b border-[var(--line)] pb-2 font-serif">
                Այլ Բաժիններ (Gifts & Contact Form)
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Տեսականի Eyebrow</label>
                  <input
                    type="text"
                    value={data[editLang].sections.productsEyebrow || ""}
                    onChange={(e) => handleTextChange(editLang, "sections.productsEyebrow", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Տեսականի Վերնագիր</label>
                  <input
                    type="text"
                    value={data[editLang].sections.productsTitle || ""}
                    onChange={(e) => handleTextChange(editLang, "sections.productsTitle", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm text-[#b8a990]">Տեսականի Lead</label>
                  <input
                    type="text"
                    value={data[editLang].sections.productsLead || ""}
                    onChange={(e) => handleTextChange(editLang, "sections.productsLead", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Նվերներ Eyebrow</label>
                  <input
                    type="text"
                    value={data[editLang].sections.giftsEyebrow || ""}
                    onChange={(e) => handleTextChange(editLang, "sections.giftsEyebrow", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Նվերներ Վերնագիր</label>
                  <input
                    type="text"
                    value={data[editLang].sections.giftsTitle || ""}
                    onChange={(e) => handleTextChange(editLang, "sections.giftsTitle", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm text-[#b8a990]">Նվերներ Նկարագրություն</label>
                  <textarea
                    rows={2}
                    value={data[editLang].sections.giftsBody || ""}
                    onChange={(e) => handleTextChange(editLang, "sections.giftsBody", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)] resize-y"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Պատվիրել Eyebrow</label>
                  <input
                    type="text"
                    value={data[editLang].sections.contactEyebrow || ""}
                    onChange={(e) => handleTextChange(editLang, "sections.contactEyebrow", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-[#b8a990]">Պատվիրել Վերնագիր</label>
                  <input
                    type="text"
                    value={data[editLang].sections.contactTitle || ""}
                    onChange={(e) => handleTextChange(editLang, "sections.contactTitle", e.target.value)}
                    className="border border-[var(--line)] bg-black/40 px-4 py-3 outline-none focus:border-[var(--gold)]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sizes Tab Section */}
        {activeTab === "sizes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <h3 className="text-xl font-semibold font-serif text-[var(--gold-soft)]">
                  Մեղրի Տարաներ / Չափսեր (Honey Jar Sizes)
                </h3>
                <p className="text-xs text-[#b8a990] mt-1">
                  Ավելացրեք, փոփոխեք կամ ջնջեք կայքում ցուցադրվող տարբերակները: Չափսերը սինխրոնացվում են բոլոր 3 լեզուների համար:
                </p>
              </div>
              <button
                onClick={addSize}
                className="bg-transparent border border-[var(--gold)] text-[var(--gold-soft)] px-5 py-2 text-sm font-semibold hover:bg-[var(--gold)] hover:text-[#120f0b] transition"
              >
                + Ավելացնել Չափս
              </button>
            </div>

            <div className="grid gap-6 mt-6">
              {(data[editLang].sizes || []).map((size, idx) => (
                <div
                  key={idx}
                  className="border border-[var(--line)] bg-black/25 p-6 relative flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="flex-1 w-full grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {/* Weight (Global) */}
                    <div className="grid gap-1">
                      <label className="text-xs text-[#b8a990] uppercase tracking-wider">Քաշ (Weight) [Բոլոր լեզվով]</label>
                      <input
                        type="text"
                        value={size.weight || ""}
                        onChange={(e) => handleSizePropChange(idx, "weight", e.target.value)}
                        className="border border-[var(--line)] bg-black/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
                        placeholder="Օրինակ՝ 900 գ"
                      />
                    </div>

                    {/* Featured (Global) */}
                    <div className="grid gap-1 justify-start">
                      <label className="text-xs text-[#b8a990] uppercase tracking-wider mb-2">Նախընտրելի՞ (Featured)</label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={!!size.featured}
                          onChange={(e) => handleSizePropChange(idx, "featured", e.target.checked)}
                          className="h-5 w-5 border border-[var(--line)] bg-black text-[var(--gold)] rounded focus:ring-0 focus:ring-offset-0"
                        />
                        <span>Ամենապահանջված</span>
                      </label>
                    </div>

                    {/* Localized Name */}
                    <div className="grid gap-1">
                      <label className="text-xs text-[#b8a990] uppercase tracking-wider">Անվանում ({editLang.toUpperCase()})</label>
                      <input
                        type="text"
                        value={size.name || ""}
                        onChange={(e) => handleSizePropChange(idx, "name", e.target.value)}
                        className="border border-[var(--line)] bg-black/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
                        placeholder="Օրինակ՝ Դասական"
                      />
                    </div>

                    {/* Localized Description text */}
                    <div className="grid gap-1">
                      <label className="text-xs text-[#b8a990] uppercase tracking-wider">Նկարագրություն ({editLang.toUpperCase()})</label>
                      <input
                        type="text"
                        value={size.text || ""}
                        onChange={(e) => handleSizePropChange(idx, "text", e.target.value)}
                        className="border border-[var(--line)] bg-black/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--gold)]"
                        placeholder="Օրինակ՝ Ընտանիքի համար"
                      />
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteSize(idx)}
                    className="border border-red-500/40 text-red-400 bg-red-950/20 px-4 py-2 text-xs font-semibold hover:bg-red-500 hover:text-white transition mt-4 md:mt-0 self-end md:self-center"
                  >
                    Ջնջել
                  </button>
                </div>
              ))}

              {(!data[editLang].sizes || data[editLang].sizes.length === 0) && (
                <p className="text-center py-10 text-[#b8a990]">Չափսեր չկան: Սեղմեք «+ Ավելացնել Չափս» կոճակը:</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
