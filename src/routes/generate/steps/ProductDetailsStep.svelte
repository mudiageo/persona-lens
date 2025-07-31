<script lang="ts">
	import { FormField, FormControl, FormLabel, FormDescription, FormFieldErrors } from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { PersonaGenerationData } from '$lib/schemas/persona-form';

	interface Props {
		form: SuperForm<PersonaGenerationData>;
	}

	let { form }: Props = $props();
	
	const { form: formData } = form;

	const productTypes = [
		{ value: 'product', label: 'Physical Product' },
		{ value: 'service', label: 'Service' },
		{ value: 'software', label: 'Software/App' },
		{ value: 'platform', label: 'Platform/Marketplace' },
		{ value: 'content', label: 'Content/Media' },
		{ value: 'other', label: 'Other' }
	];

	const priceRanges = [
		{ value: 'free', label: 'Free' },
		{ value: 'low', label: 'Low ($1-$50)' },
		{ value: 'medium', label: 'Medium ($51-$500)' },
		{ value: 'high', label: 'High ($501-$5,000)' },
		{ value: 'premium', label: 'Premium ($5,001-$50,000)' },
		{ value: 'enterprise', label: 'Enterprise ($50,000+)' }
	];
</script>

<div class="space-y-6">
	<!-- Product Name -->
	<FormField {form} name="product_details.product_name">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Product/Service Name</FormLabel>
				<Input
					{...props}
					placeholder="Enter your product or service name"
					bind:value={$formData.product_details.product_name}
				/>
			{/snippet}
		</FormControl>
		<FormFieldErrors />
	</FormField>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Product Type -->
		<FormField {form} name="product_details.product_type">
			<FormControl>
				{#snippet children({ props })}
					<FormLabel>Product Type</FormLabel>
					<select
						{...props}
						bind:value={$formData.product_details.product_type}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select product type</option>
						{#each productTypes as type}
							<option value={type.value}>{type.label}</option>
						{/each}
					</select>
				{/snippet}
			</FormControl>
			<FormFieldErrors />
		</FormField>

		<!-- Price Range -->
		<FormField {form} name="product_details.price_range">
			<FormControl>
				{#snippet children({ props })}
					<FormLabel>Price Range</FormLabel>
					<select
						{...props}
						bind:value={$formData.product_details.price_range}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select price range</option>
						{#each priceRanges as range}
							<option value={range.value}>{range.label}</option>
						{/each}
					</select>
				{/snippet}
			</FormControl>
			<FormFieldErrors />
		</FormField>
	</div>

	<!-- Product Description -->
	<FormField {form} name="product_details.product_description">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Product Description</FormLabel>
				<FormDescription>
					Detailed description of what your product/service does and how it works (50-1000 characters)
				</FormDescription>
				<Textarea
					{...props}
					placeholder="Describe your product or service in detail. What does it do? How does it work? What problems does it solve?"
					rows={4}
					bind:value={$formData.product_details.product_description}
				/>
			{/snippet}
		</FormControl>
		<div class="flex justify-between items-center">
			<FormFieldErrors />
			<span class="text-xs text-muted-foreground">
				{$formData.product_details.product_description?.length || 0}/1000
			</span>
		</div>
	</FormField>

	<!-- Key Features -->
	<FormField {form} name="product_details.key_features">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Key Features</FormLabel>
				<FormDescription>
					List the main features and capabilities of your product/service (20-500 characters)
				</FormDescription>
				<Textarea
					{...props}
					placeholder="• Feature 1: Description&#10;• Feature 2: Description&#10;• Feature 3: Description"
					rows={4}
					bind:value={$formData.product_details.key_features}
				/>
			{/snippet}
		</FormControl>
		<div class="flex justify-between items-center">
			<FormFieldErrors />
			<span class="text-xs text-muted-foreground">
				{$formData.product_details.key_features?.length || 0}/500
			</span>
		</div>
	</FormField>

	<!-- Unique Value Proposition -->
	<FormField {form} name="product_details.unique_value_proposition">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Unique Value Proposition</FormLabel>
				<FormDescription>
					What makes your product unique? Why should customers choose you over competitors? (20-300 characters)
				</FormDescription>
				<Textarea
					{...props}
					placeholder="What sets your product apart from the competition? What unique value do you provide?"
					rows={3}
					bind:value={$formData.product_details.unique_value_proposition}
				/>
			{/snippet}
		</FormControl>
		<div class="flex justify-between items-center">
			<FormFieldErrors />
			<span class="text-xs text-muted-foreground">
				{$formData.product_details.unique_value_proposition?.length || 0}/300
			</span>
		</div>
	</FormField>

	<!-- Competitors (Optional) -->
	<FormField {form} name="product_details.competitors">
		<FormControl>
			{#snippet children({ props })}
				<FormLabel>Main Competitors</FormLabel>
				<FormDescription>
					List your main competitors or alternative solutions (optional, max 300 characters)
				</FormDescription>
				<Textarea
					{...props}
					placeholder="List companies or products that compete with you or provide alternative solutions..."
					rows={2}
					bind:value={$formData.product_details.competitors}
				/>
			{/snippet}
		</FormControl>
		<div class="flex justify-between items-center">
			<FormFieldErrors />
			<span class="text-xs text-muted-foreground">
				{$formData.product_details.competitors?.length || 0}/300
			</span>
		</div>
	</FormField>
</div>
