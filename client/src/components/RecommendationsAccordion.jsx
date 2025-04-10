import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

function RecommendationsAccordion({ condition, recommendations }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  return (
    <div className="bg-gray-800 rounded-lg shadow-md">
      {/* Dark background */}
      <button
        onClick={toggleAccordion}
        className="w-full text-lg font-semibold text-left bg-gray-700 p-4 rounded-t-lg hover:bg-gray-600 focus:outline-none text-white flex items-center justify-between"
        // Darker button
      >
        {condition}
        <span className="inline-block ml-2">
          {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
        </span>
      </button>

      {isOpen && (
        <div className="bg-gray-900 p-4 rounded-b-lg">
          {/* Darker content area */}
          <ul>
            {recommendations.map((item, index) => (
              <li key={index} className="flex items-center py-2 border-b border-gray-700 last:border-b-0">
                {/* Darker border */}
                <img src={item.product_image} alt={item.product_name} className="w-16 h-16 mr-4 rounded-md object-cover" />
                <a href={item.product_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {/* Blue link */}
                  {item.product_name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RecommendationsAccordion;