'use client'

import { useState } from 'react';

export default function DeSaaSPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [building, setBuilding] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Handle input changes for prompt
  const handleInputChangeWithPrompt = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Function to start building code (makes API call to /api/chat)
  const startBuilding = async () => {
    setBuilding(true);

    // Prepare the request data
    const formData = new FormData();
    if (image) formData.append('image', image);
    formData.append('messages', JSON.stringify([{ role: 'user', content: input }])); // Add user input (prompt)

    try {
      const response = await fetch('/api/chat', {  // Correct API endpoint
        method: 'POST',
        body: formData,  // Send FormData to backend
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);  // Get dynamic questions returned from Hugging Face
      } else {
        console.error('Failed to fetch questions', await response.text());
      }
    } catch (error: unknown) {
      // Type the error as an instance of Error to access .message
      if (error instanceof Error) {
        console.error('Request failed:', error.message);  // Log error for debugging
      } else {
        console.error('Request failed with unknown error:', error);
      }
    }
  };

  // Handle answer change for questions
  const handleAnswerChange = (index: number, answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = answer;
    setAnswers(updatedAnswers);
  };

  // Generate code based on answers
  const generateCode = async () => {
    try {
      const response = await fetch('/api/chat', {  // Correct endpoint to interact with route.ts
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),  // Send answers to backend
      });

      if (response.ok) {
        const data = await response.json();
        setCode(data.code || 'No code generated');
      } else {
        console.error('Failed to generate code');
      }
    } catch (error: unknown) {
      // Type the error as an instance of Error to access .message
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className={`flex flex-col h-screen w-full max-w-screen overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-b from-gray-800 to-gray-900 text-white' : 'bg-gradient-to-b from-gray-200 to-gray-300 text-black'}`}>
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-opacity-80 backdrop-blur-lg border-b border-gray-700">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold truncate flex items-center">
            LOGIQ CURVE LLC
          </h2>
          {/* Theme Toggle Switch */}
          <label htmlFor="theme-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="theme-toggle"
                className="hidden"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <div className="w-12 h-6 bg-gray-300 rounded-full shadow-inner"></div>
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'transform translate-x-6' : ''}`}
              ></div>
            </div>
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* UI description and screenshot upload */}
          {!building ? (
            <>
              <div>
                <label htmlFor="prompt" className="block text-lg font-medium">Write a Prompt</label>
                <input
                  id="prompt"
                  type="text"
                  placeholder="Describe the UI screen you want to create..."
                  className="mt-2 p-2 w-full rounded-md border border-gray-300"
                  value={input}
                  onChange={handleInputChangeWithPrompt}
                />
              </div>

              <div className="mt-4">
                <label htmlFor="image-upload" className="block text-lg font-medium">Upload UI Screenshot</label>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="mt-2"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mt-4">
                <button
                  onClick={startBuilding}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Start Building
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Display Dynamic Questions for Building */}
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-md shadow">
                    <label className="block text-lg font-medium">{question}</label>
                    <input
                      type="text"
                      className="mt-2 p-2 w-full rounded-md border border-gray-300"
                      placeholder="Your answer..."
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Button to generate code */}
              <div className="mt-4">
                <button
                  onClick={generateCode}
                  className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Generate Code
                </button>
              </div>

              {/* Display Generated Code */}
              {code && (
                <div className="mt-4">
                  <textarea
                    readOnly
                    className="w-full p-4 bg-gray-800 text-white rounded-md border border-gray-600"
                    value={code}
                    rows={10}
                  />
                  <button
                    onClick={() => {
                      const blob = new Blob([code], { type: 'text/plain' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = 'generated_code.txt';
                      link.click();
                    }}
                    className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Download Code
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
