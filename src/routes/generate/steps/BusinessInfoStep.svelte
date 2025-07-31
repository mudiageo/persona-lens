<script lang="ts">
	import { FormField, FormControl, FormLabel, FormDescription, FormFieldErrors } from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card } from '$lib/components/ui/card';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { PersonaGenerationData } from '$lib/schemas/persona-form';

	interface Props {
		form: SuperForm<PersonaGenerationData>;
	}

	let { form }: Props = $props();

	const { form: formData } = form;

	const industries = [
		'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
		'Real Estate', 'Food & Beverage', 'Entertainment', 'Travel & Tourism',
		'Automotive', 'Energy', 'Consulting', 'Legal', 'Non-Profit', 'Other'
	];

	const companySize = [
		{ value: 'startup', label: 'Startup (1-10 employees)' },
		{ value: 'small', label: 'Small (11-50 employees)' },
		{ value: 'medium', label: 'Medium (51-200 employees)' },
		{ value: 'large', label: 'Large (201-1000 employees)' },
		{ value: 'enterprise', label: 'Enterprise (1000+ employees)' }
	];
</script>

<div class="space-y-6">
	<!-- Business Name -->
	<FormField {form} name="business_info.business_name">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Business Name</FormLabel>
				<Input
					{...props}
					placeholder="Enter your business name"
					bind:value={$formData.business_info.business_name}
				/>
			{/snippet}
		</FormControl>
		<FormFieldErrors />
	</FormField>

	<!-- Industry -->
	<FormField {form} name="business_info.industry">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Industry</FormLabel>
				<select
					{...props}
					bind:value={$formData.business_info.industry}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="">Select an industry</option>
					{#each industries as industry}
						<option value={industry.toLowerCase().replace(/\s+/g, '-')}>{industry}</option>
					{/each}
				</select>
			{/snippet}
		</FormControl>
		<FormFieldErrors />
	</FormField>

	<!-- Business Type -->
	<FormField {form} name="business_info.business_type">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Business Type</FormLabel>
				<FormDescription>Who do you primarily serve?</FormDescription>
				<div class="flex gap-4 mt-2">
					{#each ['B2B', 'B2C', 'Both'] as type}
						<label class="flex items-center space-x-2 cursor-pointer">
							<input
								{...props}
								type="radio"
								value={type}
								bind:group={$formData.business_info.business_type}
								class="w-4 h-4 text-primary bg-background border-input focus:ring-primary focus:ring-2"
							/>
							<span class="text-sm font-medium">{type}</span>
						</label>
					{/each}
				</div>
			{/snippet}
		</FormControl>
		<FormFieldErrors />
	</FormField>

	<!-- Company Size -->
	<FormField {form} name="business_info.company_size">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Company Size</FormLabel>
				<select
					{...props}
					bind:value={$formData.business_info.company_size}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="">Select company size</option>
					{#each companySize as size}
						<option value={size.value}>{size.label}</option>
					{/each}
				</select>
			{/snippet}
		</FormControl>
		<FormFieldErrors />
	</FormField>

	<!-- Business Description -->
	<FormField {form} name="business_info.business_description">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Business Description</FormLabel>
				<FormDescription>
					Describe what your business does, your mission, and key activities (50-1000 characters)
				</FormDescription>
				<Textarea
					{...props}
					placeholder="Tell us about your business, what you do, your mission, and key activities..."
					rows={4}
					bind:value={$formData.business_info.business_description}
				/>
			{/snippet}
		</FormControl>
		<div class="flex justify-between items-center">
			<FormFieldErrors />
			<span class="text-xs text-muted-foreground">
				{$formData.business_info.business_description?.length || 0}/1000
			</span>
		</div>
	</FormField>

	<!-- Website (Optional) -->
	<FormField {form} name="business_info.website">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Website</FormLabel>
				<FormDescription>Your company website (optional)</FormDescription>
				<Input
					{...props}
					type="url"
					placeholder="https://example.com"
					bind:value={$formData.business_info.website}
				/>
			{/snippet}
		</FormControl>
		<FormFieldErrors />
	</FormField>
</div>
