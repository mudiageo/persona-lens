<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	
	let businessName = '';
	let industry = '';
	let description = '';
</script>

<svelte:head>
	<title>Form Test - PersonaLens</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background to-muted/20">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-2xl">
			<h1 class="text-3xl font-bold text-center mb-8">Form Components Test</h1>
			
			<Card class="p-6">
				<h2 class="text-xl font-semibold mb-4">Test Form</h2>
				
				<div class="space-y-4">
					<div>
						<label for="business-name" class="block text-sm font-medium mb-2">
							Business Name
						</label>
						<Input 
							id="business-name"
							bind:value={businessName}
							placeholder="Enter your business name"
						/>
					</div>
					
					<div>
						<label for="industry" class="block text-sm font-medium mb-2">
							Industry
						</label>
						<select 
							id="industry"
							bind:value={industry}
							class="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
						>
							<option value="">Select an industry</option>
							<option value="technology">Technology</option>
							<option value="healthcare">Healthcare</option>
							<option value="finance">Finance</option>
							<option value="retail">Retail</option>
							<option value="education">Education</option>
						</select>
					</div>
					
					<div>
						<label for="description" class="block text-sm font-medium mb-2">
							Description
						</label>
						<Textarea 
							id="description"
							bind:value={description}
							placeholder="Describe your business..."
							rows={4}
						/>
					</div>
					
					<Button class="w-full">
						Test Submit
					</Button>
				</div>
			</Card>
			
			<Card class="p-6 mt-6">
				<h2 class="text-xl font-semibold mb-4">Current Values</h2>
				<div class="space-y-2">
					<p><strong>Business Name:</strong> {businessName || 'Not set'}</p>
					<p><strong>Industry:</strong> {industry || 'Not selected'}</p>
					<p><strong>Description:</strong> {description || 'Not provided'}</p>
				</div>
			</Card>
		</div>
	</div>
</div>
