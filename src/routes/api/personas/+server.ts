import type { RequestHandler } from './$types';
import { personaGenerationService } from '$lib/api/persona-generation';
import { json } from '@sveltejs/kit';
import type { PersonaGenerationData } from '$lib/schemas/persona-form';

// Mock data for demonstration
const mockPersonas = [
	{
		id: 1,
		name: 'Urban Professional',
		demographics: { age: '25-35', income: 'High', location: 'Urban' },
		interests: ['Technology', 'Fitness', 'Sustainable Living'],
		behavior: 'Early adopter, values efficiency and quality',
		cultural_traits: ['Values work-life balance', 'Environmentally conscious', 'Tech-savvy']
	},
	{
		id: 2,
		name: 'Creative Millennial',
		demographics: { age: '28-38', income: 'Medium', location: 'Suburban' },
		interests: ['Art', 'Music', 'Social Causes'],
		behavior: 'Values authenticity and self-expression',
		cultural_traits: ['Socially conscious', 'Values creativity', 'Community-oriented']
	}
];

export const GET: RequestHandler = async () => {
	return json({
		personas: mockPersonas,
		total: mockPersonas.length
	});
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data: PersonaGenerationData = await request.json();
		
		// Generate persona using the new LLM-powered service
		const result = await personaGenerationService.generatePersona(data, {
			includeQlooInsights: true,
			enhanceWithCulturalData: true,
			validateResults: true,
			model: 'gpt-4o-mini',
			temperature: 0.7
		});
		
		if (result.success && result.persona) {
			return json({
				success: true,
				persona: result.persona,
				metadata: result.metadata,
				message: 'Persona generated successfully'
			}, { status: 201 });
		} else {
			return json({
				success: false,
				error: result.error || 'Failed to generate persona'
			}, { status: 400 });
		}
	} catch (error) {
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to generate persona'
		}, { status: 500 });
	}
};
