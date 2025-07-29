<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
</script>

<section class="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 sm:py-32">
	<div class="container mx-auto px-4">
		<div class="mx-auto max-w-4xl text-center">
			<!-- Hero Content -->
			<div class="mb-8">
				<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
					Understand Your
					<span class="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
						Audience
					</span>
					Like Never Before
				</h1>
				<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
					PersonaLens uses AI to create detailed cultural personas based on taste profiles, 
					helping businesses make strategic decisions with deeper audience insights.
				</p>
			</div>

			<!-- CTA Buttons -->
			<div class="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
				<Button size="lg" class="px-8">
					Start Free Trial
				</Button>
				<Button variant="outline" size="lg" class="px-8">
					Watch Demo
				</Button>
			</div>

			<!-- Features Preview -->
			<div class="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<Card class="p-6">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
					</div>
					<h3 class="text-lg font-semibold">AI-Powered Analysis</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Advanced algorithms analyze cultural patterns and taste profiles to create accurate personas.
					</p>
				</Card>

				<Card class="p-6">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
						<svg class="h-6 w-6 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
					</div>
					<h3 class="text-lg font-semibold">Cultural Personas</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Detailed profiles that capture cultural nuances, preferences, and behavioral patterns.
					</p>
				</Card>

				<Card class="p-6">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
						<svg class="h-6 w-6 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<h3 class="text-lg font-semibold">Strategic Insights</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Actionable recommendations for marketing, product development, and business strategy.
					</p>
				</Card>
			</div>
		</div>
	</div>

	<!-- Background decoration -->
	<div class="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl">
		<div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-chart-1 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
	</div>
</section>
