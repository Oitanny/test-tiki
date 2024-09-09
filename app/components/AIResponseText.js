import React from 'react';
import parse from 'html-react-parser';
import Image from 'next/image';

// Function to format the response text into HTML
const formatResponse = (text) => {
  return text
  .replace(/(\*\*Test Case \d+:\*\*)/g, '<h5 class="text-lg font-bold mt-4">$1</h5>') // Heading for Test Case
  .replace(/(\*\*)([^*]+?)(\*\*)/g, '<strong>$2</strong>') // Bold text
  .replace(/^\d+\.\s+/gm, '<br/><span class="ml-4">$&</span>') // Numbered list items
  .replace(/^[-*+]\s+/gm, '<br/><span class="ml-4">$&</span>') // Bulleted list items
  .replace(/\n/g, '<br/>') // Convert new lines into <br> for HTML
  .replace(/<br\/>\s*$/, ''); // Remove trailing <br> if it is at the end
};

const AiResponseDisplay = ({ result }) => {
  return (
    <div className="bg-gray-800 p-4 mt-4 rounded-lg shadow-md">
      <div className="p-2">
        <Image src="/assets/avatar.png" width={40} height={40} />
      </div>
      <div className="text-white">
        {result && parse(formatResponse(result))}
      </div>
    </div>
  );
};

export default AiResponseDisplay;
