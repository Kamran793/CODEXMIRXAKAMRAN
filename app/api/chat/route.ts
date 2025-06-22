import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Process the prompt from the messages
  const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');

  // Send a POST request to the Hugging Face API
  const response = await fetch('https://mirxakamran893-LOGIQCURVECHATIQBOT.hf.space/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: prompt,
      history: [],
    }),
  });

  // Wait for the Hugging Face API response
  const data = await response.json();

  // Return the questions and generated code
  return NextResponse.json({
    questions: data.questions || ['What framework do you want to use for this project?', 'Do you want to add any database integration?', 'Should the UI be responsive?'],
    code: data.code || 'Generated code based on the answers provided.',
  });
}
