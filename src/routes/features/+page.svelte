<script lang="ts">
	import {Card} from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Features - PersonaLens</title>
	<meta name="description" content="Discover the powerful features of PersonaLens AI-powered market research platform." />
</svelte:head>

<div class="container mx-auto px-4 py-16">
	<div class="mx-auto max-w-4xl text-center">
		<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
			Powerful Features for
			<span class="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
				Market Research
			</span>
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
			PersonaLens combines artificial intelligence with cultural analysis to provide 
			comprehensive insights into your target audiences.
		</p>
	</div>

	<div class="mt-16 grid gap-8 lg:grid-cols-2">
		<Card class="p-8">
			<div class="flex items-start space-x-4">
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
					<svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
					</svg>
				</div>
				<div>
					<h3 class="text-xl font-semibold">AI-Powered Insights</h3>
					<p class="mt-2 text-muted-foreground">
						Advanced machine learning algorithms analyze vast amounts of cultural data to identify patterns and trends in consumer behavior.
					</p>
				</div>
			</div>
		</Card>

		<Card class="p-8">
			<div class="flex items-start space-x-4">
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
					<svg class="h-6 w-6 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
				<div>
					<h3 class="text-xl font-semibold">Detailed Personas</h3>
					<p class="mt-2 text-muted-foreground">
						Create comprehensive user personas that include cultural context, behavioral patterns, and preference profiles.
					</p>
				</div>
			</div>
		</Card>

		<Card class="p-8">
			<div class="flex items-start space-x-4">
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
					<svg class="h-6 w-6 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<div>
					<h3 class="text-xl font-semibold">Real-Time Analytics</h3>
					<p class="mt-2 text-muted-foreground">
						Monitor audience trends and cultural shifts with real-time data visualization and reporting tools.
					</p>
				</div>
			</div>
		</Card>

		<Card class="p-8">
			<div class="flex items-start space-x-4">
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chart-4/10">
					<svg class="h-6 w-6 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<div>
					<h3 class="text-xl font-semibold">Strategic Recommendations</h3>
					<p class="mt-2 text-muted-foreground">
						Get actionable insights for marketing campaigns, product development, and business strategy decisions.
					</p>
				</div>
			</div>
		</Card>
	</div>
</div>
