"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Սխալ գաղտնաբառ / Invalid password");
      }
    } catch (err) {
      console.error(err);
      setError("Ցանցային սխալ / Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-theme relative flex min-h-screen items-center justify-center bg-[#0c0a07] px-4 font-sans text-[#f3ebe0]">
      {/* Background accents */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[rgba(201,162,39,0.06)] to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.04),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md border border-[rgba(201,162,39,0.28)] bg-[rgba(20,17,12,0.85)] p-8 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--gold)]">✦ Sers Honey ✦</p>
          <h1
            className="mt-2 text-3xl font-semibold tracking-wide text-[#f3ebe0]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Մուտք ադմին պանել
          </h1>
          <p className="mt-1 text-xs text-[#b8a990] uppercase tracking-wider">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-[#b8a990] tracking-wide">
              Գաղտնաբառ / Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[rgba(201,162,39,0.28)] bg-black/45 px-4 py-3 text-white outline-none transition focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400"
            >
              ⚠️ {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center bg-gradient-to-b from-[var(--gold-soft)] to-[var(--gold)] font-semibold text-[#16120b] transition disabled:opacity-50"
          >
            {loading ? "Մուտք..." : "Մուտք գործել"}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
