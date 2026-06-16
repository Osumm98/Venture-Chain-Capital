"use server";

import Parser from "rss-parser";

export interface NewsArticle {
  readonly title: string;
  readonly link: string;
  readonly pubDate: string;
  readonly source: string;
  readonly category: string;
}

const parser = new Parser({
  customFields: {
    item: [
      ["source", "sourceName", { keepArray: false }],
    ],
  },
});

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
    const articles = feed.items.slice(0, 15).map((item) => {
      // Google News title format is usually "Headline - Source"
      // We can try to extract the source cleanly if needed, but we also have item.sourceName
      let cleanTitle = item.title || "";
      let source = (item as any).sourceName || "Google News";

      if (cleanTitle.includes(" - ")) {
        const parts = cleanTitle.split(" - ");
        // Ensure we don't accidentally cut off the actual title if it has a hyphen
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
      };
    });

    return articles;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}
