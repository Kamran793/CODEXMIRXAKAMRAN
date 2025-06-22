import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json(); // Parse the incoming JSON data
    const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n'); // Process the prompt

    // Make a request to Hugging Face Space API
    const response = await fetch('https://mirxakamran893-LOGIQCURVECHATIQBOT.hf.space/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,  // Send the message to Hugging Face Space API
        history: [],       // Optional: send any previous conversation history
      }),
    });

    const data = await response.json(); // Parse the response from Hugging Face API

    // Return dynamic questions and generated code to the frontend
    return NextResponse.json({
      questions: data.questions || ['What framework do you want to use for this project?', 'Do you want to add any database integration?', 'Should the UI be responsive?'],
      code: data.code || 'Generated code based on the answers provided.',
    });
  } catch (error) {
    console.error('Error in API Route:', error);
    return NextResponse.json({ error: 'Error generating response' }, { status: 500 });
  }
}
