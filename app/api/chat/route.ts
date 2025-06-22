export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');

  const response = await fetch('https://mirxakamran893-LOGIQCURVECHATIQBOT.hf.space/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: prompt,
      history: []
    })
  });

  const data = await response.json(); // parse JSON instead of text

  return new Response(
    JSON.stringify({
      role: 'assistant',
      content: data.response || 'No response'
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
