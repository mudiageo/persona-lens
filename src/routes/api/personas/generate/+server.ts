import type { RequestHandler } from './$types';
import { personaGenerationService } from '$lib/api/persona-generation';
import { json } from '@sveltejs/kit';
import type { PersonaGenerationData } from '$lib/schemas/persona-form';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData: PersonaGenerationData = await request.json();
		
		// Generate persona using the new LLM-powered service with full options
		const result = await personaGenerationService.generatePersona(formData, {
			includeQlooInsights: true,
			enhanceWithCulturalData: true,
			validateResults: true,
			retryAttempts: 3,
			model: 'gpt-4o-mini',
			temperature: 0.7
		});
		
		if (result.success && result.persona) {
			return json({
				success: true,
				persona: result.persona,
				metadata: result.metadata,
				message: 'Persona generated successfully using AI analysis'
			}, { status: 201 });
		} else {
			return json({
				success: false,
				error: result.error || 'Failed to generate persona',
				metadata: result.metadata
			}, { status: 400 });
		}
	} catch (error) {
		console.error('Persona generation API error:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Internal server error'
		}, { status: 500 });
	}
};

// Health check endpoint for the persona generation service
export const GET: RequestHandler = async () => {
	try {
		const health = await personaGenerationService.testService();
		
		return json({
			success: true,
			service_status: health,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return json({
			success: false,
			error: 'Service health check failed',
			timestamp: new Date().toISOString()
		}, { status: 503 });
	}
};
