'use client'

import { useState } from 'react';
import { useChat } from 'ai/react'; // Import the useChat hook for managing chat messages
import { saveAs } from 'file-saver'; // For downloading zip files
import JSZip from 'jszip'; // Library to create zip files

export default function CodeGenerationPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [theme, setTheme] = useState('dark');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState<boolean>(false);
  const [questions, setQuestions] = useState<string[]>(['What is the purpose of this code?', 'What language should be used?', 'Do you need any specific libraries?']);
  const [answers, setAnswers] = useState<string[]>([]);

  // Handle the screenshot upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) setScreenshot(file);
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Ask questions after the prompt
  const handleAnswerChange = (index: number, answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = answer;
    setAnswers(updatedAnswers);
  };

  // Simulate code generation based on answers
  const generateCode = async () => {
    if (!screenshot || answers.length === 0) return;

    const zip = new JSZip();
    const code = `Generated code based on answers: \n${answers.join('\n')}`;

    // Add code to the zip file
    zip.file("generated_code.txt", code);

    // If screenshot is uploaded, add it to the zip file
    if (screenshot) {
      zip.file("screenshot.png", screenshot);
    }

    // Generate the zip and prompt for download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "generated_code.zip");
  };

  return (
    <div className={`flex flex-col h-screen w-full max-w-screen overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-b from-gray-800 to-gray-900 text-white' : 'bg-gradient-to-b from-gray-200 to-gray-300 text-black'}`}>
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-opacity-80 backdrop-blur-lg border-b border-gray-700">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold truncate flex items-center">
            Code Generator - LOGIQ CURVE LLC
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

      {/* Instructions / Input */}
      <div className="p-6">
        <h3 className="text-lg font-medium">Please upload a screenshot and provide the details for code generation:</h3>
        
        {/* Screenshot Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-4 p-2 bg-gray-100 border rounded-md"
        />

        {/* Questions Section */}
        <div className="mt-6">
          {questions.map((question, index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm font-semibold">{question}</label>
              <input
                type="text"
                value={answers[index] || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="mt-2 p-2 bg-gray-100 border rounded-md w-full"
                placeholder="Your answer..."
              />
            </div>
          ))}
          <button
            onClick={() => setQuestionsAnswered(true)}
            className="mt-4 p-2 bg-blue-500 text-white rounded-md"
          >
            Answer Questions
          </button>
        </div>

        {/* Code Generation */}
        {questionsAnswered && (
          <button
            onClick={generateCode}
            className="mt-6 p-2 bg-green-500 text-white rounded-md"
          >
            Generate Code and Download
          </button>
        )}
      </div>
    </div>
  );
}
