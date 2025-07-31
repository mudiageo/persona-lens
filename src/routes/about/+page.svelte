<script lang="ts">
	import { Card } from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>About - PersonaLens</title>
	<meta name="description" content="Learn about PersonaLens mission to revolutionize market research through AI-powered cultural analysis." />
</svelte:head>

<div class="container mx-auto px-4 py-16">
	<div class="mx-auto max-w-4xl">
		<div class="text-center mb-16">
			<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
				About
				<span class="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
					PersonaLens
				</span>
			</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
				We're revolutionizing market research by combining artificial intelligence with 
				deep cultural analysis to help businesses truly understand their audiences.
			</p>
		</div>

		<div class="prose prose-lg mx-auto mb-16">
			<Card class="p-8">
				<h2 class="text-2xl font-bold mb-4">Our Mission</h2>
				<p class="text-muted-foreground leading-relaxed">
					At PersonaLens, we believe that understanding your audience goes beyond demographics 
					and basic behavioral data. Culture, taste, and personal values drive consumer decisions 
					in ways that traditional market research often misses.
				</p>
				<p class="text-muted-foreground leading-relaxed mt-4">
					Our AI-powered platform analyzes cultural patterns, taste profiles, and behavioral 
					nuances to create detailed personas that provide actionable insights for strategic 
					business decisions.
				</p>
			</Card>
		</div>

		<div class="grid gap-8 md:grid-cols-2 mb-16">
			<Card class="p-8">
				<h3 class="text-xl font-bold mb-4">Why PersonaLens?</h3>
				<ul class="space-y-3 text-muted-foreground">
					<li class="flex items-start">
						<span class="text-primary mr-2">•</span>
						Deep cultural insights beyond traditional demographics
					</li>
					<li class="flex items-start">
						<span class="text-primary mr-2">•</span>
						AI-powered analysis for accurate persona generation
					</li>
					<li class="flex items-start">
						<span class="text-primary mr-2">•</span>
						Actionable recommendations for marketing and strategy
					</li>
					<li class="flex items-start">
						<span class="text-primary mr-2">•</span>
						Real-time insights and trend monitoring
					</li>
				</ul>
			</Card>

			<Card class="p-8">
				<h3 class="text-xl font-bold mb-4">Our Approach</h3>
				<ul class="space-y-3 text-muted-foreground">
					<li class="flex items-start">
						<span class="text-chart-2 mr-2">•</span>
						Analyze taste profiles and cultural preferences
					</li>
					<li class="flex items-start">
						<span class="text-chart-2 mr-2">•</span>
						Map behavioral patterns and decision drivers
					</li>
					<li class="flex items-start">
						<span class="text-chart-2 mr-2">•</span>
						Generate comprehensive audience personas
					</li>
					<li class="flex items-start">
						<span class="text-chart-2 mr-2">•</span>
						Provide strategic insights and recommendations
					</li>
				</ul>
			</Card>
		</div>

		<Card class="p-8 text-center">
			<h3 class="text-2xl font-bold mb-4">Ready to Get Started?</h3>
			<p class="text-muted-foreground mb-6">
				Join businesses worldwide who are making better decisions with PersonaLens.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/" class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
					Start Free Trial
				</a>
				<a href="/features" class="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
					Learn More
				</a>
			</div>
		</Card>
	</div>
</div>
