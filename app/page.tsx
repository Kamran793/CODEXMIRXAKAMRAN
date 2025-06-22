'use client'

import { useState } from 'react';

export default function DeSaaSPage() {
  const [theme, setTheme] = useState('dark');
  const [input, setInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [building, setBuilding] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [code, setCode] = useState('');

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Handle input changes for description and prompt
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Function to simulate 'Start Building' button functionality
  const startBuilding = () => {
    setBuilding(true);

    // Add your logic to ask questions or generate code here
    // For demo, we're adding a static question and simulated code generation
    setQuestions([
      'What framework do you want to use for this project?',
      'Do you want to add any database integration?',
      'Should the UI be responsive?',
    ]);

    setCode('Generated code for the project...');
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
                  onChange={handleInputChange}
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
              {/* Display Questions for Building */}
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-md shadow">
                    <label className="block text-lg font-medium">{question}</label>
                    <input
                      type="text"
                      className="mt-2 p-2 w-full rounded-md border border-gray-300"
                      placeholder="Your answer..."
                    />
                  </div>
                ))}
              </div>

              {/* Display Code */}
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
                  className="mt-4 w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Download Code
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
