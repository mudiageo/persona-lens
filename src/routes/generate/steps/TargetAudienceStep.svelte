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

	const demographics = {
		age_range: [
			{ value: '18-25', label: '18-25 years' },
			{ value: '26-35', label: '26-35 years' },
			{ value: '36-45', label: '36-45 years' },
			{ value: '46-55', label: '46-55 years' },
			{ value: '56-65', label: '56-65 years' },
			{ value: '65+', label: '65+ years' },
			{ value: 'mixed', label: 'Mixed ages' }
		],
		gender: [
			{ value: 'male', label: 'Primarily Male' },
			{ value: 'female', label: 'Primarily Female' },
			{ value: 'non-binary', label: 'Non-binary' },
			{ value: 'mixed', label: 'Mixed genders' }
		],
		location: [
			{ value: 'urban', label: 'Urban areas' },
			{ value: 'suburban', label: 'Suburban areas' },
			{ value: 'rural', label: 'Rural areas' },
			{ value: 'mixed', label: 'Mixed locations' },
			{ value: 'global', label: 'Global audience' }
		],
		income_level: [
			{ value: 'low', label: 'Low income (Under $30k)' },
			{ value: 'lower-middle', label: 'Lower-middle ($30k-$50k)' },
			{ value: 'middle', label: 'Middle income ($50k-$100k)' },
			{ value: 'upper-middle', label: 'Upper-middle ($100k-$200k)' },
			{ value: 'high', label: 'High income ($200k+)' },
			{ value: 'mixed', label: 'Mixed income levels' }
		],
		education: [
			{ value: 'high-school', label: 'High school' },
			{ value: 'some-college', label: 'Some college' },
			{ value: 'bachelors', label: 'Bachelor\'s degree' },
			{ value: 'masters', label: 'Master\'s degree' },
			{ value: 'doctorate', label: 'Doctorate' },
			{ value: 'mixed', label: 'Mixed education levels' }
		]
	};
</script>

<div class="space-y-6">
	<!-- Target Description -->
	<FormField {form} name="target_audience.target_description">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Target Audience Description</FormLabel>
				<FormDescription>
					Provide a detailed description of your ideal customers, their behaviors, interests, and pain points (100-2000 characters)
				</FormDescription>
				<Textarea
					{...props}
					placeholder="Describe your target audience in detail. Include their behaviors, interests, challenges, motivations, and how they currently solve problems your product addresses..."
					rows={6}
					bind:value={$formData.target_audience.target_description}
				/>
			{/snippet}
		</FormControl>
		<div class="flex justify-between items-center">
			<FormFieldErrors />
			<span class="text-xs text-muted-foreground">
				{$formData.target_audience.target_description?.length || 0}/2000
			</span>
		</div>
	</FormField>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Age Range -->
		<FormField {form} name="target_audience.age_range">
			<FormControl>
				{#snippet children({ props })}
					<FormLabel>Age Range</FormLabel>
					<select
						{...props}
						bind:value={$formData.target_audience.age_range}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select age range</option>
						{#each demographics.age_range as age}
							<option value={age.value}>{age.label}</option>
						{/each}
					</select>
				{/snippet}
			</FormControl>
			<FormFieldErrors />
		</FormField>

		<!-- Gender -->
		<FormField {form} name="target_audience.gender">
			<FormControl>
				{#snippet children({ props })}
					<FormLabel>Gender Demographics</FormLabel>
					<select
						{...props}
						bind:value={$formData.target_audience.gender}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select gender</option>
						{#each demographics.gender as gender}
							<option value={gender.value}>{gender.label}</option>
						{/each}
					</select>
				{/snippet}
			</FormControl>
			<FormFieldErrors />
		</FormField>

		<!-- Location -->
		<FormField {form} name="target_audience.location">
			<FormControl>
				{#snippet children({ props })}
					<FormLabel>Location Type</FormLabel>
					<select
						{...props}
						bind:value={$formData.target_audience.location}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select location</option>
						{#each demographics.location as location}
							<option value={location.value}>{location.label}</option>
						{/each}
					</select>
				{/snippet}
			</FormControl>
			<FormFieldErrors />
		</FormField>

		<!-- Income Level -->
		<FormField {form} name="target_audience.income_level">
			<FormControl>
				{#snippet children({ props })}
					<FormLabel>Income Level</FormLabel>
					<select
						{...props}
						bind:value={$formData.target_audience.income_level}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select income level</option>
						{#each demographics.income_level as income}
							<option value={income.value}>{income.label}</option>
						{/each}
					</select>
				{/snippet}
			</FormControl>
			<FormFieldErrors />
		</FormField>

		<!-- Education -->
		<FormField {form} name="target_audience.education">
			<FormControl>
				{#snippet children({ props })}
					<FormLabel>Education Level</FormLabel>
					<select
						{...props}
						bind:value={$formData.target_audience.education}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select education level</option>
						{#each demographics.education as education}
							<option value={education.value}>{education.label}</option>
						{/each}
					</select>
				{/snippet}
			</FormControl>
			<FormFieldErrors />
		</FormField>
	</div>

	<!-- Cultural Context (Optional) -->
	<FormField {form} name="target_audience.cultural_context">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Cultural Context</FormLabel>
				<FormDescription>
					Any specific cultural, regional, or social context relevant to your audience (optional, max 500 characters)
				</FormDescription>
				<Textarea
					{...props}
					placeholder="Describe any relevant cultural factors, regional preferences, social trends, or community aspects..."
					rows={3}
					bind:value={$formData.target_audience.cultural_context}
				/>
			{/snippet}
		</FormControl>
		<div class="flex justify-between items-center">
			<FormFieldErrors />
			<span class="text-xs text-muted-foreground">
				{$formData.target_audience.cultural_context?.length || 0}/500
			</span>
		</div>
	</FormField>
</div>
