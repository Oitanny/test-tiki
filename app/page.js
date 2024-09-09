'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import AIResponseText from './chatscreen/AIResponseText';

const GradientLoadingText = ({ messages }) => {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="text-center py-4">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text bg-300% animate-gradient">
        {messages[currentMessage]}
      </h3>
    </div>
  );
};

export default function Home() {
  const [context, setContext] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContextChange = (e) => {
    setContext(e.target.value);
  };

  const handleScreenshotsChange = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshots((prev) => [
          ...prev,
          {
            file,
            preview: URL.createObjectURL(file),
            base64: reader.result.split(',')[1],
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = useCallback((indexToRemove) => {
    setScreenshots((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleImageClick = (image) => {
    setExpandedImage(image);
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (screenshots.length === 0) {
      setError('Please upload at least one screenshot.');
      return;
    }

    if (context.trim() === '') {
      setError('Please provide some context for the test.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context,
          screenshots: screenshots.map((s) => s.base64),
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.success) {
        setResult(data.message);
      } else {
        setError('Error generating content: ' + data.message);
      }
    } catch (error) {
      setError('Error: ' + (error.message || 'Unexpected error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadingMessages = [
    "Brewing test cases...",
    "Summoning the QA spirits...",
    "Decoding the matrix of bugs...",
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col ">
      <header className="bg-gray-800 p-2 flex items-center">
        <Image src="/assets/logo.png" width={46} height={46} alt="Logo" unoptimized />
        <h1 className="text-xl font-bold">TestTiki</h1>
      </header>
      <main className="flex-grow p-4 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <p className="text-sm">Welcome! Please provide context and screenshots for your testing instructions.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <label htmlFor="context" className="block text-sm font-medium mb-2">
                Context (required)
              </label>
              <textarea
                id="context"
                value={context}
                onChange={handleContextChange}
                className="w-full bg-gray-700 text-gray-100 rounded-md border-gray-600 focus:ring-blue-500 focus:border-blue-500 p-3"
                rows="3"
                placeholder="Enter context for the test here..."
                required
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
              <label htmlFor="screenshots" className="block text-sm font-medium mb-2">
                Upload Screenshots (required)
              </label>
              <input
                type="file"
                id="screenshots"
                onChange={handleScreenshotsChange}
                multiple
                accept="image/*"
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500 file:text-white
                  hover:file:bg-blue-600"
                required
              />
            </div>
            {screenshots.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-sm font-medium mb-2">Selected Images</h3>
                <div className="max-h-40 overflow-y-auto pr-2">
                  <div className="grid grid-cols-3 gap-2">
                    {screenshots.map((screenshot, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => handleImageClick(screenshot)}>
                        <Image
                          src={screenshot.preview}
                          alt={`Preview ${index + 1}`}
                          width={100}
                          height={100}
                          className="object-cover rounded w-full h-24"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeScreenshot(index);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-500 text-white p-3 rounded-md">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={isLoading || screenshots.length === 0 || context.trim() === ''}
            >
              {isLoading ? 'Generating...' : 'Describe Testing Instructions'}
            </button>
          </form>
          
          {isLoading ? (
            <GradientLoadingText messages={loadingMessages} />
          ) : result && (
            <div className="bg-gray-800 p-4 mt-4 rounded-lg shadow-md">
             
              <AIResponseText result={result} />

            </div>
          )}
        </div>
      </main>

      {expandedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeExpandedImage}>
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={expandedImage.preview}
              alt="Expanded preview"
              layout="fill"
              objectFit="contain"
            />
            <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded">
              {expandedImage.file.name}
            </div>
            <button
              onClick={closeExpandedImage}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
              aria-label="Close expanded image"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}