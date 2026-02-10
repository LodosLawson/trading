import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get('id') || 'bitcoin';
    const days = searchParams.get('days') || '1';
    const type = searchParams.get('type') || 'line'; // 'line' or 'ohlc'

    try {
        let url: string;
        if (type === 'ohlc') {
            url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;
        } else {
            url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
        }

        const res = await fetch(url, { next: { revalidate: 60 } });

        if (!res.ok) {
            return NextResponse.json({ error: 'CoinGecko API error' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chart data error:', error);
        return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
    }
}
