"use server";

export type AssetCategory = "All Assets" | "Hedge" | "Stocks" | "Forex" | "Commodities" | "NFTs";

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  category: AssetCategory;
  priceZAR: number;
  change24h: number;
  change7d: number;
  marketCapStr: string;
  volume24hStr: string;
  sparkline: number[]; // 7 data points for mini chart
  holdingsQty: number; // How much VCC holds
  holdingsValueZAR: number; // qty × price
  portfolioWeight: number; // % of total portfolio
  yieldStr?: string;
  volatility?: string;
  status?: string;
  rarity?: string;
  isFeatured: boolean;
}

export interface PortfolioSummary {
  totalValueZAR: number;
  change24hPercent: number;
  change24hZAR: number;
  totalAssets: number;
  bestPerformer: { name: string; change: number };
  worstPerformer: { name: string; change: number };
  categoryBreakdown: Array<{ category: string; weight: number; color: string }>;
}

export async function getMarketAssets(): Promise<Asset[]> {
  return [
    {
      id: "btc",
      name: "Bitcoin",
      ticker: "BTC/ZAR",
      category: "All Assets",
      priceZAR: 1245600.00,
      change24h: 5.42,
      change7d: 12.8,
      marketCapStr: "R 24.5T",
      volume24hStr: "R 892B",
      sparkline: [38, 42, 35, 52, 48, 65, 72],
      holdingsQty: 2.45,
      holdingsValueZAR: 3051720,
      portfolioWeight: 28.4,
      isFeatured: true,
    },
    {
      id: "eth",
      name: "Ethereum",
      ticker: "ETH/ZAR",
      category: "All Assets",
      priceZAR: 67340.00,
      change24h: 2.15,
      change7d: 8.3,
      marketCapStr: "R 8.2T",
      volume24hStr: "R 445B",
      sparkline: [45, 42, 50, 48, 55, 58, 62],
      holdingsQty: 18.7,
      holdingsValueZAR: 1259258,
      portfolioWeight: 11.7,
      isFeatured: true,
    },
    {
      id: "gold-reserve",
      name: "Gold Reserve",
      ticker: "XAU/ZAR",
      category: "Commodities",
      priceZAR: 34200.00,
      change24h: 0.8,
      change7d: 2.1,
      marketCapStr: "R 84.5B",
      volume24hStr: "R 12.4B",
      sparkline: [55, 56, 54, 57, 56, 58, 59],
      holdingsQty: 45,
      holdingsValueZAR: 1539000,
      portfolioWeight: 14.3,
      status: "+0.8%",
      isFeatured: true,
    },
    {
      id: "alpha-hedge",
      name: "Alpha Hedge Alpha",
      ticker: "AHA Fund",
      category: "Hedge",
      priceZAR: 12450.00,
      change24h: 12.4,
      change7d: 18.5,
      marketCapStr: "R 1.2B",
      volume24hStr: "R 84M",
      sparkline: [30, 35, 40, 45, 52, 60, 72],
      holdingsQty: 85,
      holdingsValueZAR: 1058250,
      portfolioWeight: 9.8,
      yieldStr: "+12.4%",
      isFeatured: true,
    },
    {
      id: "usd-zar",
      name: "USD/ZAR",
      ticker: "Forex Pair",
      category: "Forex",
      priceZAR: 18.94,
      change24h: -2.1,
      change7d: -1.4,
      marketCapStr: "-",
      volume24hStr: "R 2.1T",
      sparkline: [62, 58, 55, 52, 48, 45, 42],
      holdingsQty: 125000,
      holdingsValueZAR: 2367500,
      portfolioWeight: 22.0,
      volatility: "-2.1%",
      isFeatured: false,
    },
    {
      id: "sbk",
      name: "Standard Bank",
      ticker: "JSE: SBK",
      category: "Stocks",
      priceZAR: 184.50,
      change24h: 1.24,
      change7d: 3.8,
      marketCapStr: "R 294.2B",
      volume24hStr: "R 1.8B",
      sparkline: [48, 50, 49, 52, 54, 53, 56],
      holdingsQty: 1200,
      holdingsValueZAR: 221400,
      portfolioWeight: 2.1,
      isFeatured: false,
    },
    {
      id: "npn",
      name: "Naspers Ltd",
      ticker: "JSE: NPN",
      category: "Stocks",
      priceZAR: 3124.00,
      change24h: -0.85,
      change7d: -2.4,
      marketCapStr: "R 1.2T",
      volume24hStr: "R 3.2B",
      sparkline: [62, 58, 60, 55, 52, 50, 48],
      holdingsQty: 150,
      holdingsValueZAR: 468600,
      portfolioWeight: 4.4,
      isFeatured: false,
    },
    {
      id: "mtn",
      name: "MTN Group",
      ticker: "JSE: MTN",
      category: "Stocks",
      priceZAR: 86.20,
      change24h: -1.12,
      change7d: -3.5,
      marketCapStr: "R 162.8B",
      volume24hStr: "R 920M",
      sparkline: [58, 55, 52, 50, 48, 46, 44],
      holdingsQty: 2500,
      holdingsValueZAR: 215500,
      portfolioWeight: 2.0,
      isFeatured: false,
    },
    {
      id: "cyber-ape-823",
      name: "Cyber Ape #823",
      ticker: "NFT Collection",
      category: "NFTs",
      priceZAR: 98000.00,
      change24h: 45.2,
      change7d: 120.5,
      marketCapStr: "R 2.4M",
      volume24hStr: "R 480K",
      sparkline: [15, 18, 25, 32, 48, 62, 85],
      holdingsQty: 3,
      holdingsValueZAR: 294000,
      portfolioWeight: 2.7,
      rarity: "Legendary",
      isFeatured: false,
    },
    {
      id: "eur-zar",
      name: "EUR/ZAR",
      ticker: "Forex Pair",
      category: "Forex",
      priceZAR: 20.42,
      change24h: -0.35,
      change7d: 0.8,
      marketCapStr: "-",
      volume24hStr: "R 1.4T",
      sparkline: [50, 52, 48, 50, 49, 51, 50],
      holdingsQty: 45000,
      holdingsValueZAR: 918900,
      portfolioWeight: 2.6,
      isFeatured: false,
    },
  ];
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  return {
    totalValueZAR: 10744128,
    change24hPercent: 3.84,
    change24hZAR: 412560,
    totalAssets: 10,
    bestPerformer: { name: "Cyber Ape #823", change: 45.2 },
    worstPerformer: { name: "USD/ZAR", change: -2.1 },
    categoryBreakdown: [
      { category: "Crypto", weight: 40.1, color: "#F7931A" },
      { category: "Forex", weight: 24.6, color: "#3B82F6" },
      { category: "Commodities", weight: 14.3, color: "#D4A853" },
      { category: "Hedge", weight: 9.8, color: "#8B5CF6" },
      { category: "Stocks", weight: 8.5, color: "#10B981" },
      { category: "NFTs", weight: 2.7, color: "#EC4899" },
    ],
  };
}
