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
						Generated on {new Date(persona.generation_timestamp || persona.created_at || Date.now()).toLocaleDateString()}
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
				{#if persona.quotes?.aspiration}
					<div class="italic text-muted-foreground border-l-4 border-primary pl-4 mb-4">
						"{persona.quotes.aspiration}"
					</div>
				{/if}
			</div>
		</Card>

		<!-- Demographics -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Demographics</h3>
			<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
				<div>
					<span class="text-sm font-medium text-muted-foreground">Age</span>
					<p class="text-foreground">{persona.demographics.age} years old</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Gender</span>
					<p class="text-foreground">{persona.demographics.gender}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Location</span>
					<p class="text-foreground">{persona.demographics.location}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Occupation</span>
					<p class="text-foreground">{persona.demographics.occupation}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Income</span>
					<p class="text-foreground">{persona.demographics.income}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Education</span>
					<p class="text-foreground">{persona.demographics.education}</p>
				</div>
				<div>
					<span class="text-sm font-medium text-muted-foreground">Confidence Score</span>
					<p class="text-foreground">{Math.round(persona.confidence_score * 100)}%</p>
				</div>
			</div>
		</Card>

		<!-- Psychographics -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Psychographics</h3>
			<div class="space-y-4">
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Core Values</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.psychographics.values as value}
							<Badge variant="secondary">{value}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Motivations</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.psychographics.motivations as motivation}
							<Badge variant="outline" class="bg-primary/10 text-primary border-primary/20">{motivation}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Personality Traits</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.psychographics.personality_traits as trait}
							<Badge variant="outline">{trait}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Lifestyle</h4>
					<p class="text-sm text-muted-foreground">{persona.psychographics.lifestyle}</p>
				</div>
			</div>
		</Card>

		<!-- Behavioral Patterns -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Behavioral Patterns</h3>
			<div class="space-y-4">
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Daily Routine</h4>
					<p class="text-sm text-muted-foreground">{persona.behavioral_patterns.daily_routine}</p>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Decision Making Style</h4>
					<p class="text-sm text-muted-foreground">{persona.behavioral_patterns.decision_making_style}</p>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Research Habits</h4>
					<p class="text-sm text-muted-foreground">{persona.behavioral_patterns.research_habits}</p>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Shopping Behavior</h4>
					<p class="text-sm text-muted-foreground">{persona.behavioral_patterns.shopping_behavior}</p>
				</div>
			</div>
		</Card>

		<!-- Goals & Pain Points -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Goals & Pain Points</h3>
			<div class="space-y-4">
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Primary Goals</h4>
					<div class="space-y-2">
						{#each persona.goals_and_pain_points.primary_goals as goal}
							<div class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
								<span class="w-2 h-2 bg-green-500 rounded-full"></span>
								<span class="text-sm text-foreground">{goal}</span>
							</div>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Current Challenges</h4>
					<div class="space-y-2">
						{#each persona.goals_and_pain_points.current_challenges as challenge}
							<div class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
								<span class="w-2 h-2 bg-red-500 rounded-full"></span>
								<span class="text-sm text-foreground">{challenge}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</Card>

		<!-- Marketing Strategy -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Marketing Strategy</h3>
			<div class="space-y-4">
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Best Channels</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.marketing_strategy.best_channels as channel}
							<Badge variant="outline" class="bg-primary/10 text-primary border-primary/20">{channel}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Content Types</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.marketing_strategy.content_types as content}
							<Badge variant="secondary">{content}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Messaging Style</h4>
					<p class="text-sm text-muted-foreground">{persona.marketing_strategy.messaging_style}</p>
				</div>
			</div>
		</Card>

		<!-- Digital Behavior -->
		<Card class="p-6">
			<h3 class="text-lg font-semibold text-foreground mb-4">Digital Behavior</h3>
			<div class="space-y-4">
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Primary Devices</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.digital_behavior.primary_devices as device}
							<Badge variant="outline">{device}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Social Media Platforms</h4>
					<div class="flex flex-wrap gap-2">
						{#each persona.digital_behavior.social_media_platforms as platform}
							<Badge variant="secondary">{platform}</Badge>
						{/each}
					</div>
				</div>
				
				<div>
					<h4 class="text-sm font-medium text-foreground mb-2">Technology Comfort</h4>
					<p class="text-sm text-muted-foreground">{persona.digital_behavior.technology_comfort}</p>
				</div>
			</div>
		</Card>

		<!-- Persona Quotes -->
		{#if persona.quotes}
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-4">Persona Quotes</h3>
				<div class="space-y-4">
					<div class="border-l-4 border-primary pl-4">
						<p class="text-sm font-medium text-foreground mb-1">Pain Point:</p>
						<p class="text-sm text-muted-foreground italic">"{persona.quotes.pain_point}"</p>
					</div>
					
					<div class="border-l-4 border-green-500 pl-4">
						<p class="text-sm font-medium text-foreground mb-1">Product Need:</p>
						<p class="text-sm text-muted-foreground italic">"{persona.quotes.product_need}"</p>
					</div>
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
