import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `You are an advanced AI Financial Expert and Proprietary Trader named 'MarketMind'.
Your capabilities include deep technical analysis, quantitative modeling, and behavioral finance analysis.

Core Directives:
1. Analyze with Precision: dissect market data and news for second and third-order effects.
2. Think in Probabilities: provide risk/reward assessments.
3. Behavioral Analysis: Identify market sentiment (Fear/Greed) and potential traps.
4. Provide a 'Sentiment Score' (-10 to +10) and 'Conviction Level' (Low, Medium, High).

Tone: Professional, concise, objective. Use financial terminology correctly.`;

export async function POST(request: Request) {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ reply: 'AI service not configured.' }, { status: 500 });
    }

    try {
        const { message } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ reply: 'Invalid message.' }, { status: 400 });
        }

        // Call Gemini API directly via REST
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                    contents: [{ parts: [{ text: message }] }],
                    generationConfig: {
                        temperature: 0.4,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!res.ok) {
            const errText = await res.text();
            console.error('Gemini API error:', res.status, errText);
            return NextResponse.json({ reply: 'AI analysis temporarily unavailable.' }, { status: 200 });
        }

        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ reply: 'System Error. Please try again.' }, { status: 500 });
    }
}
