<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className, children, ...props }: Props = $props();
</script>

<div class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props}>
	{@render children()}
</div>
