import { z } from 'zod';

// Step 1: Business Information
export const businessInfoSchema = z.object({
	business_name: z.string().min(2, 'Business name must be at least 2 characters'),
	industry: z.string().min(1, 'Please select an industry'),
	business_type: z.enum(['B2B', 'B2C', 'Both'], {
		required_error: 'Please select a business type'
	}),
	business_description: z.string()
		.min(50, 'Business description must be at least 50 characters')
		.max(1000, 'Business description must be less than 1000 characters'),
	company_size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise'], {
		required_error: 'Please select company size'
	}),
	website: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
});

// Step 2: Target Audience
export const targetAudienceSchema = z.object({
	target_description: z.string()
		.min(100, 'Target audience description must be at least 100 characters')
		.max(2000, 'Target audience description must be less than 2000 characters'),
	age_range: z.enum(['18-25', '26-35', '36-45', '46-55', '56-65', '65+', 'mixed'], {
		required_error: 'Please select an age range'
	}),
	gender: z.enum(['male', 'female', 'non-binary', 'mixed'], {
		required_error: 'Please select gender demographics'
	}),
	location: z.enum(['urban', 'suburban', 'rural', 'mixed', 'global'], {
		required_error: 'Please select location type'
	}),
	income_level: z.enum(['low', 'lower-middle', 'middle', 'upper-middle', 'high', 'mixed'], {
		required_error: 'Please select income level'
	}),
	education: z.enum(['high-school', 'some-college', 'bachelors', 'masters', 'doctorate', 'mixed'], {
		required_error: 'Please select education level'
	}),
	cultural_context: z.string()
		.max(500, 'Cultural context must be less than 500 characters')
		.optional()
});

// Step 3: Product/Service Details
export const productDetailsSchema = z.object({
	product_name: z.string().min(2, 'Product/service name must be at least 2 characters'),
	product_type: z.enum(['product', 'service', 'software', 'platform', 'content', 'other'], {
		required_error: 'Please select product type'
	}),
	product_description: z.string()
		.min(50, 'Product description must be at least 50 characters')
		.max(1000, 'Product description must be less than 1000 characters'),
	price_range: z.enum(['free', 'low', 'medium', 'high', 'premium', 'enterprise'], {
		required_error: 'Please select price range'
	}),
	key_features: z.string()
		.min(20, 'Key features must be at least 20 characters')
		.max(500, 'Key features must be less than 500 characters'),
	unique_value_proposition: z.string()
		.min(20, 'Value proposition must be at least 20 characters')
		.max(300, 'Value proposition must be less than 300 characters'),
	competitors: z.string()
		.max(300, 'Competitors list must be less than 300 characters')
		.optional()
});

// Step 4: Research Goals
export const researchGoalsSchema = z.object({
	primary_goal: z.enum([
		'market-research',
		'product-development',
		'marketing-strategy',
		'brand-positioning',
		'content-strategy',
		'customer-acquisition',
		'other'
	], {
		required_error: 'Please select a primary goal'
	}),
	specific_questions: z.string()
		.max(1000, 'Specific questions must be less than 1000 characters')
		.optional(),
	use_case: z.string()
		.min(20, 'Use case must be at least 20 characters')
		.max(500, 'Use case must be less than 500 characters'),
	timeline: z.enum(['immediate', 'week', 'month', 'quarter', 'year'], {
		required_error: 'Please select timeline'
	}),
	budget_range: z.enum(['free', 'low', 'medium', 'high', 'enterprise'], {
		required_error: 'Please select budget range'
	})
});

// Combined schema for the entire form
export const personaGenerationSchema = z.object({
	business_info: businessInfoSchema,
	target_audience: targetAudienceSchema,
	product_details: productDetailsSchema,
	research_goals: researchGoalsSchema
});

export type BusinessInfoData = z.infer<typeof businessInfoSchema>;
export type TargetAudienceData = z.infer<typeof targetAudienceSchema>;
export type ProductDetailsData = z.infer<typeof productDetailsSchema>;
export type ResearchGoalsData = z.infer<typeof researchGoalsSchema>;
export type PersonaGenerationData = z.infer<typeof personaGenerationSchema>;

// Form step configuration
export const formSteps = [
	{
		id: 'business-info',
		title: 'Business Information',
		description: 'Tell us about your company and industry',
		schema: businessInfoSchema
	},
	{
		id: 'target-audience',
		title: 'Target Audience',
		description: 'Describe your ideal customers',
		schema: targetAudienceSchema
	},
	{
		id: 'product-details',
		title: 'Product Details',
		description: 'Information about your product or service',
		schema: productDetailsSchema
	},
	{
		id: 'research-goals',
		title: 'Research Goals',
		description: 'What do you want to achieve with this persona?',
		schema: researchGoalsSchema
	}
] as const;

export type FormStep = typeof formSteps[number];
export type StepId = FormStep['id'];

// Helper function to get step by ID
export function getStepById(id: StepId): FormStep {
	const step = formSteps.find(s => s.id === id);
	if (!step) throw new Error(`Step ${id} not found`);
	return step;
}

// Helper function to get next step
export function getNextStep(currentId: StepId): FormStep | null {
	const currentIndex = formSteps.findIndex(s => s.id === currentId);
	return currentIndex < formSteps.length - 1 ? formSteps[currentIndex + 1] : null;
}

// Helper function to get previous step
export function getPreviousStep(currentId: StepId): FormStep | null {
	const currentIndex = formSteps.findIndex(s => s.id === currentId);
	return currentIndex > 0 ? formSteps[currentIndex - 1] : null;
}
