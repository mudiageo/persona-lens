import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { personaGenerationSchema } from '$lib/schemas/persona-form';
import { personaService } from '$lib/api';
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
			// Transform form data into PersonaGenerationRequest format
			const personaRequest = {
				target_description: form.data.target_audience.target_description,
				demographic_filters: {
					age_range: form.data.target_audience.age_range,
					gender: form.data.target_audience.gender,
					location: form.data.target_audience.location,
					income_level: form.data.target_audience.income_level,
					education: form.data.target_audience.education
				},
				cultural_context: form.data.target_audience.cultural_context || '',
				business_context: `
					Business: ${form.data.business_info.business_name}
					Industry: ${form.data.business_info.industry}
					Type: ${form.data.business_info.business_type}
					Description: ${form.data.business_info.business_description}
					Company Size: ${form.data.business_info.company_size}
					Product: ${form.data.product_details.product_name}
					Product Type: ${form.data.product_details.product_type}
					Product Description: ${form.data.product_details.product_description}
					Price Range: ${form.data.product_details.price_range}
					Key Features: ${form.data.product_details.key_features}
					Value Proposition: ${form.data.product_details.unique_value_proposition}
				`.trim(),
				research_goals: [
					form.data.research_goals.primary_goal,
					form.data.research_goals.use_case,
					...(form.data.research_goals.specific_questions ? [form.data.research_goals.specific_questions] : [])
				]
			};

			// Generate the persona using the service
			const result = await personaService.generatePersona(personaRequest);

			if (result.success) {
				return {
					form,
					success: true,
					persona: result.data,
					message: 'Persona generated successfully!'
				};
			} else {
				return fail(500, {
					form,
					error: result.error || 'Failed to generate persona. Please try again.'
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
