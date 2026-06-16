import { Metadata } from "next";
import { fetchNews, NewsArticle } from "@/actions/news";
import { NewsDashboard } from "@/components/dashboard/news-dashboard";

export const metadata: Metadata = {
  title: "Markets News | Venture Chain Capital",
  description: "Real-time algorithmic aggregation of global financial events.",
};

// Revalidate this page every 15 minutes (900 seconds) so we don't spam the Google News RSS API,
// but keep news fresh enough.
export const revalidate = 900; 

export default async function NewsPage() {
  // Fetch news from multiple categories in parallel
  const [cryptoNews, stocksNews, aiNews] = await Promise.all([
    fetchNews("Crypto"),
    fetchNews("Stocks"),
    fetchNews("AI"),
  ]);

  // Combine and interleave or sort by date. 
  // For now, we just combine them. 
  // In a real scenario, we might want to interleave them or sort by pubDate.
  const allArticles: NewsArticle[] = [...cryptoNews, ...stocksNews, ...aiNews];
  
  // Sort by pubDate descending (newest first)
  allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return <NewsDashboard initialArticles={allArticles} />;
}
