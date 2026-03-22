export interface OfficeLocation {
  country: string;
  city: string;
  lines: string[];
  address: string;
  phone?: string;
}

export interface ContactMethod {
  label: string;
  phone: string;
}

export const salesEmail = "sales@expertcloudconsulting.in";

export const primaryContactMethods: ContactMethod[] = [
  { label: "United States", phone: "+1 323 554 0334" },
  { label: "United Kingdom", phone: "+44 7776592702" },
  { label: "India", phone: "+91 7822827579" },
];

export const globalOffices: OfficeLocation[] = [
  {
    country: "India",
    city: "Pune",
    lines: [
      "Office #811, Gera Imperium Rise,",
      "Hinjewadi IT Park Wipro Circle,",
      "Hinjewadi Phase-II Rd, Rajiv Gandhi IT Park",
      "Pune, India - 411057",
    ],
    address:
      "Office #811, Gera Imperium Rise, Hinjewadi IT Park Wipro Circle, Hinjewadi Phase-II Rd, Rajiv Gandhi IT Park, Pune, India - 411057",
    phone: "+91 7822827579",
  },
  {
    country: "United States",
    city: "Denver",
    lines: [
      "Smart DevOps LLC",
      "1500 N Grant St, Ste R",
      "Denver, CO 80203, United States",
    ],
    address: "Smart DevOps LLC, 1500 N Grant St, Ste R, Denver, CO 80203, United States",
    phone: "+1 323 554 0334",
  },
  {
    country: "United Kingdom",
    city: "London",
    lines: [
      "Smart DevOps Ltd",
      "182-184 High Street North",
      "East Ham, London, E6 2JA",
      "England and Wales",
    ],
    address: "Smart DevOps Ltd, 182-184 High Street North, East Ham, London, E6 2JA, England and Wales",
    phone: "+44 7776592702",
  },
  {
    country: "UAE",
    city: "Dubai",
    lines: [
      "SmartTechStack Solutions FZCO",
      "IFZA Business Park, DDP",
      "Premises 001 - 66654",
      "Dubai, United Arab Emirates",
    ],
    address: "SmartTechStack Solutions FZCO, IFZA Business Park, DDP, Premises 001 - 66654, Dubai, United Arab Emirates",
    phone: "+971 52 578 7799",
  },
  {
    country: "Germany",
    city: "Munich",
    lines: ["Franz-Joseph-Str. 11", "Munich 80801, Germany"],
    address: "Franz-Joseph-Str. 11, Munich 80801, Germany",
    phone: "+49 1521 3383748",
  },
];

export const toTelHref = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;

export const organizationContactPoints = [
  {
    "@type": "ContactPoint",
    contactType: "sales",
    areaServed: "US",
    availableLanguage: ["English"],
    email: salesEmail,
    telephone: primaryContactMethods[0].phone,
  },
  {
    "@type": "ContactPoint",
    contactType: "sales",
    areaServed: "GB",
    availableLanguage: ["English"],
    email: salesEmail,
    telephone: primaryContactMethods[1].phone,
  },
  {
    "@type": "ContactPoint",
    contactType: "sales",
    areaServed: "IN",
    availableLanguage: ["English"],
    email: salesEmail,
    telephone: primaryContactMethods[2].phone,
  },
];
