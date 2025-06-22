'use client'

import { useState } from 'react';
import { useChat } from 'ai/react'; // Import the useChat hook for managing chat messages
import { saveAs } from 'file-saver'; // For downloading zip files
import JSZip from 'jszip'; // Library to create zip files

export default function CodeGenerationPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [theme, setTheme] = useState('light');  // Set the theme to 'light' for a white theme
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Handle the screenshot upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) setScreenshot(file);
  };

  // Update the prompt
  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  // Connect to the backend API
  const handleStartBuilding = async () => {
    setIsProcessing(true);
    
    try {
      // Call your backend API here to process the prompt and screenshot
      // Example: Send prompt and screenshot (as FormData)
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (screenshot) formData.append('screenshot', screenshot);

      const response = await fetch('https://mirxakamran893-LOGIQCURVECHATIQBOT.hf.space/chat', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions from backend');
      }

      const data = await response.json();
      
      // Process the response from backend to ask questions
      setQuestions(data.questions); // Example response containing questions
      setIsProcessing(false);
    } catch (error) {
      console.error('Error connecting to backend:', error);
      setIsProcessing(false);
    }
  };

  // Handle question answers
  const handleAnswerChange = (index: number, answer: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = answer;
    setAnswers(updatedAnswers);
  };

  // Generate code after questions have been answered
  const generateCode = async () => {
    if (!answers.length) return;

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
    <div className={`flex flex-col h-screen w-full max-w-screen overflow-hidden ${theme === 'light' ? 'bg-white text-black' : 'bg-gradient-to-b from-gray-200 to-gray-300 text-black'}`}>
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-opacity-80 backdrop-blur-lg border-b border-gray-700">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold truncate flex items-center">
            Code Generator - LOGIQ CURVE LLC
          </h2>
        </div>
      </div>

      {/* Instructions / Input */}
      <div className="p-6">
        <h3 className="text-lg font-medium">Please provide a prompt and upload a screenshot for code generation:</h3>

        {/* Large Text Area for the Prompt */}
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          className="mt-4 p-4 w-full h-40 border rounded-md bg-gray-100"
          placeholder="Describe the UI screen you want to create..."
        />

        {/* Screenshot Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-4 p-2 bg-gray-100 border rounded-md"
        />

        {/* Start Building Button */}
        <button
          onClick={handleStartBuilding}
          className="mt-4 p-2 bg-blue-500 text-white rounded-md"
        >
          {isProcessing ? 'Processing...' : 'Start Building'}
        </button>

        {/* Questions Section */}
        {questions.length > 0 && !isProcessing && (
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
        )}

        {/* Code Generation */}
        {questionsAnswered && !isProcessing && (
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
