import { NextResponse } from 'next/server';

interface CryptoNewsItem {
    title: string;
    body: string;
    url: string;
    source: string;
    published_at: string;
    currencies: Array<{ code: string; title: string }>;
}

export async function GET() {
    try {
        // CryptoPanic free API — no key needed for public posts
        // Alternative: use CoinGecko trending + news or CryptoCompare
        const res = await fetch(
            'https://cryptopanic.com/api/free/v1/posts/?auth_token=free&public=true&kind=news&filter=hot',
            { next: { revalidate: 120 } } // Cache 2 min
        );

        if (!res.ok) {
            // Fallback to CoinGecko trending as news source
            return await fallbackCoinGeckoNews();
        }

        const data = await res.json();
        const posts = data.results || [];

        const newsItems = posts.slice(0, 15).map((post: Record<string, unknown>) => {
            const currencies = (post.currencies as Array<{ code: string; title: string }>) || [];
            return {
                title: post.title || '',
                body: (post.body as string) || (post.title as string) || '',
                url: (post.url as string) || '',
                source: ((post.source as Record<string, string>)?.title) || 'CryptoPanic',
                published_at: post.published_at || new Date().toISOString(),
                currencies: currencies.map(c => ({ code: c.code, title: c.title })),
            };
        });

        return NextResponse.json(newsItems);
    } catch (error) {
        console.error('CryptoNews error:', error);
        return await fallbackCoinGeckoNews();
    }
}

async function fallbackCoinGeckoNews(): Promise<NextResponse> {
    try {
        // Use CoinGecko search/trending as a proxy for "news"
        const trendingRes = await fetch('https://api.coingecko.com/api/v3/search/trending');
        if (!trendingRes.ok) {
            return NextResponse.json([]);
        }
        const trending = await trendingRes.json();
        const coins = trending.coins || [];

        const newsItems = coins.slice(0, 10).map((item: Record<string, Record<string, unknown>>) => {
            const coin = item.item;
            return {
                title: `${coin.name} (${(coin.symbol as string || '').toUpperCase()}) is trending — Rank #${coin.market_cap_rank || '?'}`,
                body: `${coin.name} has entered the top trending coins on CoinGecko. Current market cap rank: #${coin.market_cap_rank || 'N/A'}. This is driven by a significant increase in search interest and trading volume.`,
                url: `https://www.coingecko.com/en/coins/${coin.id}`,
                source: 'CoinGecko Trending',
                published_at: new Date().toISOString(),
                currencies: [{ code: (coin.symbol as string || '').toUpperCase(), title: coin.name as string || '' }],
            };
        });

        return NextResponse.json(newsItems);
    } catch {
        return NextResponse.json([]);
    }
}
