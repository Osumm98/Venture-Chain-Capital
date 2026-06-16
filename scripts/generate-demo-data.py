"""Generate the new demo-data.ts from extracted Excel JSON."""
import json

with open(r"c:\Users\mrmaf\OneDrive\Desktop\VCC Landing\vcc-platform\scripts\extracted-data.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

# Members to exclude
EXCLUDE = {"BWG2021M00004", "BWG2021M00007", "BWG2022M00001", "BWG2025M00004"}

CASHOUT = data["cashoutPrices"]
members = [m for m in data["members"] if m["membershipNo"] not in EXCLUDE]

# Title-case a name like "KGOMOTSO ELIAS" -> "Kgomotso Elias"
def title(s):
    return " ".join(w.capitalize() for w in s.split())

TIERS = ["ENTRY", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "GROUP_1", "GROUP_2", "GROUP_3"]

lines = []
lines.append('import { RoleType } from "@prisma/client";')
lines.append('import type { TokenCardData } from "@/actions/dashboard";')
lines.append("")
lines.append("// =============================================================================")
lines.append("// VCC — Accurate Member Data (sourced from VCC 2026 Master Spreadsheet)")
lines.append("// =============================================================================")
lines.append("// Cashout prices as of 2025-12-14 (latest weekly update)")
lines.append("// Token counts: instalment + carry-over from individual member sheets")
lines.append("// =============================================================================")
lines.append("")
lines.append("export interface PaymentData {")
lines.append("  readonly reference: string;")
lines.append("  readonly date: string | null;")
lines.append("  readonly amount: number;")
lines.append("}")
lines.append("")
lines.append("export interface DemoAccount {")
lines.append("  readonly userId: string;")
lines.append("  readonly membershipNo: string;")
lines.append("  readonly firstName: string;")
lines.append("  readonly lastName: string;")
lines.append("  readonly role: RoleType;")
lines.append("  readonly password: string;")
lines.append("  readonly accountValue: string;")
lines.append("  readonly tokens: ReadonlyArray<TokenCardData>;")
lines.append("  readonly payments: ReadonlyArray<PaymentData>;")
lines.append("}")
lines.append("")
lines.append("// Current weekly cashout prices (ZAR) — updated 2025-12-14")
lines.append("const CASHOUT_PRICES: Record<string, number> = {")
for tier in TIERS:
    lines.append(f'  {tier}: {CASHOUT[tier]},')
lines.append("};")
lines.append("")
lines.append("export { CASHOUT_PRICES };")
lines.append("")

# Build token generation for each member
lines.append("// ---------------------------------------------------------------------------")
lines.append("// Member Accounts — data from individual Excel member sheets")
lines.append("// ---------------------------------------------------------------------------")
lines.append("")
lines.append("export const DEMO_ACCOUNTS: ReadonlyArray<DemoAccount> = [")

for m in members:
    mno = m["membershipNo"]
    first = title(m["firstName"])
    last = title(m["lastName"])
    role = "SUPER_ADMIN" if mno == "BWG2020M00000" else "MEMBER"
    acct_val = f'{m["accountValue"]:.2f}'
    
    # Build token cards from the member token data
    token_cards = []
    token_details = m.get("instalmentTokenDetails", [])
    
    # Map token details by index for serial lookup
    detail_map = {}
    current_tier = None
    for td in token_details:
        if td["tier"]:
            current_tier = td["tier"]
        detail_map[td["tokenNumber"]] = {
            "tier": current_tier,
            "instalmentsPaid": td["instalmentsPaid"]
        }
    
    tokens_data = m["tokens"]
    serial_idx = 0
    
    for tier in TIERS:
        td = tokens_data[tier]
        inst_count = td["instalment"]
        carry_count = td["carryOver"]
        cashout = td["cashoutPrice"]
        
        # Find matching token details for instalment tokens
        inst_details = [d for tn, d in detail_map.items() if d["tier"] == tier]
        
        # Generate instalment tokens
        for i in range(inst_count):
            serial_idx += 1
            # Try to get real serial from details
            matching = [tn for tn, d in detail_map.items() if d["tier"] == tier]
            if i < len(matching):
                serial = matching[i]
                paid = detail_map[matching[i]]["instalmentsPaid"]
            else:
                serial = f"VCC-{tier}-{mno}-I{i}"
                paid = 5
            
            token_cards.append({
                "tokenSerial": serial,
                "tier": tier,
                "issueYear": int(serial[3:7]) if serial.startswith("VCC") and serial[3:7].isdigit() else 2024,
                "status": "ACTIVE",
                "isCarryOver": False,
                "currentCashoutValue": f"{cashout:.2f}",
                "installmentsPaid": paid,
                "installmentsTotal": 12,
            })
        
        # Generate carry-over tokens (fully paid)
        for i in range(carry_count):
            serial_idx += 1
            serial = f"VCC-CO-{tier[:2]}-{mno[-5:]}-{i}"
            token_cards.append({
                "tokenSerial": serial,
                "tier": tier,
                "issueYear": 2024,
                "status": "ACTIVE",
                "isCarryOver": True,
                "currentCashoutValue": f"{cashout:.2f}",
                "installmentsPaid": 12,
                "installmentsTotal": 12,
            })
    
    if not token_cards:
        continue
    
    lines.append("  {")
    lines.append(f'    userId: "demo-{mno.lower()}",')
    lines.append(f'    membershipNo: "{mno}",')
    lines.append(f'    firstName: "{first}",')
    lines.append(f'    lastName: "{last}",')
    lines.append(f'    role: "{role}" as RoleType,')
    lines.append(f'    password: "password123",')
    lines.append(f'    accountValue: "{acct_val}",')
    lines.append(f'    tokens: [')
    
    for tc in token_cards:
        lines.append("      {")
        lines.append(f'        tokenSerial: "{tc["tokenSerial"]}",')
        lines.append(f'        tier: "{tc["tier"]}",')
        lines.append(f'        issueYear: {tc["issueYear"]},')
        lines.append(f'        status: "{tc["status"]}",')
        lines.append(f'        isCarryOver: {"true" if tc["isCarryOver"] else "false"},')
        lines.append(f'        currentCashoutValue: "{tc["currentCashoutValue"]}",')
        lines.append(f'        installmentsPaid: {tc["installmentsPaid"]},')
        lines.append(f'        installmentsTotal: {tc["installmentsTotal"]},')
        lines.append("      },")
    
    lines.append("    ],")
    
    # Add payments array
    lines.append("    payments: [")
    for p in m.get("payments", []):
        date_str = f'"{p["date"]}"' if p["date"] else "null"
        lines.append("      {")
        lines.append(f'        reference: "{p["reference"]}",')
        lines.append(f'        date: {date_str},')
        lines.append(f'        amount: {p["amount"]},')
        lines.append("      },")
    lines.append("    ],")
    
    lines.append("  },")

lines.append("];")
lines.append("")

output = "\n".join(lines)
with open(r"c:\Users\mrmaf\OneDrive\Desktop\VCC Landing\vcc-platform\src\lib\demo-data.ts", "w", encoding="utf-8") as f:
    f.write(output)

print(f"Generated demo-data.ts with {len(members)} members")
print("Excluded:", EXCLUDE)
