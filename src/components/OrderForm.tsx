"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Lang } from "@/lib/i18n";
import type { LocaleCopy } from "@/content/locales";
import {
  ARMENIA_REGIONS_DATA,
  WEIGHT_OPTIONS_G,
  calcOrderTotal,
  formatAmd,
  getRegionById,
  type WeightOption,
} from "@/content/regions";
import { COMBO_PACKAGES, PICKUP_LOCATION, getComboById } from "@/content/pickup";
import { rememberOrder } from "@/lib/order-history";
import type { CustomerOrderSummary } from "@/types/order";

type OrderFormProps = {
  lang: Lang;
  copy: LocaleCopy["form"];
};

type Fulfillment = "delivery" | "pickup";

type FormData = {
  name: string;
  surname: string;
  phone: string;
  regionId: string;
  city: string;
  address: string;
  weightG: WeightOption;
  quantity: number;
  fulfillment: Fulfillment;
  comboId: string | null;
};

const inputClass =
  "min-w-0 w-full rounded-sm border border-[var(--line)] bg-[var(--field-bg)] px-3.5 py-3 text-base text-[var(--ink)] outline-none transition focus:border-[var(--gold)]";

const submitStateCopy: Record<Lang, { sending: string; error: string }> = {
  hy: {
    sending: "Ուղարկվում է...",
    error: "Պատվերը չհաջողվեց ուղարկել։ Ստուգեք տվյալներն ու կապը, ապա կրկին փորձեք։",
  },
  en: {
    sending: "Sending...",
    error: "The order could not be sent. Check the details and connection, then try again.",
  },
  ru: {
    sending: "Отправляется...",
    error: "Не удалось отправить заказ. Проверьте данные и подключение, затем повторите.",
  },
};

function formatWeightLabel(g: number, lang: Lang) {
  if (g >= 1000) {
    const kg = g / 1000;
    if (lang === "hy") return `${kg} կգ`;
    if (lang === "ru") return `${kg} кг`;
    return `${kg} kg`;
  }
  if (lang === "hy") return `${g} գ`;
  if (lang === "ru") return `${g} г`;
  return `${g} g`;
}

export function OrderForm({ lang, copy }: OrderFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [coordsCopied, setCoordsCopied] = useState(false);
  const [comboOpen, setComboOpen] = useState(true);
  const [data, setData] = useState<FormData>({
    name: "",
    surname: "",
    phone: "",
    regionId: "",
    city: "",
    address: "",
    weightG: 1000,
    quantity: 2,
    fulfillment: "delivery",
    comboId: null,
  });

  const selectedRegion = useMemo(
    () => (data.regionId ? getRegionById(data.regionId) : undefined),
    [data.regionId]
  );

  const cities = useMemo(
    () => selectedRegion?.cities.map((c) => c[lang]) ?? [],
    [selectedRegion, lang]
  );

  const selectedCombo = getComboById(data.comboId);
  const withDelivery = data.fulfillment === "delivery";
  const total = calcOrderTotal(data.weightG, data.quantity, withDelivery);
  const totalKg = (data.weightG * data.quantity) / 1000;
  const orderSummary = `${formatWeightLabel(data.weightG, lang)} × ${data.quantity} = ${totalKg} ${
    lang === "hy" ? "կգ" : lang === "ru" ? "кг" : "kg"
  }`;

  const update = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const applyCombo = (comboId: string | null) => {
    if (!comboId) {
      setData((prev) => ({ ...prev, comboId: null }));
      setComboOpen(false);
      return;
    }
    const combo = getComboById(comboId);
    if (!combo) return;
    setData((prev) => ({
      ...prev,
      comboId,
      weightG: combo.weightG,
      quantity: combo.quantity,
    }));
    setComboOpen(false);
  };

  const copyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(PICKUP_LOCATION.coordsText);
      setCoordsCopied(true);
      window.setTimeout(() => setCoordsCopied(false), 2000);
    } catch {
      setCoordsCopied(false);
    }
  };

  const canGoStep2 = data.name.trim().length > 1 && data.surname.trim().length > 1;
  const canGoStep3 =
    /^[+()\d\s-]{6,32}$/.test(data.phone.trim()) &&
    data.quantity >= 1 &&
    (data.fulfillment === "pickup" ||
      (data.regionId.length > 0 &&
        data.city.length > 0 &&
        data.address.trim().length > 2));

  const submitOrder = async () => {
    if (submitState === "submitting" || !canGoStep3) return;

    setSubmitState("submitting");

    try {
      const payload =
        data.fulfillment === "pickup"
          ? {
              lang,
              ...data,
              regionId: "vayots_dzor",
              city: lang === "hy" ? "Ջերմուկ" : lang === "ru" ? "Джермук" : "Jermuk",
              address: `Pickup · ${PICKUP_LOCATION.coordsText}`,
            }
          : { lang, ...data };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
        order?: CustomerOrderSummary;
      } | null;

      if (!response.ok || !result?.success || !result.order) {
        throw new Error(`Order request failed with status ${response.status}`);
      }

      rememberOrder(result.order);
      setSubmitState("success");
    } catch (error) {
      console.error(error);
      setSubmitState("error");
    }
  };

  const stepMeta = [
    { n: 1, title: copy.step1Title },
    { n: 2, title: copy.step2Title },
    { n: 3, title: copy.step3Title },
  ] as const;

  if (submitState === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-sm border border-[var(--line)] bg-[var(--surface)] p-6 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-[var(--gold-soft)]">
          {data.quantity === 1 ? copy.successSingle : copy.success}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mt-7 min-w-0 overflow-hidden text-left">
      <div className="mb-6 flex min-w-0 items-center justify-between gap-2">
        {stepMeta.map((item, index) => {
          const active = step === item.n;
          const done = step > item.n;
          return (
            <div key={item.n} className="flex min-w-0 flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center border text-xs font-semibold ${
                  active || done
                    ? "button-ink border-[var(--gold)] bg-[var(--gold)]"
                    : "border-[var(--line)] text-[var(--muted)]"
                }`}
              >
                {item.n}
              </div>
              <span
                className={`hidden min-w-0 text-xs leading-tight sm:block ${
                  active ? "text-[var(--gold-soft)]" : "text-[var(--muted)]"
                }`}
              >
                {item.title}
              </span>
              {index < stepMeta.length - 1 && (
                <div className={`mx-1 h-px flex-1 ${done ? "bg-[var(--gold)]" : "bg-[var(--line)]"}`} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="grid min-w-0 gap-4"
          >
            <div>
              <h2
                className="text-xl font-semibold leading-tight text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {copy.step1Title}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{copy.step1Lead}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm text-[var(--muted)]">
                {copy.nameLabel}
                <input
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={copy.namePlaceholder}
                  className={inputClass}
                />
              </label>
              <label className="grid gap-1.5 text-sm text-[var(--muted)]">
                {copy.surnameLabel}
                <input
                  value={data.surname}
                  onChange={(e) => update("surname", e.target.value)}
                  placeholder={copy.surnamePlaceholder}
                  className={inputClass}
                />
              </label>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={!canGoStep2}
              onClick={() => setStep(2)}
              className="button-ink inline-flex min-h-12 items-center justify-center bg-gradient-to-b from-[var(--gold-soft)] to-[var(--gold)] px-5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.next}
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="grid min-w-0 gap-4"
          >
            <div>
              <h2
                className="text-xl font-semibold leading-tight text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {copy.step2Title}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{copy.step2Lead}</p>
            </div>

            <label className="grid gap-1.5 text-sm text-[var(--muted)]">
              {copy.phoneLabel}
              <input
                value={data.phone}
                onChange={(e) => update("phone", e.target.value)}
                type="tel"
                placeholder={copy.phonePlaceholder}
                className={inputClass}
              />
            </label>

            <div className="grid gap-2">
              <p className="text-sm text-[var(--muted)]">{copy.fulfillmentLabel}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["delivery", copy.deliveryOption],
                    ["pickup", copy.pickupOption],
                  ] as const
                ).map(([value, label]) => {
                  const active = data.fulfillment === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update("fulfillment", value)}
                      className={`min-h-12 border px-4 text-left text-sm font-semibold transition ${
                        active
                          ? "border-[var(--gold)] bg-[rgba(201,162,39,0.16)] text-[var(--gold-soft)]"
                          : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {data.fulfillment === "pickup" ? (
              <div className="theme-gold-panel border border-[var(--gold)]/50 p-4">
                <p className="text-sm text-[var(--gold-soft)]">{copy.pickupLead}</p>
                <p className="mt-2 font-mono text-sm text-[var(--ink)]">{PICKUP_LOCATION.coordsText}</p>
                <p className="mt-1 text-xs text-[var(--gold)]">{copy.pickupDiscount}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <a
                    href={PICKUP_LOCATION.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center border border-[var(--line)] px-3 text-center text-xs text-[var(--gold-soft)] transition hover:border-[var(--gold)]"
                  >
                    {copy.openMaps}
                  </a>
                  <a
                    href={PICKUP_LOCATION.geoUri}
                    className="inline-flex min-h-11 items-center justify-center border border-[var(--line)] px-3 text-center text-xs text-[var(--gold-soft)] transition hover:border-[var(--gold)]"
                  >
                    {copy.openNavigator}
                  </a>
                  <button
                    type="button"
                    onClick={copyCoordinates}
                    className="inline-flex min-h-11 items-center justify-center border border-[var(--line)] px-3 text-xs text-[var(--gold-soft)] transition hover:border-[var(--gold)]"
                  >
                    {coordsCopied ? copy.coordsCopied : copy.copyCoords}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm text-[var(--muted)]">
                    {copy.regionLabel}
                    <select
                      value={data.regionId}
                      onChange={(e) => {
                        update("regionId", e.target.value);
                        update("city", "");
                      }}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">{copy.regionPlaceholder}</option>
                      {ARMENIA_REGIONS_DATA.map((region) => (
                        <option key={region.id} value={region.id} className="bg-[var(--option-bg)] text-[var(--ink)]">
                          {region.name[lang]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-sm text-[var(--muted)]">
                    {copy.cityLabel}
                    <select
                      value={data.city}
                      onChange={(e) => update("city", e.target.value)}
                      disabled={!data.regionId}
                      className={`${inputClass} appearance-none disabled:opacity-40`}
                    >
                      <option value="">{copy.cityPlaceholder}</option>
                      {cities.map((city) => (
                        <option key={city} value={city} className="bg-[var(--option-bg)] text-[var(--ink)]">
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="grid gap-1.5 text-sm text-[var(--muted)]">
                  {copy.addressLabel}
                  <input
                    value={data.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder={copy.addressPlaceholder}
                    className={inputClass}
                  />
                </label>
              </>
            )}

            <div className="grid gap-3">
              <div className="flex items-end justify-between gap-3">
                <p
                  className="text-lg font-semibold text-[var(--gold-soft)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {copy.comboLabel}
                </p>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {!comboOpen && (selectedCombo || data.comboId === null) ? (
                  <motion.div
                    key="combo-collapsed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="theme-featured-card relative overflow-hidden border border-[var(--gold)] p-4"
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2770%27 viewBox=%270 0 40 70%27%3E%3Cpath fill=%27none%27 stroke=%27%23c9a227%27 stroke-opacity=%270.35%27 d=%27M20 0L40 12V35L20 47L0 35V12Z%27/%3E%3C/svg%3E')]" />
                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--gold)]">
                          {copy.comboSelected}
                        </p>
                        <p
                          className="mt-1 text-xl font-semibold text-[var(--gold-soft)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {selectedCombo ? selectedCombo.title[lang] : copy.comboCustom}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {selectedCombo
                            ? selectedCombo.description[lang]
                            : orderSummary}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <p
                          className="text-xl font-semibold text-[var(--ink)]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {formatAmd(total, lang)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setComboOpen(true)}
                          className="border border-[var(--line)] px-3 py-2 text-xs uppercase tracking-[0.12em] text-[var(--gold-soft)] transition hover:border-[var(--gold)]"
                        >
                          {copy.comboChange}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="combo-open"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid gap-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {COMBO_PACKAGES.map((combo, index) => {
                        const active = data.comboId === combo.id;
                        return (
                          <motion.button
                            key={combo.id}
                            type="button"
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            onClick={() => applyCombo(combo.id)}
                            className={`group relative overflow-hidden border p-4 text-left transition ${
                              active
                                ? "border-[var(--gold)] shadow-[0_0_0_1px_rgba(201,162,39,0.35),0_12px_40px_rgba(201,162,39,0.12)]"
                                : "border-[var(--line)] hover:border-[var(--gold)]/70"
                            }`}
                            style={{
                              background: "var(--featured-card-bg)",
                            }}
                          >
                            <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2770%27 viewBox=%270 0 40 70%27%3E%3Cpath fill=%27none%27 stroke=%27%23c9a227%27 stroke-opacity=%270.45%27 d=%27M20 0L40 12V35L20 47L0 35V12Z%27/%3E%3C/svg%3E')]" />

                            <div className="relative">
                              <div className="mb-3 flex items-center justify-between gap-2">
                                {combo.badge ? (
                                  <span className="inline-block border border-[rgba(201,162,39,0.35)] bg-[rgba(201,162,39,0.1)] px-2 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--gold)]">
                                    {combo.badge[lang]}
                                  </span>
                                ) : (
                                  <span />
                                )}
                                <span className="text-[0.65rem] text-[var(--muted)]">0{index + 1}</span>
                              </div>
                              <p
                                className="text-[1.35rem] font-semibold leading-tight text-[var(--gold-soft)]"
                                style={{ fontFamily: "var(--font-display)" }}
                              >
                                {combo.title[lang]}
                              </p>
                              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                {combo.description[lang]}
                              </p>
                              <div className="mt-4 flex items-end justify-between gap-3 border-t border-[rgba(201,162,39,0.2)] pt-3">
                                <p className="text-xs uppercase tracking-[0.12em] text-[var(--gold)]">
                                  {formatWeightLabel(combo.weightG, lang)} × {combo.quantity}
                                </p>
                                <p
                                  className="text-lg font-semibold text-[var(--ink)]"
                                  style={{ fontFamily: "var(--font-display)" }}
                                >
                                  {formatAmd(
                                    calcOrderTotal(combo.weightG, combo.quantity, withDelivery),
                                    lang
                                  )}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => applyCombo(null)}
                      className={`min-h-12 border px-4 text-sm transition ${
                        data.comboId === null
                          ? "border-[var(--gold)] bg-[rgba(201,162,39,0.1)] text-[var(--gold-soft)]"
                          : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
                      }`}
                    >
                      {copy.comboCustom}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {data.comboId === null && (
              <>
                <div className="grid gap-2">
                  <p className="text-sm text-[var(--muted)]">{copy.weightLabel}</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {WEIGHT_OPTIONS_G.map((weight) => {
                      const active = data.weightG === weight;
                      return (
                        <button
                          key={weight}
                          type="button"
                          onClick={() => update("weightG", weight)}
                          className={`min-h-12 border px-3 text-sm font-semibold transition ${
                            active
                              ? "button-ink border-[var(--gold)] bg-[var(--gold)]"
                              : "border-[var(--line)] text-[var(--gold-soft)] hover:border-[var(--gold)]"
                          }`}
                        >
                          {formatWeightLabel(weight, lang)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-2">
                  <p className="text-sm text-[var(--muted)]">{copy.quantityLabel}</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => update("quantity", Math.max(1, data.quantity - 1))}
                      className="flex h-11 w-11 items-center justify-center border border-[var(--line)] text-lg text-[var(--gold-soft)] hover:border-[var(--gold)]"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={data.quantity}
                      onChange={(e) =>
                        update("quantity", Math.max(1, Math.min(99, Number(e.target.value) || 1)))
                      }
                      className={`${inputClass} max-w-[5rem] text-center`}
                    />
                    <button
                      type="button"
                      onClick={() => update("quantity", Math.min(99, data.quantity + 1))}
                      className="flex h-11 w-11 items-center justify-center border border-[var(--line)] text-lg text-[var(--gold-soft)] hover:border-[var(--gold)]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </>
            )}

            {data.quantity === 1 && (
              <div className="border border-[rgba(201,162,39,0.45)] bg-[rgba(201,162,39,0.08)] p-4 text-sm text-[var(--gold-soft)]">
                {copy.singleQtyNote}
              </div>
            )}

            <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="text-xs text-[var(--muted)]">{copy.priceHint}</p>
              <p className="mt-1 text-xs text-[var(--gold)]">
                {data.fulfillment === "pickup" ? copy.pickupDiscount : copy.deliveryNote}
              </p>
              <div className="mt-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-[var(--muted)]">{copy.priceLabel}</p>
                  <p className="text-sm text-[var(--ink)]">{orderSummary}</p>
                </div>
                <p
                  className="shrink-0 text-2xl font-semibold text-[var(--gold-soft)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatAmd(total, lang)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex min-h-12 items-center justify-center border border-[var(--line)] px-5 text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
              >
                {copy.back}
              </button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={!canGoStep3}
                onClick={() => setStep(3)}
                className="button-ink inline-flex min-h-12 items-center justify-center bg-gradient-to-b from-[var(--gold-soft)] to-[var(--gold)] px-5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.next}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="grid min-w-0 gap-4"
          >
            <div>
              <h2
                className="text-xl font-semibold leading-tight text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {copy.step3Title}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{copy.step3Lead}</p>
            </div>

            <dl className="grid gap-3 border border-[var(--line)] bg-[var(--surface)] p-4">
              {[
                [copy.reviewName, data.name],
                [copy.reviewSurname, data.surname],
                [copy.reviewPhone, data.phone],
                [
                  copy.reviewFulfillment,
                  data.fulfillment === "pickup" ? copy.pickupOption : copy.deliveryOption,
                ],
                ...(data.fulfillment === "delivery"
                  ? [
                      [copy.reviewRegion, selectedRegion?.name[lang] ?? ""],
                      [copy.reviewCity, data.city],
                      [copy.reviewAddress, data.address],
                    ]
                  : [[copy.reviewAddress, PICKUP_LOCATION.coordsText]]),
                ...(selectedCombo
                  ? [[copy.reviewCombo, selectedCombo.title[lang]]]
                  : []),
                [copy.reviewOrder, orderSummary],
                [copy.reviewTotal, formatAmd(total, lang)],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="grid gap-1 border-b border-[rgba(201,162,39,0.15)] pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[140px_1fr]"
                >
                  <dt className="text-sm text-[var(--gold-soft)]">{label}</dt>
                  <dd className="min-w-0 break-words whitespace-pre-wrap text-sm text-[var(--ink)]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {data.quantity === 1 && (
              <div className="border border-[rgba(201,162,39,0.45)] bg-[rgba(201,162,39,0.08)] p-4 text-sm text-[var(--gold-soft)]">
                {copy.singleQtyNote}
              </div>
            )}

            {submitState === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="rounded-sm border border-red-400/45 bg-red-950/35 p-3 text-sm text-red-100"
              >
                {submitStateCopy[lang].error}
              </motion.p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex min-h-12 items-center justify-center border border-[var(--line)] px-5 text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--gold-soft)]"
              >
                {copy.back}
              </button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={submitState === "submitting"}
                onClick={submitOrder}
                className="button-ink inline-flex min-h-12 items-center justify-center bg-gradient-to-b from-[var(--gold-soft)] to-[var(--gold)] px-5 font-semibold disabled:cursor-wait disabled:opacity-60"
              >
                {submitState === "submitting"
                  ? submitStateCopy[lang].sending
                  : copy.submit || copy.confirm}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
