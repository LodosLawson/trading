import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
        return NextResponse.json([]);
    }

    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`,
            { next: { revalidate: 300 } }
        );

        if (!res.ok) {
            return NextResponse.json([]);
        }

        const data = await res.json();
        const coins = (data.coins || []).slice(0, 10).map((c: Record<string, unknown>) => ({
            id: c.id,
            name: c.name,
            symbol: (c.symbol as string || '').toUpperCase(),
            thumb: c.thumb,
            market_cap_rank: c.market_cap_rank,
        }));

        return NextResponse.json(coins);
    } catch {
        return NextResponse.json([]);
    }
}
