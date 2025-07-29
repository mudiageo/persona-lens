<script lang="ts">
	import { onMount } from 'svelte';
	import { apiClient } from '$lib/api/client';
	import { apiLoadingStates } from '$lib/stores/loading';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	
	let apiTestResult: any = null;
	let personaResult: any = null;
	let testForm = {
		target_description: 'Tech-savvy millennials interested in sustainable lifestyle and wellness',
		cultural_context: 'Urban professionals in major metropolitan areas',
		business_context: 'Health and wellness brand targeting eco-conscious consumers'
	};

	$: loadingStates = $apiLoadingStates;

	async function testAPIs() {
		apiTestResult = null;
		const result = await apiClient.testAPIConnections();
		apiTestResult = result;
	}

	async function generateTestPersona() {
		personaResult = null;
		const result = await apiClient.generatePersona({
			target_description: testForm.target_description,
			cultural_context: testForm.cultural_context,
			business_context: testForm.business_context,
			research_goals: ['Brand positioning', 'Content strategy', 'Product development']
		});
		personaResult = result;
	}

	onMount(() => {
		// Auto-test APIs on mount
		testAPIs();
	});
</script>

<svelte:head>
	<title>API Test - PersonaLens</title>
</svelte:head>

<div class="container mx-auto px-4 py-16">
	<div class="mx-auto max-w-4xl">
		<div class="text-center mb-16">
			<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
				API Integration
				<span class="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
					Testing
				</span>
			</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
				Test the LLM and Qloo API integrations for PersonaLens.
			</p>
		</div>

		<!-- API Connection Test -->
		<Card class="p-8 mb-8">
			<h2 class="text-2xl font-bold mb-4">API Connection Test</h2>
			
			<div class="flex items-center gap-4 mb-4">
				<Button 
					on:click={testAPIs} 
					disabled={loadingStates['api-test']?.isLoading}
					class="min-w-[120px]"
				>
					{#if loadingStates['api-test']?.isLoading}
						Testing...
					{:else}
						Test APIs
					{/if}
				</Button>
				
				{#if loadingStates['api-test']?.error}
					<span class="text-destructive text-sm">
						Error: {loadingStates['api-test'].error.message}
					</span>
				{/if}
			</div>

			{#if apiTestResult}
				<div class="bg-muted p-4 rounded-md">
					<h3 class="font-semibold mb-2">Test Results:</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div class="space-y-2">
							<h4 class="font-medium">LLM APIs:</h4>
							<div class="flex items-center gap-2">
								<span class="font-medium">OpenAI:</span>
								<span class="px-2 py-1 rounded text-xs {apiTestResult.success && apiTestResult.data?.llm?.openai ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
									{apiTestResult.success && apiTestResult.data?.llm?.openai ? 'Connected' : 'Failed'}
								</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="font-medium">Anthropic:</span>
								<span class="px-2 py-1 rounded text-xs {apiTestResult.success && apiTestResult.data?.llm?.anthropic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
									{apiTestResult.success && apiTestResult.data?.llm?.anthropic ? 'Connected' : 'Failed'}
								</span>
							</div>
							<div class="flex items-center gap-2">
								<span class="font-medium">Gemini:</span>
								<span class="px-2 py-1 rounded text-xs {apiTestResult.success && apiTestResult.data?.llm?.gemini ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
									{apiTestResult.success && apiTestResult.data?.llm?.gemini ? 'Connected' : 'Failed'}
								</span>
							</div>
						</div>
						<div class="space-y-2">
							<h4 class="font-medium">Other APIs:</h4>
							<div class="flex items-center gap-2">
								<span class="font-medium">Qloo API:</span>
								<span class="px-2 py-1 rounded text-xs {apiTestResult.success && apiTestResult.data?.qloo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
									{apiTestResult.success && apiTestResult.data?.qloo ? 'Connected' : 'Failed'}
								</span>
							</div>
						</div>
					</div>
					{#if apiTestResult.message}
						<p class="mt-2 text-sm text-muted-foreground">{apiTestResult.message}</p>
					{/if}
				</div>
			{/if}
		</Card>

		<!-- Persona Generation Test -->
		<Card class="p-8 mb-8">
			<h2 class="text-2xl font-bold mb-4">Persona Generation Test</h2>
			
			<div class="space-y-4 mb-6">
				<div>
					<label for="target-description" class="block text-sm font-medium mb-2">Target Description:</label>
					<textarea 
						id="target-description"
						bind:value={testForm.target_description}
						class="w-full p-3 border border-input rounded-md bg-background"
						rows="3"
						placeholder="Describe your target audience..."
					></textarea>
				</div>
				
				<div>
					<label for="cultural-context" class="block text-sm font-medium mb-2">Cultural Context:</label>
					<input 
						id="cultural-context"
						bind:value={testForm.cultural_context}
						class="w-full p-3 border border-input rounded-md bg-background"
						placeholder="Cultural context..."
					/>
				</div>
				
				<div>
					<label for="business-context" class="block text-sm font-medium mb-2">Business Context:</label>
					<input 
						id="business-context"
						bind:value={testForm.business_context}
						class="w-full p-3 border border-input rounded-md bg-background"
						placeholder="Business context..."
					/>
				</div>
			</div>

			<div class="flex items-center gap-4 mb-4">
				<Button 
					on:click={generateTestPersona} 
					disabled={loadingStates['persona-generation']?.isLoading}
					class="min-w-[150px]"
				>
					{#if loadingStates['persona-generation']?.isLoading}
						Generating...
					{:else}
						Generate Persona
					{/if}
				</Button>
				
				{#if loadingStates['persona-generation']?.isLoading}
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
						<span>{loadingStates['persona-generation']?.stage || 'Processing...'}</span>
						{#if loadingStates['persona-generation']?.progress}
							<span>({loadingStates['persona-generation'].progress}%)</span>
						{/if}
					</div>
				{/if}
				
				{#if loadingStates['persona-generation']?.error}
					<span class="text-destructive text-sm">
						Error: {loadingStates['persona-generation'].error.message}
					</span>
				{/if}
			</div>

			{#if personaResult}
				<div class="bg-muted p-4 rounded-md">
					<h3 class="font-semibold mb-2">Generated Persona:</h3>
					{#if personaResult.success}
						<div class="space-y-3 text-sm">
							<div>
								<span class="font-medium">Name:</span> {personaResult.data.name}
							</div>
							<div>
								<span class="font-medium">Confidence Score:</span> {Math.round(personaResult.data.confidence_score * 100)}%
							</div>
							<div>
								<span class="font-medium">Cultural Attributes:</span>
								<ul class="mt-1 ml-4 list-disc">
									{#each personaResult.data.cultural_attributes.values as value}
										<li>{value}</li>
									{/each}
								</ul>
							</div>
							<div>
								<span class="font-medium">Summary:</span>
								<p class="mt-1">{personaResult.data.insights.summary}</p>
							</div>
						</div>
					{:else}
						<p class="text-destructive">{personaResult.error}</p>
					{/if}
				</div>
			{/if}
		</Card>

		<!-- Environment Variables Check -->
		<Card class="p-8">
			<h2 class="text-2xl font-bold mb-4">Setup Instructions</h2>
			<div class="prose prose-sm max-w-none">
				<p>To test the API integrations, make sure you have the following environment variables set:</p>
				<ul>
					<li><code>OPENAI_API_KEY</code> - Your OpenAI API key</li>
					<li><code>ANTHROPIC_API_KEY</code> - Your Anthropic API key</li>
					<li><code>GEMINI_API_KEY</code> - Your Google Gemini API key</li>
					<li><code>QLOO_API_KEY</code> - Your Qloo API key</li>
					<li><code>QLOO_API_URL</code> - Qloo API base URL (default: https://api.qloo.com/v1)</li>
				</ul>
				<p>Create a <code>.env</code> file in your project root with these variables.</p>
				<p><strong>Note:</strong> You can use any combination of the LLM providers. The system will gracefully handle missing API keys.</p>
			</div>
		</Card>
	</div>
</div>
