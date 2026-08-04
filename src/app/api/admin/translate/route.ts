import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TargetLang = "en" | "ru";

const TARGET_LANGS = new Set<TargetLang>(["en", "ru"]);
const MAX_TEXT_LENGTH = 5_000;
const REQUEST_TIMEOUT_MS = 12_000;

async function fetchWithTimeout(url: string | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function translateWithCloudApi(text: string, target: TargetLang) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();
  if (!apiKey) return null;

  const endpoint = new URL(
    "https://translation.googleapis.com/language/translate/v2"
  );
  endpoint.searchParams.set("key", apiKey);

  const response = await fetchWithTimeout(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "hy",
      target,
      format: "text",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Cloud Translation returned ${response.status}`);
  }

  const result = (await response.json()) as {
    data?: { translations?: Array<{ translatedText?: string }> };
  };
  const translatedText = result.data?.translations?.[0]?.translatedText;

  if (typeof translatedText !== "string") {
    throw new Error("Google Cloud Translation returned an invalid response");
  }

  return translatedText;
}

async function translateWithPublicEndpoint(
  text: string,
  target: TargetLang
) {
  const endpoint = new URL(
    "https://translate.googleapis.com/translate_a/single"
  );
  endpoint.searchParams.set("client", "gtx");
  endpoint.searchParams.set("sl", "hy");
  endpoint.searchParams.set("tl", target);
  endpoint.searchParams.set("dt", "t");
  endpoint.searchParams.set("q", text);

  const response = await fetchWithTimeout(endpoint, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Translation endpoint returned ${response.status}`);
  }

  const result: unknown = await response.json();
  if (!Array.isArray(result) || !Array.isArray(result[0])) {
    throw new Error("Translation endpoint returned an invalid response");
  }

  const translatedText = result[0]
    .map((segment: unknown) =>
      Array.isArray(segment) && typeof segment[0] === "string"
        ? segment[0]
        : ""
    )
    .join("");

  if (!translatedText) {
    throw new Error("Translation endpoint returned an empty translation");
  }

  return translatedText;
}

async function translateText(text: string, target: TargetLang) {
  const cloudTranslation = await translateWithCloudApi(text, target);
  return cloudTranslation ?? translateWithPublicEndpoint(text, target);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      text?: unknown;
      targets?: unknown;
    };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const targets = Array.isArray(body.targets)
      ? [
          ...new Set(
            body.targets.filter(
              (target): target is TargetLang =>
                typeof target === "string" &&
                TARGET_LANGS.has(target as TargetLang)
            )
          ),
        ]
      : [];

    if (!text || text.length > MAX_TEXT_LENGTH || targets.length === 0) {
      return NextResponse.json(
        { error: "Invalid translation request" },
        { status: 400 }
      );
    }

    const results = await Promise.allSettled(
      targets.map(async (target) => ({
        target,
        translatedText: await translateText(text, target),
      }))
    );
    const translations: Partial<Record<TargetLang, string>> = {};
    const failedTargets: TargetLang[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        translations[result.value.target] = result.value.translatedText;
      } else {
        failedTargets.push(targets[index]);
        console.error(
          `Automatic translation to ${targets[index]} failed:`,
          result.reason
        );
      }
    });

    if (Object.keys(translations).length === 0) {
      return NextResponse.json(
        { error: "Automatic translation is temporarily unavailable" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { translations, failedTargets },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Automatic translation failed:", error);
    return NextResponse.json(
      { error: "Automatic translation failed" },
      { status: 500 }
    );
  }
}
