import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { personaGenerationSchema } from '$lib/schemas/persona-form';
import { personaGenerationService } from '$lib/api/persona-generation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Initialize the form with default values
	const form = await superValidate(zod(personaGenerationSchema));
	
	return {
		form,
		meta: {
			title: 'Generate Persona - PersonaLens',
			description: 'Create detailed customer personas using AI-powered analysis'
		}
	};
};

export const actions: Actions = {
	generate: async (event) => {
		const form = await superValidate(event, zod(personaGenerationSchema));

		if (!form.valid) {
			return fail(400, {
				form,
				error: 'Please fix the validation errors before submitting.'
			});
		}

		try {
			// Use the form data directly with the new persona generation service
			const result = await personaGenerationService.generatePersona(form.data, {
				includeQlooInsights: true,
				enhanceWithCulturalData: !!form.data.target_audience.cultural_context,
				validateResults: true,
				retryAttempts: 3,
				model: 'gpt-4o-mini',
				temperature: 0.7
			});

			if (result.success && result.persona) {
				return {
					form,
					success: true,
					persona: result.persona,
					metadata: result.metadata,
					message: 'Persona generated successfully using AI-powered analysis!'
				};
			} else {
				return fail(500, {
					form,
					error: result.error || 'Failed to generate persona. Please try again.',
					metadata: result.metadata
				});
			}
		} catch (error) {
			console.error('Persona generation error:', error);
			return fail(500, {
				form,
				error: 'An unexpected error occurred. Please try again.'
			});
		}
	},

	save_draft: async (event) => {
		const form = await superValidate(event, zod(personaGenerationSchema));

		// For now, just return success - in production, you'd save to database
		return {
			form,
			success: true,
			message: 'Draft saved successfully!'
		};
	}
};
