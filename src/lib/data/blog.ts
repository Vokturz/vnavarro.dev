export interface BlogPost {
	id: string;
	title: string;
	excerpt: string;
	content: string;
	date: string;
	tags: string[];
	slug: string;
}

export const blogPosts: BlogPost[] = [
	{
		id: '1',
		title: 'Getting Started with SvelteKit and Svelte 5',
		excerpt: 'Exploring the new features and improvements in Svelte 5 and how to build modern web applications with SvelteKit.',
		content: 'SvelteKit with Svelte 5 brings exciting new features like runes, improved reactivity, and better TypeScript support...',
		date: '2024-01-15',
		tags: ['svelte', 'web-development', 'javascript'],
		slug: 'getting-started-sveltekit-svelte5'
	},
	{
		id: '2',
		title: 'Building AI-Powered Applications',
		excerpt: 'My experience working as an AI Engineer and the lessons learned while building production AI systems.',
		content: 'Working at Judini Inc. (CodeGPT) has given me incredible insights into building AI-powered applications at scale...',
		date: '2024-01-10',
		tags: ['ai', 'machine-learning', 'engineering'],
		slug: 'building-ai-powered-applications'
	},
	{
		id: '3',
		title: 'Data Science in the Real World',
		excerpt: 'Practical insights from implementing data science solutions in various industries and academic research.',
		content: 'During my time at the Data Science Institute, I worked on fascinating projects that bridged academic research with real-world applications...',
		date: '2024-01-05',
		tags: ['data-science', 'research', 'python'],
		slug: 'data-science-real-world'
	},
	{
		id: '4',
		title: 'From Astronomy to Software Engineering',
		excerpt: 'My journey transitioning from a Master in Astronomy to becoming a Software Engineer and AI specialist.',
		content: 'The transition from studying the cosmos to building software systems taught me valuable lessons about problem-solving and analytical thinking...',
		date: '2023-12-28',
		tags: ['career', 'astronomy', 'software-engineering'],
		slug: 'astronomy-to-software-engineering'
	},
	{
		id: '5',
		title: 'Understanding Human Behavior Through Data',
		excerpt: 'How mobile XDR data analysis reveals patterns in human behavior and mobility during challenging times.',
		content: 'Our research on social stratification during COVID-19 revealed fascinating insights about human mobility patterns...',
		date: '2023-12-20',
		tags: ['research', 'data-analysis', 'covid19'],
		slug: 'understanding-human-behavior-data'
	},
	{
		id: '6',
		title: 'Teaching Python for Data Science',
		excerpt: 'Reflections on designing and teaching a Python course for Master students and the importance of practical learning.',
		content: 'Teaching Python for Data Science to Master students was an incredibly rewarding experience that reinforced my passion for education...',
		date: '2023-12-15',
		tags: ['teaching', 'python', 'education'],
		slug: 'teaching-python-data-science'
	}
];

export function getLatestPosts(count: number = 5): BlogPost[] {
	return blogPosts
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, count);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
	return blogPosts.find(post => post.slug === slug);
}
