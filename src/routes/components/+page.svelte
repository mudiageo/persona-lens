<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import ProgressBar from '$lib/components/ui/progress-bar.svelte';
	import PersonaCard from '$lib/components/persona-card.svelte';
	import InsightPanel from '$lib/components/insight-panel.svelte';
	import type { PersonaProfile } from '$lib/types/api';

	// Mock persona data for demonstration
	const mockPersona: PersonaProfile = {
		id: "mock-persona-1",
		name: "Tech-Savvy Millennial",
		demographic: {
			age_range: "28-35",
			gender: "Mixed",
			location: "Urban",
			income_level: "Upper Middle",
			education: "College Educated"
		},
		cultural_attributes: {
			values: ["Innovation", "Sustainability", "Authenticity", "Work-Life Balance"],
			interests: ["Technology", "Environmental Issues", "Fitness", "Travel", "Design"],
			lifestyle: ["Urban Living", "Remote Work", "Health Conscious", "Social Media Active"],
			media_consumption: ["Streaming Services", "Podcasts", "Social Media", "Online News"]
		},
		taste_profile: [
			{ id: "1", name: "Apple", category: "Technology", confidence: 0.92, attributes: {} },
			{ id: "2", name: "Tesla", category: "Automotive", confidence: 0.88, attributes: {} },
			{ id: "3", name: "Patagonia", category: "Outdoor", confidence: 0.85, attributes: {} }
		],
		behavioral_patterns: {
			shopping_habits: ["Research-driven purchases", "Values brand reputation", "Price-conscious premium"],
			decision_drivers: ["Quality", "Sustainability", "Innovation", "Reviews"],
			communication_preferences: ["Email", "Social Media", "Video Content", "Mobile-first"],
			brand_affinities: ["Premium tech brands", "Sustainable companies", "Innovative startups"]
		},
		insights: {
			summary: "A forward-thinking urban professional who values quality, innovation, and sustainability. Makes informed purchasing decisions and is willing to pay premium for brands that align with their values.",
			key_motivations: ["Achievement", "Environmental Impact", "Social Status", "Personal Growth"],
			marketing_recommendations: [
				"Focus on sustainability and environmental impact",
				"Use data-driven messaging and transparent communication",
				"Leverage social proof and user reviews",
				"Invest in mobile-first, video-rich content"
			],
			content_preferences: ["Video content", "Interactive experiences", "Behind-the-scenes content", "Educational resources"]
		},
		confidence_score: 0.87,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	};

	let progressValue = $state(0);
	let selectedPersona = $state<PersonaProfile | null>(null);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Simulate progress animation
	function simulateProgress() {
		progressValue = 0;
		const interval = setInterval(() => {
			progressValue += 10;
			if (progressValue >= 100) {
				clearInterval(interval);
			}
		}, 200);
	}

	function viewPersonaDetails() {
		selectedPersona = mockPersona;
	}

	function simulateLoading() {
		isLoading = true;
		selectedPersona = null;
		error = null;
		
		setTimeout(() => {
			isLoading = false;
			selectedPersona = mockPersona;
		}, 2000);
	}

	function simulateError() {
		isLoading = false;
		selectedPersona = null;
		error = "Failed to analyze persona data. Please try again.";
	}
</script>

<svelte:head>
	<title>UI Components - PersonaLens</title>
</svelte:head>

<div class="container mx-auto px-4 py-16">
	<div class="mx-auto max-w-6xl">
		<div class="text-center mb-16">
			<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
				UI Components
				<span class="gradient-primary">
					Showcase
				</span>
			</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
				Explore the essential UI components built with shadcn-svelte for PersonaLens.
			</p>
		</div>

		<div class="space-y-12">
			<!-- Buttons -->
			<Card class="p-8">
				<h2 class="text-2xl font-bold mb-6">Buttons</h2>
				<div class="flex flex-wrap gap-4">
					<Button variant="default">Default</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="default" size="sm">Small</Button>
					<Button variant="default" size="lg">Large</Button>
					<Button variant="default" disabled>Disabled</Button>
				</div>
			</Card>

			<!-- Form Elements -->
			<Card class="p-8">
				<h2 class="text-2xl font-bold mb-6">Form Elements</h2>
				<div class="space-y-6 max-w-md">
					<div>
						<label for="sample-input" class="block text-sm font-medium mb-2">Input Field</label>
						<Input id="sample-input" placeholder="Enter your text here..." />
					</div>
					<div>
						<label for="sample-textarea" class="block text-sm font-medium mb-2">Textarea</label>
						<Textarea id="sample-textarea" placeholder="Enter a longer description..." rows={4} />
					</div>
				</div>
			</Card>

			<!-- Badges -->
			<Card class="p-8">
				<h2 class="text-2xl font-bold mb-6">Badges</h2>
				<div class="flex flex-wrap gap-4">
					<Badge variant="default">Default</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge class="bg-green-100 text-green-800">Success</Badge>
					<Badge class="bg-yellow-100 text-yellow-800">Warning</Badge>
					<Badge class="bg-blue-100 text-blue-800">Info</Badge>
				</div>
			</Card>

			<!-- Progress Bars -->
			<Card class="p-8">
				<h2 class="text-2xl font-bold mb-6">Progress Bars</h2>
				<div class="space-y-6">
					<div>
						<ProgressBar value={75} showLabel={true} label="Analysis Progress" />
					</div>
					<div>
						<ProgressBar value={50} variant="success" size="lg" />
					</div>
					<div>
						<ProgressBar value={progressValue} variant="secondary" showLabel={true} label="Animated Progress" />
						<Button onclick={simulateProgress} class="mt-2" size="sm">Animate Progress</Button>
					</div>
				</div>
			</Card>

			<!-- Persona Card -->
			<Card class="p-8">
				<h2 class="text-2xl font-bold mb-6">Persona Card</h2>
				<div class="max-w-md">
					<PersonaCard 
						persona={mockPersona} 
						onViewDetails={viewPersonaDetails}
						onEdit={() => alert('Edit clicked')}
						onDelete={() => alert('Delete clicked')}
					/>
				</div>
			</Card>

			<!-- Insight Panel Controls -->
			<Card class="p-8">
				<h2 class="text-2xl font-bold mb-6">Insight Panel Controls</h2>
				<div class="flex gap-4 mb-6">
					<Button onclick={() => selectedPersona = mockPersona}>Show Insights</Button>
					<Button onclick={simulateLoading} variant="outline">Simulate Loading</Button>
					<Button onclick={simulateError} variant="outline">Simulate Error</Button>
					<Button onclick={() => { selectedPersona = null; error = null; }} variant="ghost">Clear</Button>
				</div>
			</Card>

			<!-- Insight Panel -->
			<div>
				<h2 class="text-2xl font-bold mb-6">Insight Panel</h2>
				<InsightPanel 
					persona={selectedPersona}
					isLoading={isLoading}
					error={error}
					onExport={() => alert('Export clicked')}
					onShare={() => alert('Share clicked')}
				/>
			</div>

			<!-- Color Palette -->
			<Card class="p-8">
				<h2 class="text-2xl font-bold mb-6">Color Palette</h2>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div class="space-y-2">
						<div class="w-full h-16 bg-primary rounded-md"></div>
						<p class="text-sm font-medium">Primary</p>
					</div>
					<div class="space-y-2">
						<div class="w-full h-16 bg-secondary rounded-md"></div>
						<p class="text-sm font-medium">Secondary</p>
					</div>
					<div class="space-y-2">
						<div class="w-full h-16 bg-chart-1 rounded-md"></div>
						<p class="text-sm font-medium">Chart 1</p>
					</div>
					<div class="space-y-2">
						<div class="w-full h-16 bg-chart-2 rounded-md"></div>
						<p class="text-sm font-medium">Chart 2</p>
					</div>
					<div class="space-y-2">
						<div class="w-full h-16 bg-chart-3 rounded-md"></div>
						<p class="text-sm font-medium">Chart 3</p>
					</div>
					<div class="space-y-2">
						<div class="w-full h-16 bg-chart-4 rounded-md"></div>
						<p class="text-sm font-medium">Chart 4</p>
					</div>
					<div class="space-y-2">
						<div class="w-full h-16 bg-destructive rounded-md"></div>
						<p class="text-sm font-medium">Destructive</p>
					</div>
					<div class="space-y-2">
						<div class="w-full h-16 bg-muted rounded-md"></div>
						<p class="text-sm font-medium">Muted</p>
					</div>
				</div>
			</Card>

			<!-- Typography -->
			<Card class="p-8">
				<h2 class="text-2xl font-bold mb-6">Typography</h2>
				<div class="space-y-4">
					<h1 class="text-4xl font-bold">Heading 1</h1>
					<h2 class="text-3xl font-bold">Heading 2</h2>
					<h3 class="text-2xl font-bold">Heading 3</h3>
					<h4 class="text-xl font-semibold">Heading 4</h4>
					<p class="text-base text-foreground">
						This is body text in the default foreground color. Lorem ipsum dolor sit amet consectetur.
					</p>
					<p class="text-sm text-muted-foreground">
						This is smaller text in muted foreground color, perfect for secondary information.
					</p>
					<p class="text-lg gradient-primary font-semibold">
						This is gradient text using our custom utility class.
					</p>
				</div>
			</Card>
		</div>
	</div>
</div>
