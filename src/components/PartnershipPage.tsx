"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const COPY = {
  hy: {
    eyebrow: "B2B համագործակցություն",
    title: "Աճենք միասին՝ բնական հայկական մեղրի շուրջ",
    lead: "Խանութ, սրճարան, հյուրանոց, նվերային ծառայություն կամ մեծածախ վաճառք ունե՞ք։ Ուղարկեք հայտը, և կկապվենք ձեզ հետ։",
    name: "Ձեր անունը",
    business: "Բիզնեսի / կազմակերպության անունը",
    phone: "Հեռախոս",
    email: "Էլ. փոստ",
    type: "Համագործակցության ձևը",
    message: "Ինչպե՞ս կարող ենք համագործակցել",
    submit: "Ուղարկել համագործակցության հայտ",
    success: "Շնորհակալություն։ Ձեր հայտը ստացվել է, շուտով կկապվենք։",
    error: "Հայտը չհաջողվեց ուղարկել։ Ստուգեք դաշտերը և փորձեք կրկին։",
    types: { retail: "Խանութ / վերավաճառք", wholesale: "Մեծածախ", restaurant: "Սրճարան / ռեստորան / հյուրանոց", gift: "Նվերային փաթեթներ", other: "Այլ" },
  },
  en: {
    eyebrow: "B2B partnership",
    title: "Grow together around natural Armenian honey",
    lead: "Own a store, café, hotel, gift service, or need wholesale honey? Send an inquiry and we will contact you.",
    name: "Your name",
    business: "Business / organization name",
    phone: "Phone",
    email: "Email",
    type: "Partnership type",
    message: "How can we work together?",
    submit: "Send partnership request",
    success: "Thank you. Your request was received and we will contact you soon.",
    error: "Could not send the request. Please check the fields and try again.",
    types: { retail: "Shop / retail", wholesale: "Wholesale", restaurant: "Café / restaurant / hotel", gift: "Gift packages", other: "Other" },
  },
  ru: {
    eyebrow: "B2B сотрудничество",
    title: "Растём вместе вокруг натурального армянского мёда",
    lead: "У вас магазин, кафе, отель, подарочный сервис или нужен мёд оптом? Отправьте заявку, и мы свяжемся с вами.",
    name: "Ваше имя",
    business: "Название бизнеса / организации",
    phone: "Телефон",
    email: "Эл. почта",
    type: "Формат сотрудничества",
    message: "Как мы можем сотрудничать?",
    submit: "Отправить заявку",
    success: "Спасибо. Заявка получена, мы скоро свяжемся с вами.",
    error: "Не удалось отправить заявку. Проверьте поля и повторите попытку.",
    types: { retail: "Магазин / розница", wholesale: "Опт", restaurant: "Кафе / ресторан / отель", gift: "Подарочные наборы", other: "Другое" },
  },
} as const;

type PartnershipType = keyof (typeof COPY)["hy"]["types"];

export function PartnershipPage({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          name: form.get("name"),
          businessName: form.get("businessName"),
          phone: form.get("phone"),
          email: form.get("email"),
          partnershipType: form.get("partnershipType"),
          message: form.get("message"),
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setState("success");
      event.currentTarget.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <main className="min-h-[100svh] px-4 pb-20 pt-28 sm:px-6">
      <section className="theme-order-panel mx-auto max-w-3xl border border-[var(--line)] p-[clamp(1.5rem,5vw,4rem)]">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--gold)]">{copy.eyebrow}</p>
        <h1 className="mt-3 max-w-[20ch] text-balance text-4xl font-semibold leading-tight sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-[var(--muted)]">{copy.lead}</p>

        {state === "success" ? (
          <p className="mt-8 border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-200">{copy.success}</p>
        ) : (
          <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm text-[var(--muted)]">{copy.name}<input required name="name" minLength={2} className="min-h-12 border border-[var(--line)] bg-[var(--field-bg)] px-3 text-[var(--ink)] outline-none focus:border-[var(--gold)]" /></label>
            <label className="grid gap-1.5 text-sm text-[var(--muted)]">{copy.business}<input required name="businessName" minLength={2} className="min-h-12 border border-[var(--line)] bg-[var(--field-bg)] px-3 text-[var(--ink)] outline-none focus:border-[var(--gold)]" /></label>
            <label className="grid gap-1.5 text-sm text-[var(--muted)]">{copy.phone}<input required name="phone" type="tel" className="min-h-12 border border-[var(--line)] bg-[var(--field-bg)] px-3 text-[var(--ink)] outline-none focus:border-[var(--gold)]" /></label>
            <label className="grid gap-1.5 text-sm text-[var(--muted)]">{copy.email}<input required name="email" type="email" className="min-h-12 border border-[var(--line)] bg-[var(--field-bg)] px-3 text-[var(--ink)] outline-none focus:border-[var(--gold)]" /></label>
            <label className="grid gap-1.5 text-sm text-[var(--muted)] sm:col-span-2">{copy.type}<select required name="partnershipType" defaultValue="" className="min-h-12 border border-[var(--line)] bg-[var(--field-bg)] px-3 text-[var(--ink)] outline-none focus:border-[var(--gold)]"><option value="" disabled>—</option>{(Object.keys(copy.types) as PartnershipType[]).map((type) => <option key={type} value={type}>{copy.types[type]}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm text-[var(--muted)] sm:col-span-2">{copy.message}<textarea required name="message" minLength={10} rows={5} className="border border-[var(--line)] bg-[var(--field-bg)] p-3 text-[var(--ink)] outline-none focus:border-[var(--gold)]" /></label>
            {state === "error" && <p className="text-sm text-red-300 sm:col-span-2">{copy.error}</p>}
            <button disabled={state === "sending"} className="button-ink min-h-12 bg-gradient-to-b from-[var(--gold-soft)] to-[var(--gold)] px-5 font-semibold disabled:opacity-60 sm:col-span-2">{state === "sending" ? "…" : copy.submit}</button>
          </form>
        )}
      </section>
    </main>
  );
}
