'use client'

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react' // Import the useChat hook for managing chat messages
import { saveAs } from 'file-saver' // For downloading zip files
import JSZip from 'jszip' // Library to create zip files

export default function CodeGenerationPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [displayedText, setDisplayedText] = useState('')
  const [typingIndex, setTypingIndex] = useState(0)
  const [theme, setTheme] = useState('light') // Light theme by default
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [questionsAnswered, setQuestionsAnswered] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // Get the latest assistant message
  const latestAIMessage = messages
    .filter((m) => m.role === 'assistant')
    .slice(-1)[0]

  // Typing animation for assistant's message
  useEffect(() => {
    if (!latestAIMessage) return

    let content = latestAIMessage.content
    try {
      const parsed = JSON.parse(latestAIMessage.content)
      if (parsed && parsed.content) content = parsed.content
    } catch {}

    setDisplayedText('')
    setTypingIndex(0)

    let i = 0
    const interval = setInterval(() => {
      setDisplayedText(content.slice(0, i))
      i++
      setTypingIndex(i)
      if (i > content.length) clearInterval(interval)
    }, 20)

    return () => clearInterval(interval)
  }, [latestAIMessage?.id])

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  // Handle screenshot upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) setScreenshot(file)
  }

  // Update the prompt
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
  }

  // Call the backend API to process the prompt and screenshot
  const handleStartBuilding = async () => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      if (screenshot) formData.append('screenshot', screenshot)

      const response = await fetch('https://mirxakamran893-LOGIQCURVECHATIQBOT.hf.space/chat', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to fetch questions from backend')
      }

      const data = await response.json()

      if (data?.questions) {
        setQuestions(data.questions)
      } else {
        console.error('Unexpected response format:', data)
      }

      setIsProcessing(false)
    } catch (error) {
      console.error('Error during API request:', error)
      setIsProcessing(false)
    }
  }

  // Handle question answers
  const handleAnswerChange = (index: number, answer: string) => {
    const updatedAnswers = [...answers]
    updatedAnswers[index] = answer
    setAnswers(updatedAnswers)
  }

  // Generate code after questions have been answered
  const generateCode = async () => {
    if (!answers.length) return

    const zip = new JSZip()
    const code = `Generated code based on answers: \n${answers.join('\n')}`

    // Add the generated code to the zip file
    zip.file('generated_code.txt', code)

    // If screenshot is uploaded, add it to the zip file
    if (screenshot) {
      zip.file('screenshot.png', screenshot)
    }

    // Generate the zip and prompt for download
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'generated_code.zip')
  }

  return (
    <div
      className={`flex flex-col h-screen w-full max-w-screen overflow-hidden ${
        theme === 'light' ? 'bg-white text-black' : 'bg-gradient-to-b from-gray-200 to-gray-300 text-black'
      }`}
    >
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
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                  theme === 'dark' ? 'transform translate-x-6' : ''
                }`}
              ></div>
            </div>
          </label>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-150px)]">
        <div className="flex flex-col space-y-4">
          {messages.map((m) => {
            let content = m.content
            try {
              const parsed = JSON.parse(m.content)
              if (parsed && parsed.content) content = parsed.content
            } catch {}

            const isLastAI = m.role === 'assistant' && m.id === latestAIMessage?.id

            return (
              <div key={m.id} className="flex">
                <div
                  className={`p-4 rounded-2xl break-words w-fit max-w-[85%] sm:max-w-[80%] ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white self-end ml-auto'
                      : 'bg-gradient-to-br from-amber-200 via-violet-600 to-sky-900 text-white self-start mr-auto'
                  }`}
                >
                  <span className="font-medium">{m.role === 'user' ? 'You' : 'AI'}:</span>{' '}
                  {isLastAI ? (
                    <span>
                      {displayedText}
                      <span className="animate-pulse">▍</span>
                    </span>
                  ) : (
                    <span>{content}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center px-3 py-2 bg-gray-800 border-t border-gray-700 space-x-2"
      >
        <input
          className={`flex-1 px-3 py-2 text-sm sm:text-base ${
            theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-black placeholder-gray-600'
          } border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'} rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500`}
          type="text"
          placeholder="Say something..."
          value={input}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="p-2 text-blue-400 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}
