<script lang="ts">
	import { FormField, FormControl, FormLabel, FormDescription, FormFieldErrors } from '$lib/components/ui/form';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { PersonaGenerationData } from '$lib/schemas/persona-form';

	interface Props {
		form: SuperForm<PersonaGenerationData>;
	}

	let { form }: Props = $props();
	const { form: formData } = form;

	const primaryGoals = [
		{ value: 'market-research', label: 'Market Research', description: 'Understanding market opportunities and trends' },
		{ value: 'product-development', label: 'Product Development', description: 'Informing product features and roadmap' },
		{ value: 'marketing-strategy', label: 'Marketing Strategy', description: 'Creating targeted marketing campaigns' },
		{ value: 'brand-positioning', label: 'Brand Positioning', description: 'Defining brand messaging and positioning' },
		{ value: 'content-strategy', label: 'Content Strategy', description: 'Developing relevant content and messaging' },
		{ value: 'customer-acquisition', label: 'Customer Acquisition', description: 'Improving customer acquisition strategies' },
		{ value: 'other', label: 'Other', description: 'Custom research objectives' }
	];

	const timelines = [
		{ value: 'immediate', label: 'Immediate (within days)' },
		{ value: 'week', label: 'This week' },
		{ value: 'month', label: 'This month' },
		{ value: 'quarter', label: 'This quarter' },
		{ value: 'year', label: 'This year' }
	];

	const budgetRanges = [
		{ value: 'free', label: 'Free tools only' },
		{ value: 'low', label: 'Low budget ($1-$100)' },
		{ value: 'medium', label: 'Medium budget ($101-$1,000)' },
		{ value: 'high', label: 'High budget ($1,001-$10,000)' },
		{ value: 'enterprise', label: 'Enterprise budget ($10,000+)' }
	];
</script>

<div class="space-y-6">
	<!-- Primary Goal -->
	<FormField {form} name="research_goals.primary_goal">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Primary Research Goal</FormLabel>
				<FormDescription>What's the main purpose of creating this persona?</FormDescription>
				<div class="space-y-3 mt-3">
					{#each primaryGoals as goal}
						<label class="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border {$formData.research_goals.primary_goal === goal.value ? 'border-primary bg-primary/5' : 'border-input hover:border-input/80'}">
							<input
								{...props}
								type="radio"
								value={goal.value}
								bind:group={$formData.research_goals.primary_goal}
								class="w-4 h-4 text-primary bg-background border-input focus:ring-primary focus:ring-2 mt-0.5"
							/>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium text-foreground">{goal.label}</div>
								<div class="text-xs text-muted-foreground">{goal.description}</div>
							</div>
						</label>
					{/each}
				</div>
			{/snippet}
		</FormControl>
		<FormFieldErrors />
	</FormField>

	<!-- Use Case -->
	<FormField {form} name="research_goals.use_case">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Specific Use Case</FormLabel>
				<FormDescription>
					How will you use this persona? What decisions will it help you make? (20-500 characters)
				</FormDescription>
				<Textarea
					{...props}
					placeholder="Describe specifically how you plan to use this persona. What decisions will it inform? What problems will it help solve?"
					rows={4}
					bind:value={$formData.research_goals.use_case}
				/>
			{/snippet}
		</FormControl>
		<div class="flex justify-between items-center">
			<FormFieldErrors />
			<span class="text-xs text-muted-foreground">
				{$formData.research_goals.use_case?.length || 0}/500
			</span>
		</div>
	</FormField>

	<!-- Specific Questions -->
	<FormField {form} name="research_goals.specific_questions">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Specific Questions</FormLabel>
				<FormDescription>
					Any specific questions you want this persona research to answer (optional, max 1000 characters)
				</FormDescription>
				<Textarea
					{...props}
					placeholder="• What motivates them to buy?&#10;• What are their biggest pain points?&#10;• Where do they discover new products?&#10;• What influences their purchasing decisions?"
					rows={4}
					bind:value={$formData.research_goals.specific_questions}
				/>
			{/snippet}
		</FormControl>
		<div class="flex justify-between items-center">
			<FormFieldErrors />
			<span class="text-xs text-muted-foreground">
				{$formData.research_goals.specific_questions?.length || 0}/1000
			</span>
		</div>
	</FormField>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Timeline -->
		<FormField {form} name="research_goals.timeline">
			<FormControl>
				{#snippet children({ props })}
					<FormLabel>Timeline</FormLabel>
					<FormDescription>When do you need this persona?</FormDescription>
					<select
						{...props}
						bind:value={$formData.research_goals.timeline}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select timeline</option>
						{#each timelines as timeline}
							<option value={timeline.value}>{timeline.label}</option>
						{/each}
					</select>
				{/snippet}
			</FormControl>
			<FormFieldErrors />
		</FormField>

		<!-- Budget Range -->
		<FormField {form} name="research_goals.budget_range">
			<FormControl>
				{#snippet children({ props })}
					<FormLabel>Budget Range</FormLabel>
					<FormDescription>What's your research budget?</FormDescription>
					<select
						{...props}
						bind:value={$formData.research_goals.budget_range}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select budget range</option>
						{#each budgetRanges as budget}
							<option value={budget.value}>{budget.label}</option>
						{/each}
					</select>
				{/snippet}
			</FormControl>
			<FormFieldErrors />
		</FormField>
	</div>

	<!-- Success Indicator -->
	<div class="p-4 bg-muted/50 rounded-lg border-l-4 border-l-primary">
		<h4 class="font-medium text-foreground mb-2">💡 Research Success Tip</h4>
		<p class="text-sm text-muted-foreground">
			The more specific and detailed your inputs, the more accurate and actionable your persona will be. 
			Consider including real customer feedback, survey data, or behavioral insights you've already gathered.
		</p>
	</div>
</div>
