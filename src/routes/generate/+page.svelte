<script lang="ts">
	import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { FormButton } from '$lib/components/ui/form';
	import ProgressBar from '$lib/components/ui/progress-bar.svelte';
	import InsightPanel from '$lib/components/insight-panel.svelte';
	import BusinessInfoStep from './steps/BusinessInfoStep.svelte';
	import TargetAudienceStep from './steps/TargetAudienceStep.svelte';
	import ProductDetailsStep from './steps/ProductDetailsStep.svelte';
	import ResearchGoalsStep from './steps/ResearchGoalsStep.svelte';
	import { personaGenerationSchema, formSteps, getNextStep, getPreviousStep } from '$lib/schemas/persona-form';
	import type { StepId, PersonaGenerationData } from '$lib/schemas/persona-form';
	import type { PersonaProfile } from '$lib/types/api';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let currentStepId = $state<StepId>('business-info');
	let generatedPersona = $state<PersonaProfile | null>(null);
	let isGenerating = $state(false);
	let generationError = $state<string | null>(null);

	const form = superForm(data.form, {
		validators: zodClient(personaGenerationSchema),
		dataType: 'json',
		onSubmit: async () => {
			isGenerating = true;
			generationError = null;
			generatedPersona = null;		
		},
		onResult: ({ result }) => {
			console.log('Form submission result:', result);
			if (result.type === 'success' && result.data?.persona) {
				generatedPersona = result.data.persona;
			} else if (result.type === 'error') {
				generationError = result.message || 'Failed to generate persona';
			}
			isGenerating = false;
		},
		onUpdated: ({ form }: { form: SuperValidated<Infer<typeof personaGenerationSchema>> }) => {
			if (form.message) {
				console.log(form.message);
			}
		}
	});
	
	const { form: formData, errors, enhance, submitting, delayed } = form


	const currentStep = $derived(formSteps.find(s => s.id === currentStepId)!);
	const currentStepIndex = $derived(formSteps.findIndex(s => s.id === currentStepId));
	const progress = $derived(((currentStepIndex + 1) / formSteps.length) * 100);

	function nextStep() {
		const next = getNextStep(currentStepId);
		if (next) {
			currentStepId = next.id;
		}
	}

	function previousStep() {
		const prev = getPreviousStep(currentStepId);
		if (prev) {
			currentStepId = prev.id;
		}
	}

	function goToStep(stepId: StepId) {
		currentStepId = stepId;
	}

	// Form validation helpers
	const stepValidation = $derived.by(() => {
		const stepData = {
			'business-info': $formData.business_info,
			'target-audience': $formData.target_audience,
			'product-details': $formData.product_details,
			'research-goals': $formData.research_goals
		};

		return Object.entries(stepData).reduce((acc, [stepId, data]) => {
			const step = formSteps.find(s => s.id === stepId);
			if (step) {
				try {
					step.schema.parse(data);
					acc[stepId as StepId] = true;
				} catch {
					acc[stepId as StepId] = false;
				}
			}
			return acc;
		}, {} as Record<StepId, boolean>);
	});

	const canProceed = $derived(stepValidation[currentStepId]);
	const isLastStep = $derived(currentStepId === 'research-goals');
	const allStepsValid = $derived(Object.values(stepValidation).every(Boolean));
</script>

<svelte:head>
	<title>{data.meta?.title || 'Generate Persona - PersonaLens'}</title>
	<meta name="description" content={data.meta?.description || 'Create detailed customer personas'} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background to-muted/20">
	<div class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-4xl">
			<!-- Header -->
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
					Generate Your
					<span class="gradient-primary">Persona</span>
				</h1>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					Create detailed customer personas powered by AI analysis of your business, audience, and product data.
				</p>
			</div>

			<!-- Progress Indicator -->
			<Card class="p-6 mb-8">
				<div class="mb-4">
					<div class="flex justify-between items-center mb-2">
						<span class="text-sm font-medium text-foreground">
							Step {currentStepIndex + 1} of {formSteps.length}
						</span>
						<span class="text-sm text-muted-foreground">
							{Math.round(progress)}% Complete
						</span>
					</div>
					<ProgressBar value={progress} variant="default" />
				</div>

				<!-- Step Navigation -->
				<div class="flex flex-wrap gap-2">
					{#each formSteps as step, index}
						<button
							type="button"
							onclick={() => goToStep(step.id)}
							class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
								{currentStepId === step.id 
									? 'bg-primary text-primary-foreground' 
									: stepValidation[step.id as StepId]
										? 'bg-green-100 text-green-800 hover:bg-green-200'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								}"
							disabled={!stepValidation[step.id as StepId] || index > currentStepIndex}
							>
							<span class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium
								{currentStepId === step.id 
									? 'bg-primary-foreground text-primary' 
									: stepValidation[step.id as StepId]
										? 'bg-green-500 text-white'
										: 'bg-muted-foreground/20'
								}">
								{stepValidation[step.id as StepId] ? '✓' : index + 1}
							</span>
							{step.title}
						</button>
					{/each}
				</div>
			</Card>

			<!-- Main Form -->
			<div class="grid lg:grid-cols-2 gap-8">
				<!-- Form Steps -->
				<div class="space-y-6">
					<Card class="p-8">
						<div class="mb-6">
							<h2 class="text-2xl font-bold text-foreground mb-2">
								{currentStep.title}
							</h2>
							<p class="text-muted-foreground">
								{currentStep.description}
							</p>
						</div>

						<form action="?/generate" method="POST" use:enhance>
							{#if currentStepId === 'business-info'}
								<BusinessInfoStep {form} />
							{:else if currentStepId === 'target-audience'}
								<TargetAudienceStep {form} />
							{:else if currentStepId === 'product-details'}
								<ProductDetailsStep {form} />
							{:else if currentStepId === 'research-goals'}
								<ResearchGoalsStep {form} />
							{/if}

							<!-- Step Navigation -->
							<div class="flex justify-between pt-6 border-t">
								<Button
									type="button"
									variant="outline"
									onclick={previousStep}
									disabled={currentStepId === 'business-info'}
								>
									Previous
								</Button>

								<div class="flex gap-2">
									{#if !isLastStep}
										<Button
											type="button"
											onclick={nextStep}
											disabled={!canProceed}
										>
											Next Step
										</Button>
									{:else}
										<Button
											type="button"
											variant="outline"
											formaction="?/save_draft"
											disabled={$submitting}
										>
											Save Draft
										</Button>
										<FormButton
											disabled={!allStepsValid || isGenerating}
											class="min-w-[140px]"
										>
											{#if isGenerating}
												<span class="flex items-center gap-2">
													<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
													Generating...
												</span>
											{:else}
												Generate Persona
											{/if}
										</FormButton>
									{/if}
								</div>
							</div>
						</form>
					</Card>

					<!-- Form Summary (shown on last step) -->
					{#if currentStepId === 'research-goals'}
						<Card class="p-6">
							<h3 class="text-lg font-semibold mb-4">Form Summary</h3>
							<div class="space-y-3 text-sm">
								<div>
									<span class="font-medium">Business:</span>
									{$formData.business_info?.business_name || 'Not specified'}
								</div>
								<div>
									<span class="font-medium">Industry:</span>
									{$formData.business_info?.industry || 'Not specified'}
								</div>
								<div>
									<span class="font-medium">Target Age:</span>
									{$formData.target_audience?.age_range || 'Not specified'}
								</div>
								<div>
									<span class="font-medium">Product:</span>
									{$formData.product_details?.product_name || 'Not specified'}
								</div>
								<div>
									<span class="font-medium">Primary Goal:</span>
									{$formData.research_goals?.primary_goal || 'Not specified'}
								</div>
							</div>
						</Card>
					{/if}
				</div>

				<!-- Results Panel -->
				<div class="lg:sticky lg:top-8 lg:h-fit">
					<InsightPanel
						persona={generatedPersona}
						isLoading={isGenerating}
						error={generationError}
						onExport={() => console.log('Export persona')}
						onShare={() => console.log('Share persona')}
					/>
				</div>
			</div>
		</div>
	</div>
</div>
