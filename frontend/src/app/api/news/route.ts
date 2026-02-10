import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.APIFY_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'APIFY_API_KEY not configured' }, { status: 500 });
    }

    try {
        const url = `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${apiKey}`;
        const payload = {
            queries: "Finance Investing Stock Market Crypto news",
            resultsPerPage: 10,
            maxPagesPerQuery: 1,
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error('Apify error:', res.status, res.statusText);
            return NextResponse.json([], { status: 200 }); // Return empty array, don't crash
        }

        const data = await res.json();

        const newsItems: Array<{
            title: string;
            link: string;
            source: string;
            published_at: string;
        }> = [];

        for (const page of data) {
            const results = page.organicResults || [];
            for (const item of results) {
                newsItems.push({
                    title: item.title || '',
                    link: item.url || '',
                    source: 'Google Search',
                    published_at: item.date || 'Just Now',
                });
            }
        }

        return NextResponse.json(newsItems.slice(0, 10));
    } catch (error) {
        console.error('News fetch error:', error);
        return NextResponse.json([], { status: 200 });
    }
}
