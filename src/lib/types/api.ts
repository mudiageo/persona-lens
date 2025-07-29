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
	demographic: {
		age_range: string;
		gender: string;
		location: string;
		income_level: string;
		education: string;
	};
	cultural_attributes: {
		values: string[];
		interests: string[];
		lifestyle: string[];
		media_consumption: string[];
	};
	taste_profile: QlooTasteProfile[];
	behavioral_patterns: {
		shopping_habits: string[];
		decision_drivers: string[];
		communication_preferences: string[];
		brand_affinities: string[];
	};
	insights: {
		summary: string;
		key_motivations: string[];
		marketing_recommendations: string[];
		content_preferences: string[];
	};
	confidence_score: number;
	created_at: string;
	updated_at: string;
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
