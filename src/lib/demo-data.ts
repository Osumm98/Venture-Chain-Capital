import { RoleType } from "@prisma/client";
import type { TokenCardData } from "@/actions/dashboard";

export interface DemoAccount {
  readonly userId: string;
  readonly membershipNo: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: RoleType;
  readonly password: string;
  readonly tokens: ReadonlyArray<TokenCardData>;
}

// Token base prices for dev fallback
const TIER_VALUES: Record<string, string> = {
  ENTRY: "1250.00",
  SILVER: "1875.00",
  GOLD: "3750.00",
  PLATINUM: "15000.00",
  DIAMOND: "37500.00",
  GROUP_1: "11250.00",
  GROUP_2: "33750.00",
  GROUP_3: "75000.00"
};

const rawUsers = [
  { membershipNo: "BWG2020M00001", firstName: "Kgomotso Elias", lastName: "Nkabinde", tokens: ["GOLD", "GOLD", "DIAMOND"] },
  { membershipNo: "BWG2020M00002", firstName: "Sechaba Richard", lastName: "Mokoena", tokens: ["ENTRY", "SILVER", "GOLD", "GOLD"] },
  { membershipNo: "BWG2020M00003", firstName: "Omphile Neo", lastName: "Makiri", tokens: ["ENTRY", "GOLD", "GOLD", "GOLD", "GOLD", "GOLD", "PLATINUM", "PLATINUM"] },
  { membershipNo: "BWG2020M00004", firstName: "Thando", lastName: "Khoza", tokens: ["SILVER", "GOLD", "GOLD", "GOLD", "PLATINUM"] },
  { membershipNo: "BWG2020M00005", firstName: "Khothatso", lastName: "Dhlamini", tokens: ["GOLD", "GOLD", "PLATINUM"] },
  { membershipNo: "BWG2020M00006", firstName: "Bhabile", lastName: "Mithani", tokens: ["GOLD", "GOLD", "PLATINUM", "PLATINUM"] },
  { membershipNo: "BWG2020M00008", firstName: "Itumeleng", lastName: "Nkabinde", tokens: ["GOLD", "GOLD", "DIAMOND"] },
  { membershipNo: "BWG2020M00010", firstName: "Sydney", lastName: "Phillips", tokens: ["GOLD", "GOLD", "PLATINUM"] },
  { membershipNo: "BWG2020M00011", firstName: "Mhleli", lastName: "Masondo", tokens: ["ENTRY", "GOLD", "GOLD", "GOLD", "PLATINUM"] },
  { membershipNo: "BWG2020M00012", firstName: "Tankiso", lastName: "Makhetha", tokens: ["ENTRY", "GOLD", "GOLD", "GOLD", "GOLD"] },
  { membershipNo: "BWG2020M00013", firstName: "Mmuso Richard", lastName: "Mafisa", tokens: ["GOLD", "GOLD", "PLATINUM"] },
  { membershipNo: "BWG2020M00014", firstName: "Edzani", lastName: "Davhana", tokens: ["GOLD", "GOLD", "PLATINUM"] },
  { membershipNo: "BWG2021M00001", firstName: "Sanele", lastName: "Shibe", tokens: ["GOLD", "GOLD", "PLATINUM"] },
  { membershipNo: "BWG2021M00002", firstName: "Erica", lastName: "Mthethwa", tokens: ["ENTRY", "SILVER", "GOLD"] },
  { membershipNo: "BWG2021M00003", firstName: "Abram", lastName: "Magooa", tokens: ["ENTRY", "GOLD", "GOLD"] },
  { membershipNo: "BWG2021M00004", firstName: "Loyiso", lastName: "Taki", tokens: ["SILVER", "SILVER", "GOLD"] },
  { membershipNo: "BWG2021M00005", firstName: "Martha Matshediso", lastName: "Makiri", tokens: ["SILVER", "GOLD", "GOLD", "GOLD"] },
  { membershipNo: "BWG2021M00007", firstName: "Nthabiseng", lastName: "Ntebele-Tladi", tokens: ["ENTRY", "GOLD"] },
  { membershipNo: "BWG2021M00008", firstName: "Nokukhanya", lastName: "Dhlamini", tokens: ["ENTRY", "SILVER", "GOLD", "GOLD"] },
  { membershipNo: "BWG2021M00010", firstName: "Asavela", lastName: "Ludidi", tokens: ["GOLD", "PLATINUM"] },
  { membershipNo: "BWG2021M00011", firstName: "Junior", lastName: "Mashigo", tokens: ["GOLD", "GOLD", "PLATINUM"] },
  { membershipNo: "BWG2021M00012", firstName: "Susan", lastName: "Monyai", tokens: ["SILVER", "SILVER", "GOLD"] },
  { membershipNo: "BWG2021M00013", firstName: "Mashudu", lastName: "Monyai", tokens: ["ENTRY", "GOLD"] },
  { membershipNo: "BWG2022M00001", firstName: "Penelope", lastName: "Khoza", tokens: ["GOLD", "GOLD", "GOLD", "GOLD"] },
  { membershipNo: "BWG2022M00002", firstName: "Letlhogonolo", lastName: "Phokela", tokens: ["SILVER", "SILVER", "GOLD"] },
  { membershipNo: "BWG2023M00003", firstName: "Mzwakhe", lastName: "Dhlamini", tokens: ["SILVER", "GOLD", "GOLD"] },
  { membershipNo: "BWG2022M00004", firstName: "Mfundo", lastName: "Mfundo", tokens: ["GOLD", "GOLD", "GOLD", "GOLD"] },
  { membershipNo: "BWG2022M00005", firstName: "Pretty Nommiselo", lastName: "Khoza", tokens: ["GOLD", "GOLD", "GOLD", "GOLD"] },
  { membershipNo: "BWG2022M00011", firstName: "Dipontso", lastName: "Motepe", tokens: ["GOLD", "GOLD", "GOLD", "GOLD"] },
  { membershipNo: "BWG2022M00014", firstName: "Sinesipo", lastName: "Makaula", tokens: ["ENTRY", "SILVER", "GOLD"] },
  { membershipNo: "BWG2022M00016", firstName: "Mpho Thabo", lastName: "Segota", tokens: ["ENTRY", "SILVER", "GOLD"] },
  { membershipNo: "BWG2023M00001", firstName: "Ashley", lastName: "Maredi", tokens: ["SILVER", "GOLD", "GOLD", "GOLD", "GOLD"] },
  { membershipNo: "BWG2023M00002", firstName: "Shannon", lastName: "Fortuin", tokens: ["SILVER", "GOLD", "GOLD", "GOLD"] },
  { membershipNo: "BWG2024M00001", firstName: "Femida", lastName: "Razak", tokens: ["ENTRY", "GOLD", "PLATINUM", "PLATINUM"] },
  { membershipNo: "BWG2020M00000", firstName: "Venture Chain", lastName: "Capital", tokens: ["ENTRY", "GOLD", "DIAMOND"] },
  { membershipNo: "BWG2024M00002", firstName: "Nontobeko Nokwanda", lastName: "Dlamini", tokens: ["ENTRY", "GOLD", "GOLD"] },
  { membershipNo: "BWG2024M00003", firstName: "Amohelang Mnqobi", lastName: "Mafisa", tokens: ["ENTRY", "GOLD", "GOLD", "PLATINUM"] },
  { membershipNo: "BWG2025M00001", firstName: "Michaela", lastName: "Fortuin", tokens: ["ENTRY"] },
  { membershipNo: "BWG2025M00002", firstName: "Shamee", lastName: "Fortuin", tokens: ["GOLD", "GOLD"] },
  { membershipNo: "BWG2025M00003", firstName: "Craig", lastName: "Fortuin", tokens: ["GOLD", "GOLD"] },
  { membershipNo: "BWG2025M00004", firstName: "Queen", lastName: "Mithani", tokens: ["PLATINUM"] }
];

export const DEMO_ACCOUNTS: ReadonlyArray<DemoAccount> = rawUsers.map((u, index) => {
  const accountTokens: TokenCardData[] = u.tokens.map((tier, tIdx) => ({
    tokenSerial: `VCC-${tier}-${String(index + 1).padStart(3, "0")}-${tIdx}`,
    tier: tier,
    issueYear: 2024,
    status: "ACTIVE",
    isCarryOver: false,
    currentCashoutValue: TIER_VALUES[tier] || "0.00",
    installmentsPaid: 12,
    installmentsTotal: 12,
  }));

  return {
    userId: `demo-user-${index}`,
    membershipNo: u.membershipNo,
    firstName: u.firstName.trim(),
    lastName: u.lastName.trim(),
    role: u.membershipNo === "BWG2020M00000" ? "SUPER_ADMIN" : "MEMBER",
    password: "password123", // Default password for everyone to login easily
    tokens: accountTokens,
  };
});
