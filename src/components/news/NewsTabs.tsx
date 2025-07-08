import React from 'react';

interface NewsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { label: 'Main News', value: 'main' },
  { label: 'News Details', value: 'details' },
  { label: 'Publish News', value: 'publish' },
];

const NewsTabs: React.FC<NewsTabsProps> = ({ activeTab, onTabChange }) => (
  <nav className="w-full flex justify-center items-center gap-8 py-3 bg-blue-900/80 shadow">
    {tabs.map(tab => (
      <button
        key={tab.value}
        className={`relative px-4 py-2 text-white font-bold rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition
          ${activeTab === tab.value
            ? 'after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-3/4 after:h-1 after:rounded-full after:bg-gradient-to-r after:from-blue-500 after:via-violet-500 after:to-purple-500 after:blur-sm after:animate-pulse border-b-4 border-blue-500'
            : 'hover:text-blue-300'}
        `}
        onClick={() => onTabChange(tab.value)}
        tabIndex={0}
        aria-current={activeTab === tab.value ? 'page' : undefined}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);

export default NewsTabs;
