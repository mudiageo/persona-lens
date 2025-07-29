<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { PersonaProfile } from '$lib/types/api';
	
	interface Props {
		persona: PersonaProfile | null;
		isLoading?: boolean;
		error?: string | null;
		onExport?: () => void;
		onShare?: () => void;
		class?: string;
	}

	let {
		persona,
		isLoading = false,
		error = null,
		onExport,
		onShare,
		class: className = ''
	}: Props = $props();
</script>

<div class="space-y-6 {className}">
	{#if isLoading}
		<Card class="p-8">
			<div class="flex items-center justify-center space-x-2">
				<div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				<span class="text-muted-foreground">Analyzing persona insights...</span>
			</div>
		</Card>
	{:else if error}
		<Card class="p-8">
			<div class="text-center">
				<div class="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
					<span class="text-destructive">⚠</span>
				</div>
				<h3 class="text-lg font-semibold text-foreground mb-2">Analysis Error</h3>
				<p class="text-sm text-muted-foreground mb-4">{error}</p>
				<Button variant="outline" size="sm">Try Again</Button>
			</div>
		</Card>
	{:else if persona}
		<!-- Persona Header -->
		<Card class="p-6">
			<div class="flex items-start justify-between mb-4">
				<div>
					<h2 class="text-2xl font-bold text-foreground">{persona.name}</h2>
					<p class="text-muted-foreground mt-1">
						Generated on {new Date(persona.created_at).toLocaleDateString()}
					</p>
				</div>
				<div class="flex gap-2">
					{#if onExport}
						<Button variant="outline" size="sm" onclick={onExport}>
							Export
						</Button>
					{/if}
					{#if onShare}
						<Button variant="outline" size="sm" onclick={onShare}>
							Share
						</Button>
					{/if}
				</div>
			</div>
			
			<div class="prose prose-sm max-w-none">
				<p class="text-muted-foreground">{persona.insights.summary}</p>
			</div>
		</Card>

		<!-- Demographics -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Demographics</h3>
			<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
				<div>
					<span class="text-sm font-medium text-muted-foreground">Age Range</span>
					<p class="text-foreground">{persona.demographic.age_range}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Gender</span>
					<p class="text-foreground">{persona.demographic.gender}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Location</span>
					<p class="text-foreground">{persona.demographic.location}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Income Level</span>
					<p class="text-foreground">{persona.demographic.income_level}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Education</span>
					<p class="text-foreground">{persona.demographic.education}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Confidence Score</span>
					<p class="text-foreground">{Math.round(persona.confidence_score * 100)}%</p>
				</div>
			</div>
		</Card>

		<!-- Cultural Attributes -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Cultural Attributes</h3>
			<div class="space-y-4">
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Core Values</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.cultural_attributes.values as value}
							<Badge variant="secondary">{value}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Interests</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.cultural_attributes.interests as interest}
							<Badge variant="outline" class="bg-primary/10 text-primary border-primary/20">{interest}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Lifestyle</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.cultural_attributes.lifestyle as lifestyle}
							<Badge variant="outline">{lifestyle}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Media Consumption</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.cultural_attributes.media_consumption as media}
							<Badge variant="outline" class="bg-chart-1/10 text-chart-1 border-chart-1/20">{media}</Badge>
						{/each}
					</div>
				</div>
			</div>
		</Card>

		<!-- Behavioral Patterns -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Behavioral Patterns</h3>
			<div class="grid md:grid-cols-2 gap-6">
				<div>
					<h4 class="text-sm font-medium text-foreground mb-3">Shopping Habits</h4>
					<ul class="space-y-2">
						{#each persona.behavioral_patterns.shopping_habits as habit}
							<li class="flex items-start gap-2 text-sm text-muted-foreground">
								<span class="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
								{habit}
							</li>
						{/each}
					</ul>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-3">Decision Drivers</h4>
					<ul class="space-y-2">
						{#each persona.behavioral_patterns.decision_drivers as driver}
							<li class="flex items-start gap-2 text-sm text-muted-foreground">
								<span class="w-1.5 h-1.5 bg-chart-2 rounded-full mt-2 flex-shrink-0"></span>
								{driver}
							</li>
						{/each}
					</ul>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-3">Communication Preferences</h4>
					<ul class="space-y-2">
						{#each persona.behavioral_patterns.communication_preferences as pref}
							<li class="flex items-start gap-2 text-sm text-muted-foreground">
								<span class="w-1.5 h-1.5 bg-chart-3 rounded-full mt-2 flex-shrink-0"></span>
								{pref}
							</li>
						{/each}
					</ul>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-3">Brand Affinities</h4>
					<ul class="space-y-2">
						{#each persona.behavioral_patterns.brand_affinities as affinity}
							<li class="flex items-start gap-2 text-sm text-muted-foreground">
								<span class="w-1.5 h-1.5 bg-chart-4 rounded-full mt-2 flex-shrink-0"></span>
								{affinity}
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</Card>

		<!-- Key Insights -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
			<div class="space-y-4">
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Key Motivations</h4>
					<div class="grid md:grid-cols-2 gap-2">
						{#each persona.insights.key_motivations as motivation}
							<div class="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
								<span class="w-2 h-2 bg-primary rounded-full"></span>
								<span class="text-sm text-foreground">{motivation}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</Card>

		<!-- Marketing Recommendations -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Marketing Recommendations</h3>
			<div class="space-y-3">
				{#each persona.insights.marketing_recommendations as rec, index}
					<div class="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-md">
						<span class="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
							{index + 1}
						</span>
						<p class="text-sm text-foreground">{rec}</p>
					</div>
				{/each}
			</div>
		</Card>

		<!-- Content Preferences -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Content Preferences</h3>
			<div class="grid md:grid-cols-2 gap-3">
				{#each persona.insights.content_preferences as pref}
					<div class="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
						<span class="w-2 h-2 bg-chart-1 rounded-full"></span>
						<span class="text-sm text-foreground">{pref}</span>
					</div>
				{/each}
			</div>
		</Card>

		<!-- Taste Profile -->
		{#if persona.taste_profile.length > 0}
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-4">Taste Profile</h3>
				<div class="space-y-3">
					{#each persona.taste_profile.slice(0, 10) as taste}
						<div class="flex items-center justify-between p-3 bg-muted/30 rounded-md">
							<div>
								<span class="text-sm font-medium text-foreground">{taste.name}</span>
								<span class="text-xs text-muted-foreground ml-2">({taste.category})</span>
							</div>
							<Badge variant="outline" class="text-xs">
								{Math.round(taste.confidence * 100)}%
							</Badge>
						</div>
					{/each}
					{#if persona.taste_profile.length > 10}
						<p class="text-xs text-muted-foreground text-center pt-2">
							+{persona.taste_profile.length - 10} more taste preferences
						</p>
					{/if}
				</div>
			</Card>
		{/if}
	{:else}
		<Card class="p-8">
			<div class="text-center">
				<div class="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
					<span class="text-muted-foreground">📊</span>
				</div>
				<h3 class="text-lg font-semibold text-foreground mb-2">No Persona Selected</h3>
				<p class="text-sm text-muted-foreground">
					Generate a persona to see detailed insights and analysis.
				</p>
			</div>
		</Card>
	{/if}
</div>
