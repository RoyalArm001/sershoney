import type { Lang } from "@/lib/i18n";

type HeroCopy = {
  title: string;
  subtitle: string;
  lead: string;
  browse: string;
  learnMore: string;
  scroll: string;
};

export type LocaleCopy = {
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
  hero: HeroCopy;
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
    postsEyebrow: string;
    postsTitle: string;
    postsLead: string;
    postsCta: string;
    contactEyebrow: string;
    contactTitle: string;
    contactLead: string;
  };
  facts: Array<{ label: string; value: string }>;
  values: Array<{ title: string; text: string }>;
  sizes: Array<{ weight: string; name: string; text: string; featured?: boolean }>;
  featuredBadge: string;
  nutritionTitle: string;
  nutrition: Array<{ label: string; value: string }>;
  ctaGift: string;
  form: {
    nameLabel: string;
    namePlaceholder: string;
    surnameLabel: string;
    surnamePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    orderLabel: string;
    orderPlaceholder: string;
    regionLabel: string;
    regionPlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    addressLabel: string;
    addressPlaceholder: string;
    weightLabel: string;
    quantityLabel: string;
    priceLabel: string;
    deliveryNote: string;
    priceHint: string;
    singleQtyNote: string;
    successSingle: string;
    step1Title: string;
    step1Lead: string;
    step2Title: string;
    step2Lead: string;
    step3Title: string;
    step3Lead: string;
    next: string;
    back: string;
    confirm: string;
    submit: string;
    success: string;
    reviewName: string;
    reviewSurname: string;
    reviewPhone: string;
    reviewRegion: string;
    reviewCity: string;
    reviewAddress: string;
    reviewOrder: string;
    reviewTotal: string;
    fulfillmentLabel: string;
    deliveryOption: string;
    pickupOption: string;
    pickupLead: string;
    pickupDiscount: string;
    openMaps: string;
    openNavigator: string;
    copyCoords: string;
    coordsCopied: string;
    reviewFulfillment: string;
    comboLabel: string;
    comboCustom: string;
    reviewCombo: string;
    comboChange: string;
    comboSelected: string;
  };
  footerLine: string;
  footerMeta: string;
};

export const locales: Record<Lang, LocaleCopy> = {
  hy: {
    metaTitle: "Sers Honey | Բնական մեղր Վայքից, Հայաստան",
    metaDescription:
      "Sers Honey՝ 100% բնական լեռնային մեղր Վայքից, Վայոց ձոր, Հայաստան։ Մեղրի տեսականի՝ 450գ, 900գ և 1000գ տարաներով, նվերային փաթեթավորմամբ։",
    nav: {
      about: "Մեր մասին",
      products: "Տեսականի",
      gifts: "Նվերներ",
      quality: "Որակ",
      contact: "Պատվիրել",
      menuLabel: "Մենյու",
    },
    hero: {
      title: "Sers Honey",
      subtitle: "Հայաստանի լեռների բնական մեղր",
      lead: "100% բնական լեռնային բազմածաղիկ մեղր՝ առանց հավելումների։",
      browse: "Դիտել տեսականին",
      learnMore: "Իմանալ ավելին",
      scroll: "Ոլորել",
    },
    sections: {
      aboutEyebrow: "• 100% ԲՆԱԿԱՆ ՄԵՂՐ •",
      aboutTitle: "Հավաքված Հայաստանի լեռներում",
      aboutBody:
        "Sers Honey-ն լեռնային բազմածաղիկ մեղր է՝ ծնված մաքուր օդում և վայրի ծաղիկների մեջ։ Յուրաքանչյուր կաթիլ պահպանում է հայկական բնության համն ու ջերմությունը։",
      qualityEyebrow: "Մեր առավելությունները",
      qualityTitle: "Ինչո՞ւ Sers Honey",
      productsEyebrow: "— ՄԵՂՐԻ ՏԵՍԱԿՆԵՐ —",
      productsTitle: "Ընտրեք ձեր չափսը",
      productsLead: "Լեռնային բազմածաղիկ մեղր՝ երեք տարբերակով։",
      giftsEyebrow: "Նվերային փաթեթավորում",
      giftsTitle: "Պատրաստ նվերելու համար",
      giftsBody:
        "Սև մատե տուփեր, ոսկեգույն մանրամասներ և վեցանկյուն բանկա՝ որպեսզի մեղրը դառնա նրբաճաշակ նվեր։",
      postsEyebrow: "Instagram",
      postsTitle: "Մեր պոստերը",
      postsLead: "Պրեմիում կադրեր՝ feed (1080×1080) և story չափերով։",
      postsCta: "Դիտել Instagram-ում",
      contactEyebrow: "Pure Armenian Honey",
      contactTitle: "Պատվիրեք Sers Honey",
      contactLead: "Գրեք մեզ՝ չափսը, քանակը և առաքման հասցեն նշելով։",
    },
    facts: [
      { label: "Բաղադրություն", value: "100% բնական մեղր" },
      { label: "Ծագման երկիր", value: "Հայաստան" },
      { label: "Պահպանում", value: "+5°C — +25°C, չոր ու զով տեղում" },
    ],
    values: [
      { title: "100% Բնական", text: "Առանց շաքարի և արհեստական հավելումների։" },
      { title: "Լեռնային մեղր", text: "Բազմածաղիկ մեղր՝ բարձրադիր մարգագետիններից։" },
      { title: "Հավաքված լեռներում", text: "Հայաստանի լեռնային շրջաններից՝ թարմ և մաքուր։" },
      { title: "Առանց հավելումների", text: "Միայն մեղր՝ բնական արտադրանք։" },
      { title: "Բարձր որակ", text: "Ուշադիր ընտրված և խնամքով փաթեթավորված։" },
    ],
    sizes: [
      { weight: "450 գ", name: "Կոմպակտ", text: "Ամենօրյա օգտագործման համար" },
      { weight: "900 գ", name: "Դասական", text: "Ընտանիքի և նվերի իդեալական չափ", featured: true },
      { weight: "1000 գ", name: "Մեծ", text: "Առատ մատուցման համար" },
    ],
    featuredBadge: "Ամենապահանջված",
    nutritionTitle: "Սննդային արժեք (100 գ)",
    nutrition: [
      { label: "Էներգիա", value: "304 կկալ" },
      { label: "Ածխաջրեր", value: "82 գ" },
      { label: "Սպիտակուցներ", value: "0.3 գ" },
      { label: "Ճարպեր", value: "0 գ" },
    ],
    ctaGift: "Պատվիրել նվերային հավաքածու",
    form: {
      nameLabel: "Անուն",
      namePlaceholder: "Ձեր անունը",
      surnameLabel: "Ազգանուն",
      surnamePlaceholder: "Ձեր ազգանունը",
      phoneLabel: "Հեռախոս",
      phonePlaceholder: "+374 ...",
      orderLabel: "Պատվեր",
      orderPlaceholder: "Օր.՝ 900գ × 2, նվերային տուփով",
      regionLabel: "Մարզ",
      regionPlaceholder: "Ընտրեք մարզը",
      cityLabel: "Քաղաք / բնակավայր",
      cityPlaceholder: "Ընտրեք քաղաքը",
      addressLabel: "Հասցե",
      addressPlaceholder: "Փողոց, շենք, բնակարան",
      weightLabel: "Քաշ",
      quantityLabel: "Քանակ",
      priceLabel: "Ընդամենը",
      deliveryNote: "Առաքման միջին քաշը՝ 2 կգ",
      priceHint: "1 կգ մեղր՝ 5000 դրամ · առաքմամբ՝ 5500 դրամ",
      singleQtyNote:
        "Քանակը 1 է՝ պատվերը ընդունում ենք, բայց կապ կհաստատենք ձեզ հետ՝ պատվերի փոխանցումը համաձայնեցնելու համար։",
      successSingle:
        "Պատվերն ընդունված է։ Քանի որ քանակը 1 է, շուտով կապ կհաստատենք ձեզ հետ՝ փոխանցումը կազմակերպելու համար։",
      step1Title: "Անձնական տվյալներ",
      step1Lead: "Գրեք ձեր անունն ու ազգանունը, ապա հաստատեք։",
      step2Title: "Առաքում Հայաստանում",
      step2Lead: "Ընտրեք մարզը, քաղաքը, քաշը և քանակը։",
      step3Title: "Ստուգում և հաստատում",
      step3Lead: "Ստուգեք ամբողջ տեղեկությունը և հաստատեք պատվերը։",
      next: "Հաստատել և շարունակել",
      back: "Հետ",
      confirm: "Հաստատել պատվերը",
      submit: "Ուղարկել պատվերը",
      success: "Շնորհակալություն։ Շուտով կապ կհաստատենք ձեզ հետ։",
      reviewName: "Անուն",
      reviewSurname: "Ազգանուն",
      reviewPhone: "Հեռախոս",
      reviewRegion: "Մարզ",
      reviewCity: "Քաղաք",
      reviewAddress: "Հասցե",
      reviewOrder: "Պատվեր",
      reviewTotal: "Գումար",
      fulfillmentLabel: "Ստացման եղանակ",
      deliveryOption: "Առաքում հասցեով",
      pickupOption: "Ինքս կմոտենամ",
      pickupLead:
        "Եթե կարող եք մոտենալ, բացեք քարտեզը/նավիգատորը կամ պատճենեք կոորդինատները։ Այդ դեպքում գինը 500 դրամ/կգ ավելի էժան է։",
      pickupDiscount: "Ինքնաառաքում՝ −500 դրամ յուրաքանչյուր կգ-ի համար",
      openMaps: "Բացել Google Maps",
      openNavigator: "Բացել նավիգատոր",
      copyCoords: "Պատճենել կոորդինատը",
      coordsCopied: "Պատճենված է",
      reviewFulfillment: "Ստացում",
      comboLabel: "Կոմբո փաթեթներ",
      comboCustom: "Անհատական ընտրություն",
      reviewCombo: "Փաթեթ",
      comboChange: "Փոխել փաթեթը",
      comboSelected: "Ընտրված փաթեթ",
    },
    footerLine: "Հավաքված Հայաստանի լեռներում ♥",
    footerMeta: "100% բնական արտադրանք",
  },
  en: {
    metaTitle: "Sers Honey | Natural Armenian Honey from Vayots Dzor",
    metaDescription:
      "Discover Sers Honey, 100% natural mountain multifloral honey from Sers village near Vayk, Vayots Dzor, Armenia. Available in 450g, 900g and 1000g jars.",
    nav: {
      about: "About",
      products: "Products",
      gifts: "Gifts",
      quality: "Quality",
      contact: "Order",
      menuLabel: "Menu",
    },
    hero: {
      title: "Sers Honey",
      subtitle: "Natural honey from Armenian mountains",
      lead: "100% natural mountain multi-flower honey without additives.",
      browse: "Explore products",
      learnMore: "Learn more",
      scroll: "Scroll",
    },
    sections: {
      aboutEyebrow: "• 100% NATURAL HONEY •",
      aboutTitle: "Harvested in the mountains of Armenia",
      aboutBody:
        "Sers Honey is mountain multi-flower honey born in clean air and wild blossoms. Every drop keeps the warmth and character of Armenian nature.",
      qualityEyebrow: "Our Advantages",
      qualityTitle: "Why Sers Honey",
      productsEyebrow: "— HONEY SIZES —",
      productsTitle: "Choose your size",
      productsLead: "Mountain multi-flower honey in three options.",
      giftsEyebrow: "Gift Packaging",
      giftsTitle: "Ready to gift",
      giftsBody:
        "Matte black boxes, golden details, and a hexagonal jar make each set elegant and memorable.",
      postsEyebrow: "Instagram",
      postsTitle: "Our posts",
      postsLead: "Premium frames in feed (1080×1080) and story sizes.",
      postsCta: "View on Instagram",
      contactEyebrow: "Pure Armenian Honey",
      contactTitle: "Order Sers Honey",
      contactLead: "Send your preferred size, quantity, and delivery address.",
    },
    facts: [
      { label: "Ingredients", value: "100% natural honey" },
      { label: "Country of origin", value: "Armenia" },
      { label: "Storage", value: "+5°C to +25°C, dry and cool place" },
    ],
    values: [
      { title: "100% Natural", text: "No sugar and no artificial additives." },
      { title: "Mountain Honey", text: "Multi-flower honey from high-altitude meadows." },
      { title: "Mountain Harvested", text: "Collected fresh in Armenia's mountain regions." },
      { title: "No Additives", text: "Only pure honey, a fully natural product." },
      { title: "High Quality", text: "Carefully selected and packed with attention." },
    ],
    sizes: [
      { weight: "450 g", name: "Compact", text: "Perfect for daily use" },
      { weight: "900 g", name: "Classic", text: "Ideal size for family and gifting", featured: true },
      { weight: "1000 g", name: "Large", text: "Best for generous servings" },
    ],
    featuredBadge: "Most popular",
    nutritionTitle: "Nutrition facts (100 g)",
    nutrition: [
      { label: "Energy", value: "304 kcal" },
      { label: "Carbohydrates", value: "82 g" },
      { label: "Protein", value: "0.3 g" },
      { label: "Fat", value: "0 g" },
    ],
    ctaGift: "Order gift set",
    form: {
      nameLabel: "First name",
      namePlaceholder: "Your first name",
      surnameLabel: "Last name",
      surnamePlaceholder: "Your last name",
      phoneLabel: "Phone",
      phonePlaceholder: "+374 ...",
      orderLabel: "Order details",
      orderPlaceholder: "Example: 900g × 2 with gift box",
      regionLabel: "Region",
      regionPlaceholder: "Select a region",
      cityLabel: "City / locality",
      cityPlaceholder: "Select a city",
      addressLabel: "Address",
      addressPlaceholder: "Street, building, apartment",
      weightLabel: "Weight",
      quantityLabel: "Quantity",
      priceLabel: "Total",
      deliveryNote: "Average delivery order weight: 2 kg",
      priceHint: "1 kg honey: 5000 AMD · with delivery: 5500 AMD",
      singleQtyNote:
        "Quantity is 1 — we accept the order, but we will contact you to arrange the transfer.",
      successSingle:
        "Order accepted. Because the quantity is 1, we will contact you shortly to arrange the transfer.",
      step1Title: "Personal details",
      step1Lead: "Enter your first and last name, then confirm to continue.",
      step2Title: "Delivery in Armenia",
      step2Lead: "Select region, city, weight and quantity.",
      step3Title: "Review and confirm",
      step3Lead: "Check the full information and confirm your order.",
      next: "Confirm and continue",
      back: "Back",
      confirm: "Confirm order",
      submit: "Send order",
      success: "Thank you. We will contact you shortly.",
      reviewName: "First name",
      reviewSurname: "Last name",
      reviewPhone: "Phone",
      reviewRegion: "Region",
      reviewCity: "City",
      reviewAddress: "Address",
      reviewOrder: "Order",
      reviewTotal: "Total",
      fulfillmentLabel: "How to receive",
      deliveryOption: "Delivery to address",
      pickupOption: "I will pick up",
      pickupLead:
        "If you can come, open Maps/Navigator or copy the coordinates. In that case the price is 500 AMD cheaper per kg.",
      pickupDiscount: "Pickup: −500 AMD per kg",
      openMaps: "Open Google Maps",
      openNavigator: "Open navigator",
      copyCoords: "Copy coordinates",
      coordsCopied: "Copied",
      reviewFulfillment: "Fulfillment",
      comboLabel: "Combo packages",
      comboCustom: "Custom selection",
      reviewCombo: "Package",
      comboChange: "Change package",
      comboSelected: "Selected package",
    },
    footerLine: "Harvested in the mountains of Armenia ♥",
    footerMeta: "100% natural product",
  },
  ru: {
    metaTitle: "Sers Honey | Натуральный армянский мёд из Вайоц-Дзора",
    metaDescription:
      "Sers Honey — 100% натуральный горный разнотравный мёд из села Серс рядом с Вайком, Вайоц-Дзор, Армения. Банки 450 г, 900 г и 1000 г.",
    nav: {
      about: "О нас",
      products: "Продукция",
      gifts: "Подарки",
      quality: "Качество",
      contact: "Заказать",
      menuLabel: "Меню",
    },
    hero: {
      title: "Sers Honey",
      subtitle: "Натуральный мед из гор Армении",
      lead: "100% натуральный горный разнотравный мед без добавок.",
      browse: "Смотреть продукцию",
      learnMore: "Узнать больше",
      scroll: "Листать",
    },
    sections: {
      aboutEyebrow: "• 100% НАТУРАЛЬНЫЙ МЕД •",
      aboutTitle: "Собран в горах Армении",
      aboutBody:
        "Sers Honey — это горный разнотравный мед, рожденный в чистом воздухе и диких цветах. Каждая капля сохраняет тепло и вкус армянской природы.",
      qualityEyebrow: "Наши преимущества",
      qualityTitle: "Почему Sers Honey",
      productsEyebrow: "— ВАРИАНТЫ МЕДА —",
      productsTitle: "Выберите объем",
      productsLead: "Горный разнотравный мед в трех форматах.",
      giftsEyebrow: "Подарочная упаковка",
      giftsTitle: "Готово для подарка",
      giftsBody:
        "Матовые черные коробки, золотые детали и шестигранная банка делают набор стильным подарком.",
      postsEyebrow: "Instagram",
      postsTitle: "Наши посты",
      postsLead: "Премиальные кадры в размерах feed (1080×1080) и stories.",
      postsCta: "Смотреть в Instagram",
      contactEyebrow: "Pure Armenian Honey",
      contactTitle: "Закажите Sers Honey",
      contactLead: "Напишите размер, количество и адрес доставки.",
    },
    facts: [
      { label: "Состав", value: "100% натуральный мед" },
      { label: "Страна происхождения", value: "Армения" },
      { label: "Хранение", value: "+5°C до +25°C, в сухом и прохладном месте" },
    ],
    values: [
      { title: "100% Натуральный", text: "Без сахара и искусственных добавок." },
      { title: "Горный мед", text: "Разнотравный мед из высокогорных лугов." },
      { title: "Собран в горах", text: "Собран свежим в горных регионах Армении." },
      { title: "Без добавок", text: "Только чистый мед, полностью натуральный продукт." },
      { title: "Высокое качество", text: "Тщательный отбор и аккуратная упаковка." },
    ],
    sizes: [
      { weight: "450 г", name: "Компакт", text: "Для ежедневного использования" },
      { weight: "900 г", name: "Классический", text: "Идеально для семьи и подарка", featured: true },
      { weight: "1000 г", name: "Большой", text: "Для щедрой подачи" },
    ],
    featuredBadge: "Самый популярный",
    nutritionTitle: "Пищевая ценность (100 г)",
    nutrition: [
      { label: "Энергия", value: "304 ккал" },
      { label: "Углеводы", value: "82 г" },
      { label: "Белки", value: "0.3 г" },
      { label: "Жиры", value: "0 г" },
    ],
    ctaGift: "Заказать подарочный набор",
    form: {
      nameLabel: "Имя",
      namePlaceholder: "Ваше имя",
      surnameLabel: "Фамилия",
      surnamePlaceholder: "Ваша фамилия",
      phoneLabel: "Телефон",
      phonePlaceholder: "+374 ...",
      orderLabel: "Заказ",
      orderPlaceholder: "Напр.: 900г × 2, в подарочной коробке",
      regionLabel: "Область",
      regionPlaceholder: "Выберите область",
      cityLabel: "Город / населенный пункт",
      cityPlaceholder: "Выберите город",
      addressLabel: "Адрес",
      addressPlaceholder: "Улица, дом, квартира",
      weightLabel: "Вес",
      quantityLabel: "Количество",
      priceLabel: "Итого",
      deliveryNote: "Средний вес доставки: 2 кг",
      priceHint: "1 кг меда: 5000 драм · с доставкой: 5500 драм",
      singleQtyNote:
        "Количество 1 — заказ принимаем, но свяжемся с вами, чтобы согласовать передачу заказа.",
      successSingle:
        "Заказ принят. Поскольку количество 1, мы скоро свяжемся с вами, чтобы организовать передачу.",
      step1Title: "Личные данные",
      step1Lead: "Введите имя и фамилию, затем подтвердите.",
      step2Title: "Доставка по Армении",
      step2Lead: "Выберите область, город, вес и количество.",
      step3Title: "Проверка и подтверждение",
      step3Lead: "Проверьте всю информацию и подтвердите заказ.",
      next: "Подтвердить и продолжить",
      back: "Назад",
      confirm: "Подтвердить заказ",
      submit: "Отправить заказ",
      success: "Спасибо. Мы скоро с вами свяжемся.",
      reviewName: "Имя",
      reviewSurname: "Фамилия",
      reviewPhone: "Телефон",
      reviewRegion: "Область",
      reviewCity: "Город",
      reviewAddress: "Адрес",
      reviewOrder: "Заказ",
      reviewTotal: "Сумма",
      fulfillmentLabel: "Способ получения",
      deliveryOption: "Доставка по адресу",
      pickupOption: "Заберу сам(а)",
      pickupLead:
        "Если можете подъехать — откройте карту/навигатор или скопируйте координаты. Тогда цена на 500 драм/кг дешевле.",
      pickupDiscount: "Самовывоз: −500 драм за каждый кг",
      openMaps: "Открыть Google Maps",
      openNavigator: "Открыть навигатор",
      copyCoords: "Скопировать координаты",
      coordsCopied: "Скопировано",
      reviewFulfillment: "Получение",
      comboLabel: "Комбо-наборы",
      comboCustom: "Свой выбор",
      reviewCombo: "Набор",
      comboChange: "Изменить набор",
      comboSelected: "Выбранный набор",
    },
    footerLine: "Собран в горах Армении ♥",
    footerMeta: "100% натуральный продукт",
  },
};
