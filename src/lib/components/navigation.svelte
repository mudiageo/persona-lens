<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';

	const navItems = [
		{ name: 'Home', href: '/' },
		{ name: 'Features', href: '/features' },
		{ name: 'Components', href: '/components' },
		{ name: 'Pricing', href: '/pricing' },
		{ name: 'About', href: '/about' },
		{ name: 'API Test', href: '/test' }
	];
</script>

<nav class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="container mx-auto px-4">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<div class="flex items-center space-x-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<span class="font-bold text-sm">PL</span>
				</div>
				<span class="text-xl font-bold">PersonaLens</span>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center space-x-8">
				{#each navItems as item}
					<a
						href={item.href}
						class="text-sm font-medium transition-colors hover:text-primary {$page.url.pathname === item.href ? 'text-primary' : 'text-muted-foreground'}"
					>
						{item.name}
					</a>
				{/each}
			</div>

			<!-- CTA Button -->
			<div class="flex items-center space-x-4">
				<Button variant="outline" size="sm">
					Sign In
				</Button>
				<Button size="sm">
					Get Started
				</Button>
			</div>
		</div>
	</div>
</nav>
