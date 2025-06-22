import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json(); // Get the messages from the incoming request
    const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n'); // Format the prompt

    // Send the formatted prompt to Hugging Face API
    const response = await fetch('https://mirxakamran893-LOGIQCURVECHATIQBOT.hf.space/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,  // Send the message to Hugging Face Space API
        history: [],
      }),
    });

    const data = await response.json();  // Parse the response from Hugging Face API

    // Return the response containing dynamic questions and generated code
    return NextResponse.json({
      questions: data.questions || ['What framework do you want to use for this project?', 'Do you want to add any database integration?', 'Should the UI be responsive?'],
      code: data.code || 'Generated code based on the answers provided.',
    });
  } catch (error) {
    console.error('Error in API Route:', error);
    return NextResponse.json({ error: 'Error generating response' }, { status: 500 });
  }
}
