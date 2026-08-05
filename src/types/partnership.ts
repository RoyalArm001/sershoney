import type { Lang } from "@/lib/i18n";

export const PARTNERSHIP_STATUSES = ["new", "contacted", "closed"] as const;
export type PartnershipStatus = (typeof PARTNERSHIP_STATUSES)[number];

export type PartnershipRequest = {
  id: string;
  lang: Lang;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  partnershipType: "retail" | "wholesale" | "restaurant" | "gift" | "other";
  message: string;
  status: PartnershipStatus;
  createdAt: string;
  updatedAt: string;
};
