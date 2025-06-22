import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json(); // Get messages (user prompt) from the frontend
    const prompt = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n'); // Format the prompt

    // Send request to Hugging Face API
    const response = await fetch('https://mirxakamran893-LOGIQCURVECHATIQBOT.hf.space/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt, // Send the formatted prompt to Hugging Face
        history: [],
      }),
    });

    // If the response is successful, extract and return the data
    const data = await response.json();  // Get the response from Hugging Face API

    // Return dynamic questions and code back to frontend
    return NextResponse.json({
      questions: data.questions || ['What framework do you want to use?', 'Do you want to add any database?', 'Should the UI be responsive?'],
      code: data.code || 'Generated code based on the answers provided.',
    });
  } catch (error) {
    console.error('Error in API Route:', error);
    return NextResponse.json({ error: 'Error generating response' }, { status: 500 });
  }
}
