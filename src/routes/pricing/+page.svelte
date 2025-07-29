<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';

	const plans = [
		{
			name: 'Starter',
			price: '$29',
			period: 'per month',
			description: 'Perfect for small businesses and startups',
			features: [
				'Up to 5 personas per month',
				'Basic cultural insights',
				'Email support',
				'Standard reporting'
			],
			popular: false
		},
		{
			name: 'Professional',
			price: '$99',
			period: 'per month',
			description: 'Ideal for growing businesses and agencies',
			features: [
				'Up to 25 personas per month',
				'Advanced cultural analysis',
				'Priority support',
				'Custom reporting',
				'API access',
				'Team collaboration'
			],
			popular: true
		},
		{
			name: 'Enterprise',
			price: 'Custom',
			period: 'contact us',
			description: 'For large organizations with specific needs',
			features: [
				'Unlimited personas',
				'Custom AI models',
				'Dedicated support',
				'White-label options',
				'On-premise deployment',
				'Custom integrations'
			],
			popular: false
		}
	];
</script>

<svelte:head>
	<title>Pricing - PersonaLens</title>
	<meta name="description" content="Choose the perfect plan for your market research needs with PersonaLens flexible pricing options." />
</svelte:head>

<div class="container mx-auto px-4 py-16">
	<div class="mx-auto max-w-4xl text-center">
		<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
			Simple, Transparent
			<span class="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
				Pricing
			</span>
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
			Choose the plan that fits your business needs. All plans include our core AI-powered 
			persona generation and cultural analysis features.
		</p>
	</div>

	<div class="mt-16 grid gap-8 lg:grid-cols-3">
		{#each plans as plan}
			<Card class="relative p-8 {plan.popular ? 'border-primary shadow-lg' : ''}">
				{#if plan.popular}
					<div class="absolute -top-3 left-1/2 -translate-x-1/2">
						<span class="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
							Most Popular
						</span>
					</div>
				{/if}

				<div class="text-center">
					<h3 class="text-2xl font-bold">{plan.name}</h3>
					<div class="mt-4">
						<span class="text-4xl font-bold">{plan.price}</span>
						<span class="text-muted-foreground">/{plan.period}</span>
					</div>
					<p class="mt-4 text-muted-foreground">{plan.description}</p>
				</div>

				<ul class="mt-8 space-y-3">
					{#each plan.features as feature}
						<li class="flex items-center">
							<svg class="h-5 w-5 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<span class="text-sm">{feature}</span>
						</li>
					{/each}
				</ul>

				<div class="mt-8">
					<Button 
						class="w-full {plan.popular ? '' : 'variant-outline'}"
						variant={plan.popular ? 'default' : 'outline'}
					>
						{plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
					</Button>
				</div>
			</Card>
		{/each}
	</div>

	<div class="mt-16 text-center">
		<p class="text-muted-foreground">
			All plans include a 14-day free trial. No credit card required.
		</p>
	</div>
</div>
