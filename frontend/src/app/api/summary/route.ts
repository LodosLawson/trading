import { NextResponse } from 'next/server';

export async function GET() {
    const googleKey = process.env.GOOGLE_API_KEY;
    const apifyKey = process.env.APIFY_API_KEY;

    if (!googleKey || !apifyKey) {
        return NextResponse.json(
            { sentiment: 'Neutral', signal: 'Wait', takeaways: ['API keys not configured.'] },
            { status: 200 }
        );
    }

    try {
        // Step 1: Fetch news headlines
        const newsUrl = `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token=${apifyKey}`;
        const newsRes = await fetch(newsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                queries: "Finance Stock Market Crypto news",
                resultsPerPage: 5,
                maxPagesPerQuery: 1,
            }),
        });

        let headlines: string[] = [];
        if (newsRes.ok) {
            const newsData = await newsRes.json();
            for (const page of newsData) {
                const results = page.organicResults || [];
                for (const item of results) {
                    if (item.title) headlines.push(item.title);
                }
            }
        }

        if (headlines.length === 0) {
            return NextResponse.json(
                { sentiment: 'Neutral', signal: 'Wait', takeaways: ['No headlines available for analysis.'] },
                { status: 200 }
            );
        }

        // Step 2: Summarize with Gemini
        const prompt = `As 'MarketMind', analyze these recent headlines and provide a market summary:
Headlines: ${JSON.stringify(headlines.slice(0, 10))}

Output valid JSON only:
- "sentiment": "Bullish" | "Bearish" | "Neutral" | "Volatile"
- "signal": "Buy Dip" | "Sell Rallies" | "Hold" | "Wait"
- "takeaways": (List of 3 short, punchy bullet points summarizing the key market drivers)`;

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
                }),
            }
        );

        if (!geminiRes.ok) {
            return NextResponse.json(
                { sentiment: 'Unknown', signal: 'Caution', takeaways: ['AI summary generation failed.'] },
                { status: 200 }
            );
        }

        const geminiData = await geminiRes.json();
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const summary = JSON.parse(cleanedText);

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Summary error:', error);
        return NextResponse.json(
            { sentiment: 'Unknown', signal: 'Caution', takeaways: ['Summary generation error.'] },
            { status: 200 }
        );
    }
}
