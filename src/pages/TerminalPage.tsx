import React from 'react';
import Layout from '@/components/layout/Layout';

const NEWS_CARDS = [
	{
		title: 'HPE OneView For VMware VCenter Allows Escalation Of...',
		author: 'Kaaviya',
		date: 'June 26, 2025',
		category: 'Cyber Security',
		link: '#',
		image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
	},
	{
		title: 'MongoDB Server Pre-Authentication Vulnerability Let Attackers Trigger DoS...',
		author: 'Kaaviya',
		date: 'June 27, 2025',
		category: 'Cyber Security',
		link: '#',
		image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
	},
	{
		title: '2,000+ Devices Hacked Using Weaponized Social Security Statement...',
		author: 'Tushar Subhra Dutta',
		date: 'June 24, 2025',
		category: 'Cyber Security News',
		link: '#',
		image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
	},
	{
		title: 'Cybercriminals Leveraging CapCut Popularity To Harvest Apple ID...',
		author: 'Tushar Subhra Dutta',
		date: 'June 27, 2025',
		category: 'Cyber Security News',
		link: '#',
		image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
	},
];

const NAV_LINKS = [
	'Home',
	'Threats',
	'Cyberattack News',
	'Vulnerability',
	'Zero-Day',
	'Data Breaches',
	'Cyber AI',
	'What Is',
	'Top 10',
];

const BREAKING_HEADLINE =
	'Pakistani Actors Built 300+ Cracking Websites Used to Deliver Info-Stealer Malware';

// News section internal navigation pane
const NewsSectionNav = () => (
	<nav className="w-full bg-white border-b border-blue-200 flex justify-center items-center py-2 gap-8 sticky top-0 z-20 shadow-sm">
		<a href="/news" className="text-blue-700 font-semibold hover:underline">
			Main News
		</a>
		<a href="/news/sub" className="text-blue-700 font-semibold hover:underline">
			News Details
		</a>
		<a href="/news/publish" className="text-blue-700 font-semibold hover:underline">
			Publish News
		</a>
	</nav>
);

const NewsPage: React.FC = () => {
	return (
		<Layout>
			{/* News section navigation pane below title */}
			<NewsSectionNav />
			<div className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 text-white text-center py-3 text-xl font-semibold tracking-wide shadow-inner animate-pulse">
				{BREAKING_HEADLINE}
			</div>
			<main className="container mx-auto py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
					{NEWS_CARDS.map((news, idx) => (
						<div
							key={idx}
							className="relative rounded-2xl overflow-hidden shadow-2xl group bg-gradient-to-br from-gray-900 to-blue-950 border border-blue-800 hover:scale-105 transition-transform duration-300"
							style={{ minHeight: 370 }}
						>
							<img
								src={news.image}
								alt={news.title}
								className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70"
								style={{ minHeight: 370, maxHeight: 370 }}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-6">
								<span className="inline-block bg-blue-800 text-white text-xs px-3 py-1 rounded-full mb-3 font-semibold shadow">
									{news.category}
								</span>
								<h2 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow">
									{news.title}
								</h2>
								<div className="flex items-center gap-2 text-blue-200 text-xs mb-2">
									<span className="font-semibold">{news.author}</span>
									<span>-</span>
									<span>{news.date}</span>
								</div>
								<a
									href={news.link}
									className="text-blue-300 hover:underline text-sm mt-2 font-semibold"
									target="_blank"
									rel="noopener noreferrer"
								>
									Read More
								</a>
							</div>
						</div>
					))}
				</div>
			</main>
		</Layout>
	);
};

export default NewsPage;
