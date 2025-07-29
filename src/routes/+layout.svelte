<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/navigation.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-background">
	<Navigation />
	<main>
		{@render children()}
	</main>
</div>
