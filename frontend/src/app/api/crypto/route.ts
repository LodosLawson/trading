import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vs_currency = searchParams.get('vs_currency') || 'usd';
    const per_page = searchParams.get('per_page') || '100';

    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&order=market_cap_desc&per_page=${per_page}&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
            { next: { revalidate: 30 } } // Cache for 30 seconds
        );

        if (!res.ok) {
            return NextResponse.json({ error: 'CoinGecko API error' }, { status: res.status });
        }

        const data = await res.json();

        const coins = data.map((coin: Record<string, unknown>) => ({
            id: coin.id,
            symbol: (coin.symbol as string || '').toUpperCase(),
            name: coin.name,
            image: coin.image,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            market_cap_rank: coin.market_cap_rank,
            total_volume: coin.total_volume,
            price_change_24h: coin.price_change_24h,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            price_change_percentage_1h: coin.price_change_percentage_1h_in_currency,
            price_change_percentage_7d: coin.price_change_percentage_7d_in_currency,
            circulating_supply: coin.circulating_supply,
            total_supply: coin.total_supply,
            ath: coin.ath,
            ath_change_percentage: coin.ath_change_percentage,
            sparkline_7d: (coin.sparkline_in_7d as Record<string, unknown>)?.price || [],
            last_updated: coin.last_updated,
        }));

        return NextResponse.json(coins);
    } catch (error) {
        console.error('CoinGecko fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch crypto prices' }, { status: 500 });
    }
}
