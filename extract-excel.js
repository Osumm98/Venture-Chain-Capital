const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const excelPath = "C:\\Users\\mrmaf\\OneDrive\\Desktop\\VCC Landing\\Data\\VCC 2026_ACCOUNTS, TOKENS AND MEMBERS.xlsx";
const workbook = xlsx.readFile(excelPath);
const sheetName = 'Total Active Tokens';
const sheet = workbook.Sheets[sheetName];

// Extract as raw rows
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const users = [];

// Find where data starts
let startIndex = 0;
for (let i = 0; i < data.length; i++) {
  if (data[i] && (data[i][1] === "MEMBER NAME" || data[i][2] === "MEMBER SURNAME" || data[i][3] === "MEMBERSHIP NO.")) {
    startIndex = i + 1; 
    break;
  }
}

for (let i = startIndex + 1; i < data.length; i++) {
  const row = data[i];
  if (!row || !row[3] || !row[3].toString().startsWith("BWG")) continue;

  const membershipNo = row[3];
  const firstName = row[1] || "";
  const lastName = row[2] || "";
  
  const tokens = [];
  
  const tierMap = {
    4: "ENTRY",
    5: "SILVER",
    6: "GOLD",
    7: "PLATINUM",
    8: "DIAMOND",
    9: "GROUP_1",
    10: "GROUP_2",
    11: "GROUP_3"
  };

  for (let col = 4; col <= 11; col++) {
    const qty = parseInt(row[col]);
    if (qty && qty > 0) {
      for (let count = 0; count < qty; count++) {
         tokens.push(tierMap[col]);
      }
    }
  }

  users.push({
    membershipNo,
    firstName,
    lastName,
    tokens
  });
}

const outPath = path.join(__dirname, "extracted-users.json");
fs.writeFileSync(outPath, JSON.stringify(users, null, 2));
console.log(`Extracted ${users.length} users to ${outPath}`);


console.log(`Extracted ${users.length} users to ${outPath}`);
