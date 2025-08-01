// API Response Types
export interface APIResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

// LLM API Types
export interface LLMMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface LLMRequest {
	messages: LLMMessage[];
	model?: string;
	temperature?: number;
	max_tokens?: number;
	stream?: boolean;
}

export interface LLMResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: {
		index: number;
		message: LLMMessage;
		finish_reason: string;
	}[];
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

// Qloo API Types
export interface QlooTasteProfile {
	id: string;
	name: string;
	category: string;
	confidence: number;
	attributes: Record<string, any>;
}

export interface QlooRecommendationRequest {
	input: {
		type: 'taste_profile' | 'entity' | 'demographic';
		data: any;
	};
	output_types: string[];
	count?: number;
	filters?: Record<string, any>;
}

export interface QlooRecommendation {
	id: string;
	name: string;
	type: string;
	confidence: number;
	attributes: Record<string, any>;
	related_entities?: QlooRecommendation[];
}

export interface QlooResponse<T = any> {
	status: 'success' | 'error';
	data: T;
	metadata?: {
		count: number;
		total: number;
		page?: number;
	};
	error?: {
		code: string;
		message: string;
	};
}

// Persona Types
export interface PersonaProfile {
	id: string;
	name: string;
	tagline?: string;
	demographics: {
		age: number;
		gender: string;
		location: string;
		occupation: string;
		income: string;
		education: string;
		family_status: string;
		living_situation: string;
	};
	psychographics: {
		values: string[];
		motivations: string[];
		personality_traits: string[];
		lifestyle: string;
		stress_triggers: string[];
		relaxation_methods: string[];
	};
	behavioral_patterns: {
		daily_routine: string;
		decision_making_style: string;
		research_habits: string;
		shopping_behavior: string;
		brand_loyalty: string;
	};
	digital_behavior: {
		primary_devices: string[];
		social_media_platforms: string[];
		content_preferences: string[];
		technology_comfort: string;
		online_activity_times: string[];
	};
	goals_and_pain_points: {
		primary_goals: string[];
		aspirations: string[];
		current_challenges: string[];
		frustrations: string[];
		success_metrics: string[];
	};
	product_relationship: {
		discovery_channels: string[];
		decision_factors: string[];
		potential_objections: string[];
		ideal_experience: string;
		post_purchase_behavior: string;
	};
	marketing_strategy: {
		best_channels: string[];
		messaging_style: string;
		content_types: string[];
		communication_frequency: string;
		timing_preferences: string[];
	};
	quotes: {
		pain_point: string;
		aspiration: string;
		product_need: string;
	};
	confidence_score: number;
	qloo_insights?: any;
	generation_timestamp: string;
	created_at?: string;
	updated_at?: string;
}

export interface PersonaGenerationRequest {
	target_description: string;
	demographic_filters?: Record<string, any>;
	cultural_context?: string;
	business_context?: string;
	research_goals?: string[];
}

// Error Types
export interface APIError {
	code: string;
	message: string;
	details?: any;
	timestamp: string;
}

// Loading States
export interface LoadingState {
	isLoading: boolean;
	error: APIError | null;
	progress?: number;
	stage?: string;
}
