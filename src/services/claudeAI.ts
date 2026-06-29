const API_URL = 'https://api.anthropic.com/v1/messages';

export interface AIMessage { role: 'user' | 'assistant'; content: string; }

export async function getDairyInsight(context: {
  collectorId: string; totalFarmers: number;
  todaysMilk: number; todaysAmount: number;
}, apiKey: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6', max_tokens: 200,
      system: 'You are MilkX AI for dairy collectors in India. Be concise (2-3 sentences). Use ₹ and L.',
      messages: [{ role: 'user', content: `Collector ${context.collectorId}: ${context.totalFarmers} farmers, ${context.todaysMilk}L today, ₹${context.todaysAmount} earned. Give a brief insight.` }],
    }),
  });
  if (!res.ok) throw new Error('AI unavailable');
  const data = await res.json();
  return data.content?.[0]?.text ?? 'Unable to generate insight.';
}

export async function chatWithMilkXAI(messages: AIMessage[], apiKey: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6', max_tokens: 500,
      system: 'You are MilkX AI. Help with milk quality (Fat%, SNF%), payments, and dairy questions. Be concise. Match the user language (Hindi/Punjabi/English).',
      messages,
    }),
  });
  if (!res.ok) throw new Error('AI unavailable');
  const data = await res.json();
  return data.content?.[0]?.text ?? "Couldn't process that. Try again.";
}
