<script lang="ts">
	interface Props {
		value?: number;
		max?: number;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
		showLabel?: boolean;
		label?: string;
		class?: string;
	}

	let {
		value = 0,
		max = 100,
		size = 'md',
		variant = 'default',
		showLabel = false,
		label = '',
		class: className = '',
		...restProps
	}: Props = $props();

	const percentage = $derived(Math.min(Math.max((value / max) * 100, 0), 100));
	
	const sizeClasses = {
		sm: 'h-1',
		md: 'h-2',
		lg: 'h-3'
	};
	
	const variantClasses = {
		default: 'bg-primary',
		secondary: 'bg-secondary',
		success: 'bg-green-500',
		warning: 'bg-yellow-500',
		destructive: 'bg-destructive'
	};
</script>

<div class="w-full space-y-1">
	{#if showLabel || label}
		<div class="flex justify-between text-sm">
			<span class="text-muted-foreground">{label}</span>
			<span class="text-muted-foreground">{Math.round(percentage)}%</span>
		</div>
	{/if}
	
	<div 
		class="w-full bg-muted rounded-full overflow-hidden {sizeClasses[size]} {className}"
		{...restProps}
	>
		<div 
			class="h-full rounded-full transition-all duration-300 ease-out {variantClasses[variant]}"
			style="width: {percentage}%"
		></div>
	</div>
</div>
