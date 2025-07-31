<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { qlooService, QlooApiError } from '$lib/api/qloo';
	import type { QlooEntityType } from '$lib/types/qloo';
	
	let initialized = false;
	let loading = false;
	let error = '';
	let results: any = null;
	let apiKey = '';
	
	// Demo inputs
	let searchQuery = 'Marvel movies';
	let entityId = '';
	let selectedEntityType: QlooEntityType = 'urn:entity:movie';
	let selectedRegion = 'North America';
	
	const entityTypes: Array<{ value: QlooEntityType; label: string }> = [
		{ value: 'urn:entity:movie', label: 'Movies' },
		{ value: 'urn:entity:tv_show', label: 'TV Shows' },
		{ value: 'urn:entity:book', label: 'Books' },
		{ value: 'urn:entity:artist', label: 'Artists' },
		{ value: 'urn:entity:brand', label: 'Brands' },
		{ value: 'urn:entity:destination', label: 'Destinations' }
	];
	
	const regions = [
		'North America',
		'Europe', 
		'Asia',
		'Latin America',
		'Middle East',
		'Africa'
	];
	
	let activeDemo = 'search';
	const demos = [
		{ id: 'search', label: 'Entity Search', description: 'Search for entities by name' },
		{ id: 'taste', label: 'Taste Analysis', description: 'Analyze taste profiles' },
		{ id: 'demographics', label: 'Demographics', description: 'Analyze demographic data' },
		{ id: 'cross-domain', label: 'Cross-Domain', description: 'Find cross-domain affinities' },
		{ id: 'cultural', label: 'Cultural Context', description: 'Analyze cultural preferences' },
		{ id: 'recommendations', label: 'Multi-Dimensional', description: 'Advanced recommendations' }
	];
	
	async function initializeQloo() {
		if (!apiKey.trim()) {
			error = 'Please enter your Qloo API key';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			await qlooService.initialize({
				apiKey: apiKey.trim(),
				isHackathon: true // Use hackathon environment
			});
			initialized = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to initialize Qloo service';
		} finally {
			loading = false;
		}
	}
	
	async function runDemo() {
		if (!initialized) {
			error = 'Please initialize the Qloo service first';
			return;
		}
		
		loading = true;
		error = '';
		results = null;
		
		try {
			switch (activeDemo) {
				case 'search':
					results = await qlooService.searchEntities(searchQuery, [selectedEntityType.replace('urn:entity:', '')], 10);
					break;
					
				case 'taste':
					if (!entityId) {
						error = 'Please enter an entity ID for taste analysis';
						return;
					}
					results = await qlooService.analyzeTasteProfile({ entities: [entityId] });
					break;
					
				case 'demographics':
					if (!entityId) {
						error = 'Please enter an entity ID for demographic analysis';
						return;
					}
					results = await qlooService.analyzeDemographicProfile({ entities: [entityId] });
					break;
					
				case 'cross-domain':
					if (!entityId) {
						error = 'Please enter an entity ID for cross-domain analysis';
						return;
					}
					results = await qlooService.getCrossDomainAffinities(entityId);
					break;
					
				case 'cultural':
					results = await qlooService.analyzeCulturalContext({ query: selectedRegion }, selectedEntityType);
					break;
					
				case 'recommendations':
					results = await qlooService.getMultiDimensionalRecommendations(
						{ 
							entities: entityId ? [entityId] : undefined,
							location: { query: selectedRegion }
						},
						selectedEntityType,
						15
					);
					break;
					
				default:
					error = 'Unknown demo type';
					return;
			}
		} catch (err) {
			if (err instanceof QlooApiError) {
				error = `Qloo API Error: ${err.message}`;
			} else {
				error = err instanceof Error ? err.message : 'Unknown error occurred';
			}
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Qloo API Demo - PersonaLens</title>
	<meta name="description" content="Test and explore Qloo API functionality" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background to-muted/20">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-6xl">
			<!-- Header -->
			<div class="text-center mb-8">
				<h1 class="text-4xl font-bold mb-4">Qloo API Demo</h1>
				<p class="text-xl text-muted-foreground">
					Test and explore comprehensive Qloo API functionality
				</p>
			</div>

			<!-- API Key Input -->
			{#if !initialized}
				<Card class="p-6 mb-8">
					<h2 class="text-2xl font-semibold mb-4">Initialize Qloo Service</h2>
					<div class="space-y-4">
						<div>
							<label for="api-key" class="block text-sm font-medium mb-2">
								Qloo API Key
							</label>
							<Input
								id="api-key"
								type="password"
								bind:value={apiKey}
								placeholder="Enter your Qloo API key"
								class="max-w-md"
							/>
							<p class="text-sm text-muted-foreground mt-1">
								Get your API key from the Qloo hackathon or contact Qloo support
							</p>
						</div>
						
						<Button on:click={initializeQloo} disabled={loading}>
							{loading ? 'Initializing...' : 'Initialize Qloo Service'}
						</Button>
					</div>
				</Card>
			{/if}

			{#if initialized}
				<!-- Demo Navigation -->
				<Card class="p-6 mb-8">
					<h2 class="text-2xl font-semibold mb-4">API Features</h2>
					<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
						{#each demos as demo}
							<button
								class="p-4 border rounded-lg text-left transition-colors hover:bg-muted/50
									{activeDemo === demo.id ? 'border-primary bg-primary/5' : 'border-border'}"
								on:click={() => { activeDemo = demo.id; results = null; error = ''; }}
							>
								<div class="font-medium">{demo.label}</div>
								<div class="text-sm text-muted-foreground">{demo.description}</div>
							</button>
						{/each}
					</div>
				</Card>

				<!-- Demo Configuration -->
				<Card class="p-6 mb-8">
					<h3 class="text-xl font-semibold mb-4">Demo Configuration</h3>
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<!-- Search Query -->
						{#if activeDemo === 'search'}
							<div>
								<label class="block text-sm font-medium mb-2">Search Query</label>
								<Input bind:value={searchQuery} placeholder="e.g., Marvel movies" />
							</div>
						{/if}

						<!-- Entity ID -->
						{#if ['taste', 'demographics', 'cross-domain'].includes(activeDemo)}
							<div>
								<label class="block text-sm font-medium mb-2">Entity ID</label>
								<Input bind:value={entityId} placeholder="e.g., entity-id-123" />
								<p class="text-xs text-muted-foreground">Use search to find entity IDs</p>
							</div>
						{/if}

						<!-- Entity Type -->
						<div>
							<label class="block text-sm font-medium mb-2">Entity Type</label>
							<select 
								bind:value={selectedEntityType}
								class="w-full px-3 py-2 border border-input bg-background rounded-md"
							>
								{#each entityTypes as type}
									<option value={type.value}>{type.label}</option>
								{/each}
							</select>
						</div>

						<!-- Region -->
						{#if ['cultural', 'recommendations'].includes(activeDemo)}
							<div>
								<label class="block text-sm font-medium mb-2">Region</label>
								<select 
									bind:value={selectedRegion}
									class="w-full px-3 py-2 border border-input bg-background rounded-md"
								>
									{#each regions as region}
										<option value={region}>{region}</option>
									{/each}
								</select>
							</div>
						{/if}
					</div>

					<div class="mt-6">
						<Button on:click={runDemo} disabled={loading} class="w-full md:w-auto">
							{loading ? 'Running Demo...' : `Run ${demos.find(d => d.id === activeDemo)?.label} Demo`}
						</Button>
					</div>
				</Card>

				<!-- Error Display -->
				{#if error}
					<Card class="p-6 mb-8 border-destructive bg-destructive/5">
						<h3 class="text-lg font-semibold text-destructive mb-2">Error</h3>
						<p class="text-destructive">{error}</p>
					</Card>
				{/if}

				<!-- Results Display -->
				{#if results}
					<Card class="p-6 mb-8">
						<h3 class="text-xl font-semibold mb-4">Results</h3>
						
						{#if activeDemo === 'search' && results.results?.entities}
							<div class="space-y-4">
								<p class="text-sm text-muted-foreground">
									Found {results.results.entities.length} entities
								</p>
								{#each results.results.entities.slice(0, 10) as entity}
									<div class="border rounded-lg p-4">
										<div class="flex items-start justify-between">
											<div>
												<h4 class="font-medium">{entity.name}</h4>
												<p class="text-sm text-muted-foreground">ID: {entity.entity_id}</p>
												{#if entity.properties?.release_year}
													<p class="text-sm text-muted-foreground">Year: {entity.properties.release_year}</p>
												{/if}
											</div>
											<Badge variant="secondary">{entity.subtype?.replace('urn:entity:', '') || 'Entity'}</Badge>
										</div>
										{#if entity.properties?.description}
											<p class="text-sm mt-2">{entity.properties.description.slice(0, 200)}...</p>
										{/if}
									</div>
								{/each}
							</div>

						{:else if activeDemo === 'taste' && results.taste_tags}
							<div class="space-y-4">
								<div>
									<h4 class="font-medium mb-2">Taste Tags ({results.taste_tags.length})</h4>
									<div class="flex flex-wrap gap-2">
										{#each results.taste_tags.slice(0, 20) as tag}
											<Badge variant="outline">{tag.name}</Badge>
										{/each}
									</div>
								</div>
								
								{#if results.demographic_alignment?.query}
									<div>
										<h4 class="font-medium mb-2">Demographics</h4>
										<div class="grid gap-2 md:grid-cols-2">
											{#if results.demographic_alignment.query.age}
												<div>
													<span class="text-sm font-medium">Age Distribution:</span>
													{#each Object.entries(results.demographic_alignment.query.age) as [age, score]}
														<div class="text-sm">{age}: {(score * 100).toFixed(1)}%</div>
													{/each}
												</div>
											{/if}
											{#if results.demographic_alignment.query.gender}
												<div>
													<span class="text-sm font-medium">Gender Distribution:</span>
													{#each Object.entries(results.demographic_alignment.query.gender) as [gender, score]}
														<div class="text-sm">{gender}: {(score * 100).toFixed(1)}%</div>
													{/each}
												</div>
											{/if}
										</div>
									</div>
								{/if}
							</div>

						{:else if activeDemo === 'demographics'}
							<div class="space-y-4">
								<div class="grid gap-4 md:grid-cols-2">
									<div>
										<h4 class="font-medium mb-2">Age Distribution</h4>
										{#each Object.entries(results.age_distribution) as [age, score]}
											<div class="flex justify-between text-sm">
												<span>{age.replace('_', ' ')}</span>
												<span>{(score * 100).toFixed(1)}%</span>
											</div>
										{/each}
									</div>
									<div>
										<h4 class="font-medium mb-2">Gender Distribution</h4>
										{#each Object.entries(results.gender_distribution) as [gender, score]}
											<div class="flex justify-between text-sm">
												<span>{gender}</span>
												<span>{(score * 100).toFixed(1)}%</span>
											</div>
										{/each}
									</div>
								</div>
								<div class="grid gap-2 md:grid-cols-3">
									<div>
										<span class="text-sm font-medium">Dominant Age:</span>
										<Badge variant="secondary">{results.dominant_age_group}</Badge>
									</div>
									<div>
										<span class="text-sm font-medium">Dominant Gender:</span>
										<Badge variant="secondary">{results.dominant_gender}</Badge>
									</div>
									<div>
										<span class="text-sm font-medium">Diversity Score:</span>
										<Badge variant="outline">{(results.diversity_score * 100).toFixed(1)}%</Badge>
									</div>
								</div>
							</div>

						{:else if activeDemo === 'cross-domain' && results.domain_affinities}
							<div class="space-y-4">
								<p class="text-sm text-muted-foreground">
									Cross-domain affinities for {results.source_entity?.name || 'entity'}
								</p>
								{#each Object.entries(results.domain_affinities) as [domain, data]}
									<div class="border rounded-lg p-4">
										<div class="flex items-center justify-between mb-2">
											<h4 class="font-medium">{domain.replace('urn:entity:', '').toUpperCase()}</h4>
											<Badge variant="outline">
												Avg: {(data.average_affinity * 100).toFixed(1)}%
											</Badge>
										</div>
										<div class="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
											{#each data.entities.slice(0, 6) as entity}
												<div class="text-sm p-2 bg-muted/30 rounded">
													{entity.name}
												</div>
											{/each}
										</div>
									</div>
								{/each}
							</div>

						{:else if activeDemo === 'cultural'}
							<div class="space-y-4">
								<div>
									<h4 class="font-medium mb-2">Cultural Profile for {results.region}</h4>
									<div class="grid gap-4 md:grid-cols-2">
										<div>
											<span class="text-sm font-medium">Cultural Markers ({results.cultural_markers?.length || 0})</span>
											<div class="flex flex-wrap gap-1 mt-1">
												{#each (results.cultural_markers || []).slice(0, 10) as marker}
													<Badge variant="outline" class="text-xs">{marker.name}</Badge>
												{/each}
											</div>
										</div>
										<div>
											<span class="text-sm font-medium">Local Preferences ({results.local_preferences?.length || 0})</span>
											<div class="space-y-1 mt-1">
												{#each (results.local_preferences || []).slice(0, 5) as pref}
													<div class="text-xs p-1 bg-muted/30 rounded">{pref.name}</div>
												{/each}
											</div>
										</div>
									</div>
								</div>
							</div>

						{:else if activeDemo === 'recommendations'}
							<div class="space-y-4">
								<div>
									<h4 class="font-medium mb-2">Multi-Dimensional Recommendations</h4>
									<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										{#each (results.recommendations || []).slice(0, 9) as rec}
											<div class="border rounded-lg p-3">
												<h5 class="font-medium text-sm">{rec.name}</h5>
												{#if rec.properties?.release_year}
													<p class="text-xs text-muted-foreground">({rec.properties.release_year})</p>
												{/if}
											</div>
										{/each}
									</div>
								</div>
								
								{#if results.taste_based?.length}
									<div>
										<h4 class="font-medium mb-2">Taste-Based ({results.taste_based.length})</h4>
										<div class="flex flex-wrap gap-2">
											{#each results.taste_based.slice(0, 5) as item}
												<Badge variant="secondary" class="text-xs">{item.name}</Badge>
											{/each}
										</div>
									</div>
								{/if}
							</div>

						{:else}
							<div class="bg-muted/20 rounded-lg p-4">
								<h4 class="font-medium mb-2">Raw Response</h4>
								<pre class="text-xs overflow-auto">{JSON.stringify(results, null, 2)}</pre>
							</div>
						{/if}
					</Card>
				{/if}
			{/if}

			<!-- Documentation -->
			<Card class="p-6">
				<h2 class="text-2xl font-semibold mb-4">Qloo API Features Implemented</h2>
				<div class="grid gap-6 md:grid-cols-2">
					<div class="space-y-4">
						<div>
							<h3 class="text-lg font-semibold">✅ Taste Profile Analysis</h3>
							<ul class="text-sm text-muted-foreground space-y-1">
								<li>• Analyze taste profiles for entities</li>
								<li>• Get taste tags and keywords</li>
								<li>• Compare taste similarity</li>
								<li>• Category-specific insights</li>
							</ul>
						</div>
						
						<div>
							<h3 class="text-lg font-semibold">✅ Demographic Analysis</h3>
							<ul class="text-sm text-muted-foreground space-y-1">
								<li>• Age and gender distribution</li>
								<li>• Demographic profile comparison</li>
								<li>• Audience alignment analysis</li>
								<li>• Demographic trends</li>
							</ul>
						</div>
						
						<div>
							<h3 class="text-lg font-semibold">✅ Cross-Domain Affinity</h3>
							<ul class="text-sm text-muted-foreground space-y-1">
								<li>• Cross-domain entity relationships</li>
								<li>• Find influencers across domains</li>
								<li>• Affinity cluster analysis</li>
								<li>• Recommendation bridges</li>
							</ul>
						</div>
					</div>
					
					<div class="space-y-4">
						<div>
							<h3 class="text-lg font-semibold">✅ Cultural Context Analysis</h3>
							<ul class="text-sm text-muted-foreground space-y-1">
								<li>• Location-based preferences</li>
								<li>• Cultural sentiment analysis</li>
								<li>• Global trend analysis</li>
								<li>• Cultural adaptation recommendations</li>
							</ul>
						</div>
						
						<div>
							<h3 class="text-lg font-semibold">✅ Advanced Features</h3>
							<ul class="text-sm text-muted-foreground space-y-1">
								<li>• Multi-dimensional recommendations</li>
								<li>• Comprehensive entity analysis</li>
								<li>• Cultural market analysis</li>
								<li>• Proper error handling</li>
							</ul>
						</div>
						
						<div>
							<h3 class="text-lg font-semibold">✅ Core API Integration</h3>
							<ul class="text-sm text-muted-foreground space-y-1">
								<li>• Entity search and lookup</li>
								<li>• Tag and audience search</li>
								<li>• Trending content retrieval</li>
								<li>• Hackathon environment support</li>
							</ul>
						</div>
					</div>
				</div>
			</Card>
		</div>
	</div>
</div>
