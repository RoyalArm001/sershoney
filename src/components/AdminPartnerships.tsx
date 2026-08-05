"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  PartnershipRequest,
  PartnershipStatus,
} from "@/types/partnership";

const STATUS: Record<PartnershipStatus, string> = {
  new: "Նոր",
  contacted: "Կապ հաստատված",
  closed: "Փակված",
};

export function AdminPartnerships() {
  const [items, setItems] = useState<PartnershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const response = await fetch("/api/admin/partnerships", { cache: "no-store" });
      if (!response.ok) throw new Error("Request failed");
      const json = (await response.json()) as { partnerships?: PartnershipRequest[] };
      setItems(Array.isArray(json.partnerships) ? json.partnerships : []);
    } catch {
      setError("Հայտերը բեռնել չհաջողվեց։");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10_000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function changeStatus(id: string, status: PartnershipStatus) {
    const response = await fetch("/api/admin/partnerships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) {
      setError("Կարգավիճակը թարմացնել չհաջողվեց։");
      return;
    }
    const { partnership } = (await response.json()) as { partnership: PartnershipRequest };
    setItems((current) => current.map((item) => item.id === id ? partnership : item));
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] pb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--gold-soft)] font-serif">Համագործակցության հայտեր</h1>
          <p className="mt-1 text-sm text-[#b8a990]">Խանութներ, մեծածախ, հյուրանոցներ և այլ գործընկերներ։</p>
        </div>
        <button onClick={() => void load()} className="min-h-10 border border-[var(--gold)] px-4 text-sm text-[var(--gold-soft)]">Թարմացնել</button>
      </div>
      {error && <p className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      {loading ? <p className="text-[#b8a990]">Բեռնվում է…</p> : items.length === 0 ? <p className="border border-[var(--line)] p-6 text-center text-[#b8a990]">Դեռ համագործակցության հայտ չկա։</p> : (
        <div className="grid gap-4">
          {items.map((item) => (
            <article key={item.id} className="border border-[var(--line)] bg-black/20 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{item.businessName}</h2>
                  <p className="text-sm text-[var(--gold-soft)]">{item.name} · {item.phone}</p>
                  <a href={`mailto:${item.email}`} className="text-sm text-[#b8a990] hover:text-white">{item.email}</a>
                </div>
                <select value={item.status} onChange={(event) => void changeStatus(item.id, event.target.value as PartnershipStatus)} className="min-h-10 border border-[var(--line)] bg-[#15110b] px-3 text-sm text-white">
                  {Object.entries(STATUS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
              </div>
              <p className="mt-4 whitespace-pre-wrap border-t border-[var(--line)] pt-4 text-sm leading-relaxed text-[#d4c8b6]">{item.message}</p>
              <p className="mt-3 text-xs text-[#8f826f]">{item.partnershipType} · {new Intl.DateTimeFormat("hy-AM", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
