<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { PersonaProfile } from '$lib/types/api';
	
	interface Props {
		persona: PersonaProfile;
		onViewDetails?: () => void;
		onEdit?: () => void;
		onDelete?: () => void;
		class?: string;
	}

	let {
		persona,
		onViewDetails,
		onEdit,
		onDelete,
		class: className = ''
	}: Props = $props();

	const confidenceColor = $derived(() => {
		if (persona.confidence_score >= 0.8) return 'bg-green-100 text-green-800';
		if (persona.confidence_score >= 0.6) return 'bg-yellow-100 text-yellow-800';
		return 'bg-red-100 text-red-800';
	});
</script>

<Card class="p-6 hover:shadow-md transition-shadow {className}">
	<div class="space-y-4">
		<!-- Header -->
		<div class="flex items-start justify-between">
			<div class="space-y-1">
				<h3 class="text-lg font-semibold text-foreground">{persona.name}</h3>
				<p class="text-sm text-muted-foreground">
					{persona.demographic.age_range} • {persona.demographic.gender} • {persona.demographic.location}
				</p>
			</div>
			<Badge class={confidenceColor}>
				{Math.round(persona.confidence_score * 100)}% confidence
			</Badge>
		</div>

		<!-- Summary -->
		<p class="text-sm text-muted-foreground line-clamp-3">
			{persona.insights.summary}
		</p>

		<!-- Demographics -->
		<div class="space-y-2">
			<h4 class="text-sm font-medium text-foreground">Demographics</h4>
			<div class="flex flex-wrap gap-1">
				<Badge variant="outline" class="text-xs">
					{persona.demographic.income_level} Income
				</Badge>
				<Badge variant="outline" class="text-xs">
					{persona.demographic.education}
				</Badge>
			</div>
		</div>

		<!-- Cultural Attributes -->
		<div class="space-y-2">
			<h4 class="text-sm font-medium text-foreground">Key Values</h4>
			<div class="flex flex-wrap gap-1">
				{#each persona.cultural_attributes.values.slice(0, 3) as value}
					<Badge variant="secondary" class="text-xs">{value}</Badge>
				{/each}
				{#if persona.cultural_attributes.values.length > 3}
					<Badge variant="outline" class="text-xs">
						+{persona.cultural_attributes.values.length - 3} more
					</Badge>
				{/if}
			</div>
		</div>

		<!-- Interests -->
		<div class="space-y-2">
			<h4 class="text-sm font-medium text-foreground">Interests</h4>
			<div class="flex flex-wrap gap-1">
				{#each persona.cultural_attributes.interests.slice(0, 4) as interest}
					<Badge variant="outline" class="text-xs bg-primary/10 text-primary border-primary/20">
						{interest}
					</Badge>
				{/each}
				{#if persona.cultural_attributes.interests.length > 4}
					<Badge variant="outline" class="text-xs">
						+{persona.cultural_attributes.interests.length - 4} more
					</Badge>
				{/if}
			</div>
		</div>

		<!-- Key Motivations -->
		<div class="space-y-2">
			<h4 class="text-sm font-medium text-foreground">Key Motivations</h4>
			<ul class="text-xs text-muted-foreground space-y-0.5">
				{#each persona.insights.key_motivations.slice(0, 2) as motivation}
					<li class="flex items-center gap-1">
						<span class="w-1 h-1 bg-primary rounded-full"></span>
						{motivation}
					</li>
				{/each}
			</ul>
		</div>

		<!-- Actions -->
		<div class="flex gap-2 pt-2 border-t">
			{#if onViewDetails}
				<Button variant="default" size="sm" onclick={onViewDetails} class="flex-1">
					View Details
				</Button>
			{/if}
			{#if onEdit}
				<Button variant="outline" size="sm" onclick={onEdit}>
					Edit
				</Button>
			{/if}
			{#if onDelete}
				<Button variant="outline" size="sm" onclick={onDelete} class="text-destructive hover:text-destructive">
					Delete
				</Button>
			{/if}
		</div>

		<!-- Metadata -->
		<div class="text-xs text-muted-foreground pt-2 border-t">
			Created: {new Date(persona.created_at).toLocaleDateString()}
			{#if persona.updated_at !== persona.created_at}
				• Updated: {new Date(persona.updated_at).toLocaleDateString()}
			{/if}
		</div>
	</div>
</Card>
