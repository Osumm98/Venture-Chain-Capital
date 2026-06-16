"use server";

import Parser from "rss-parser";

export interface NewsArticle {
  readonly title: string;
  readonly link: string;
  readonly pubDate: string;
  readonly source: string;
  readonly category: string;
  readonly imageUrl?: string;
}

const parser = new Parser({
  customFields: {
    item: [
      ["source", "sourceName", { keepArray: false }],
    ],
  },
});

const CATEGORY_IMAGES: Record<string, string[]> = {
  crypto: [
    "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605792657360-d5845cb640da?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop"
  ],
  stocks: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579226905180-636b76d96082?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop"
  ],
  ai: [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1684369175836-e41c4df19934?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1655393001768-d946c98d6c15?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1676401083984-5f4c54095873?q=80&w=800&auto=format&fit=crop"
  ],
  commodities: [
    "https://images.unsplash.com/photo-1612015560170-13f63dd73722?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583091761611-392da27f5fa3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518544801976-3e159e50e5ce?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624628659132-446bdc8acbd4?q=80&w=800&auto=format&fit=crop"
  ],
  forex: [
    "https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1612010167102-d1e8f83833e1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1640161704729-cbe966a08476?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591526017254-8c888ce058df?q=80&w=800&auto=format&fit=crop"
  ],
  default: [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516245834210-c4c142787335?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop"
  ]
};

function getPremiumImageForArticle(category: string, title: string): string {
  // Simple deterministic hash function based on title string
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const key = category.toLowerCase();
  const images = CATEGORY_IMAGES[key] || CATEGORY_IMAGES.default;
  return images[hash % images.length];
}

export async function fetchNews(category: string): Promise<ReadonlyArray<NewsArticle>> {
  try {
    let query = "";
    switch (category.toLowerCase()) {
      case "crypto":
        query = "crypto OR blockchain OR bitcoin OR ethereum";
        break;
      case "stocks":
        query = "stock market OR equities OR wall street OR S&P 500";
        break;
      case "ai":
        query = "artificial intelligence OR generative ai OR machine learning tech";
        break;
      case "commodities":
        query = "gold OR oil OR commodities OR raw materials market";
        break;
      case "forex":
        query = "forex OR foreign exchange OR currency trading OR USD/EUR";
        break;
      default:
        query = "finance OR investment OR economy";
    }

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
      query
    )}&hl=en-US&gl=US&ceid=US:en`;

    const feed = await parser.parseURL(url);

    if (!feed || !feed.items) {
      return [];
    }

    // Map to our generic NewsArticle type
    // Increase to 20 to ensure we have at least 5 valid articles
    const articles = feed.items.slice(0, 20).map((item) => {
      // Google News title format is usually "Headline - Source"
      let cleanTitle = item.title || "";
      let source = (item as any).sourceName || "Google News";

      if (cleanTitle.includes(" - ")) {
        const parts = cleanTitle.split(" - ");
        if (parts.length > 1) {
          const possibleSource = parts.pop()?.trim();
          if (possibleSource && !source) {
            source = possibleSource;
          }
          cleanTitle = parts.join(" - ").trim();
        }
      }

      return {
        title: cleanTitle,
        link: item.link || "",
        pubDate: item.pubDate || new Date().toISOString(),
        source: source,
        category: category,
        imageUrl: getPremiumImageForArticle(category, cleanTitle),
      };
    });

    return articles;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}
