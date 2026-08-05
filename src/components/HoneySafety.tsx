import type { Lang } from "@/lib/i18n";
import { Reveal } from "@/components/Reveal";

const COPY = {
  hy: {
    eyebrow: "Պատասխանատու օգտագործում",
    title: "Բնական մեղր՝ մտածված օգտագործմամբ",
    lead: "Մեր մեղրը բնական սննդամթերք է, ոչ դեղամիջոց։ Հավասարակշռված սննդակարգում այն վայելեք չափավոր քանակով։",
    tips: [
      ["1 տարեկանից փոքր երեխաներ", "Մեղր մի տվեք մինչև 12 ամսական. սա վերաբերում է բոլոր տեսակի մեղրերին։"],
      ["Շաքարախտ կամ արյան շաքարի հսկողություն", "Մեղրը նույնպես բարձրացնում է արյան շաքարը. քանակը ներառեք ձեր սննդային պլանում և հարցրեք բուժող մասնագետին։"],
      ["Ալերգիա կամ հատուկ սննդակարգ", "Եթե մեղվամթերքից ալերգիա ունեք կամ ունեք անհատական սահմանափակումներ, նախ խորհրդակցեք բժշկի հետ։"],
    ],
    ideasTitle: "Մատուցման գաղափարներ",
    ideas: ["Թեյի, սուրճի կամ գոլ ջրի մեջ՝ ըստ ճաշակի", "Յոգուրտի, վարսակի կամ մրգերի հետ", "Պանրի, ընկույզի և հացի հետ", "Խոհարարության ու աղանդերի բնական քաղցրացման համար"],
    note: "Սննդային տեղեկություն է, ոչ բժշկական խորհրդատվություն։ Բժշկական նպատակով մեղրի կիրառման համար դիմեք բուժաշխատողի։",
    sources: "Վստահելի աղբյուրներ",
  },
  en: {
    eyebrow: "Responsible enjoyment",
    title: "Natural honey, enjoyed thoughtfully",
    lead: "Our honey is a natural food, not a medicine. Enjoy it in moderation as part of a balanced diet.",
    tips: [
      ["Children under 1 year", "Do not give honey to babies under 12 months. This applies to every type of honey."],
      ["Diabetes or blood-sugar management", "Honey raises blood glucose too. Include it in your carbohydrate plan and ask your healthcare professional about the right amount."],
      ["Allergy or special diet", "If you have an allergy to bee products or individual dietary restrictions, consult your clinician first."],
    ],
    ideasTitle: "Serving ideas",
    ideas: ["In tea, coffee, or warm water to taste", "With yogurt, oats, or fruit", "With cheese, nuts, and bread", "For naturally sweetening cooking and desserts"],
    note: "This is food information, not medical advice. Speak with a healthcare professional for medical uses of honey.",
    sources: "Trusted sources",
  },
  ru: {
    eyebrow: "Ответственное употребление",
    title: "Натуральный мёд — с разумным подходом",
    lead: "Наш мёд — натуральный продукт питания, а не лекарство. Употребляйте его умеренно как часть сбалансированного рациона.",
    tips: [
      ["Детям до 1 года", "Не давайте мёд детям младше 12 месяцев. Это относится к любому виду мёда."],
      ["Диабет или контроль сахара", "Мёд тоже повышает уровень глюкозы. Учитывайте его в плане питания и спросите специалиста о подходящем количестве."],
      ["Аллергия или специальная диета", "При аллергии на продукты пчеловодства или индивидуальных ограничениях сначала проконсультируйтесь с врачом."],
    ],
    ideasTitle: "Идеи подачи",
    ideas: ["В чай, кофе или тёплую воду по вкусу", "С йогуртом, овсянкой или фруктами", "С сыром, орехами и хлебом", "Для естественной сладости в кулинарии и десертах"],
    note: "Это информация о продукте, а не медицинская консультация. Для медицинского применения мёда обратитесь к специалисту.",
    sources: "Надёжные источники",
  },
} as const;

export function HoneySafety({ lang }: { lang: Lang }) {
  const copy = COPY[lang];

  return (
    <section className="overflow-x-clip px-[clamp(1rem,3vw,2.5rem)] py-[clamp(4.5rem,8vw,7rem)]">
      <div className="mx-auto max-w-[1240px]">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.14em] text-[var(--gold)]">{copy.eyebrow}</p>
          <h2 className="mt-3 text-balance text-[clamp(2.15rem,4vw,3.4rem)] font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>{copy.title}</h2>
          <p className="mx-auto mt-4 text-[var(--muted)]">{copy.lead}</p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {copy.tips.map(([title, text], index) => (
            <Reveal key={title} delay={index * 0.08}>
              <article className="h-full border border-[var(--line)] bg-[var(--surface)] p-5">
                <span className="text-[var(--gold)]">✦</span>
                <h3 className="mt-3 font-semibold text-[var(--gold-soft)]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12} className="mt-8 grid gap-6 border border-[var(--line)] bg-[var(--surface)] p-6 md:grid-cols-[1fr_1.1fr]">
          <div>
            <h3 className="text-xl font-semibold text-[var(--gold-soft)]" style={{ fontFamily: "var(--font-display)" }}>{copy.ideasTitle}</h3>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              {copy.ideas.map((idea) => <li key={idea} className="flex gap-2"><span className="text-[var(--gold)]">•</span>{idea}</li>)}
            </ul>
          </div>
          <div className="border-t border-[var(--line)] pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <p className="text-sm leading-relaxed text-[var(--muted)]">{copy.note}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.12em] text-[var(--gold)]">{copy.sources}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <a className="text-[var(--gold-soft)] underline-offset-4 hover:underline" href="https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/foods-and-drinks-to-avoid-or-limit.html" target="_blank" rel="noreferrer">CDC</a>
              <a className="text-[var(--gold-soft)] underline-offset-4 hover:underline" href="https://www.mayoclinic.org/diseases-conditions/diabetes/expert-answers/diabetes/faq-20058487" target="_blank" rel="noreferrer">Mayo Clinic</a>
              <a className="text-[var(--gold-soft)] underline-offset-4 hover:underline" href="https://www.nhs.uk/baby/weaning-and-feeding/foods-to-avoid-giving-babies-and-young-children/" target="_blank" rel="noreferrer">NHS</a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
