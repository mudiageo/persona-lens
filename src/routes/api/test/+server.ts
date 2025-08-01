import type { RequestHandler } from './$types';
import { personaGenerationService } from '$lib/api/persona-generation';
import { json } from '@sveltejs/kit';

/**
 * Test endpoint for the persona generation service
 * GET /api/test - Check service health
 * POST /api/test - Test persona generation with sample data
 */
export const GET: RequestHandler = async () => {
	try {
		const health = await personaGenerationService.testService();
		
		return json({
			success: true,
			service_health: health,
			environment: {
				openai_configured: !!process.env.OPENAI_API_KEY,
				anthropic_configured: !!process.env.ANTHROPIC_API_KEY,
				gemini_configured: !!process.env.GEMINI_API_KEY,
				qloo_configured: !!process.env.QLOO_API_KEY
			},
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Service health check failed:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async () => {
	try {
		// Sample test data for persona generation
		const testData = {
			business_info: {
				business_name: "EcoTech Solutions",
				industry: "Technology",
				business_type: "B2C",
				company_size: "51-200 employees",
				business_description: "Sustainable technology products for environmentally conscious consumers",
				website: "https://ecotech.example.com"
			},
			target_audience: {
				target_description: "Environmentally conscious tech-savvy millennials who prioritize sustainability",
				age_range: "25-35",
				gender: "All",
				location: "Urban areas in North America",
				income_level: "$50,000-$100,000",
				education: "Bachelor's degree",
				cultural_context: "Urban professional lifestyle with strong environmental values"
			},
			product_details: {
				product_name: "SmartHome Energy Manager",
				product_type: "Smart Home Device",
				product_description: "AI-powered home energy management system that reduces consumption and costs",
				price_range: "$200-$400",
				key_features: ["Real-time energy monitoring", "AI optimization", "Mobile app control", "Solar integration"],
				unique_value_proposition: "Reduce energy costs by 30% while minimizing environmental impact",
				competitors: ["Nest", "Ecobee", "Sense"]
			},
			research_goals: {
				primary_goal: "Understand customer motivations",
				use_case: "Product development and marketing strategy",
				specific_questions: "What drives purchase decisions for smart home products?"
			}
		};

		// Test the persona generation
		const result = await personaGenerationService.generatePersona(testData, {
			includeQlooInsights: false, // Disable for testing to avoid API calls
			validateResults: false,
			retryAttempts: 1,
			model: 'gpt-4o-mini',
			temperature: 0.5
		});

		if (result.success) {
			return json({
				success: true,
				message: 'Test persona generation successful',
				persona: result.persona,
				metadata: result.metadata
			});
		} else {
			return json({
				success: false,
				error: result.error,
				metadata: result.metadata
			}, { status: 400 });
		}
	} catch (error) {
		console.error('Test persona generation failed:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};
