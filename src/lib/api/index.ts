import { llmClient, openaiClient, anthropicClient, geminiClient } from './llm';
import { qlooService } from './qloo';
import type { 
	PersonaProfile, 
	PersonaGenerationRequest, 
	APIResponse,
	LoadingState 
} from '$lib/types/api';

export class PersonaService {
	private loadingStates = new Map<string, LoadingState>();

	constructor(
		private llm = llmClient,
		private qloo = qlooService
	) {}

	// Method to switch LLM provider
	setLLMProvider(provider: 'openai' | 'anthropic' | 'gemini') {
		switch (provider) {
			case 'openai':
				this.llm = openaiClient;
				break;
			case 'anthropic':
				this.llm = anthropicClient;
				break;
			case 'gemini':
				this.llm = geminiClient;
				break;
		}
	}

	getLoadingState(requestId: string): LoadingState {
		return this.loadingStates.get(requestId) || {
			isLoading: false,
			error: null
		};
	}

	private setLoadingState(requestId: string, state: Partial<LoadingState>) {
		const currentState = this.getLoadingState(requestId);
		this.loadingStates.set(requestId, { ...currentState, ...state });
	}

	async generatePersona(request: PersonaGenerationRequest): Promise<APIResponse<PersonaProfile>> {
		const requestId = `persona_${Date.now()}`;
		
		try {
			this.setLoadingState(requestId, {
				isLoading: true,
				error: null,
				progress: 0,
				stage: 'Initializing'
			});

			// Step 1: Generate cultural insights using LLM
			this.setLoadingState(requestId, {
				progress: 20,
				stage: 'Analyzing cultural context'
			});

			const culturalInsights = await this.llm.generatePersonaInsights(
				request.target_description,
				request.cultural_context,
				request.business_context
			);

			if (!culturalInsights.success) {
				throw new Error(culturalInsights.error || 'Failed to generate cultural insights');
			}

			// Step 2: Get taste profile data from Qloo
			this.setLoadingState(requestId, {
				progress: 50,
				stage: 'Fetching taste profiles'
			});

			// Extract interests from the target description for Qloo search
			const interests = this.extractInterests(request.target_description);
			const demographic = request.demographic_filters || {};

			const tasteData = await this.qloo.getDemographicInsights({ 
				tags: interests, 
				entities: [] 
			});
			
			// Step 3: Generate brand affinities if taste data is available
			this.setLoadingState(requestId, {
				progress: 70,
				stage: 'Analyzing brand affinities'
			});

			let brandAffinities: any[] = [];
			if (tasteData.recommended_content && tasteData.recommended_content.length > 0) {
				// Use the first entity from taste data to get cross-domain affinities for brands
				const firstEntity = tasteData.recommended_content[0];
				if (firstEntity.entity_id) {
					const brandResponse = await this.qloo.getCrossDomainAffinities(
						firstEntity.entity_id,
						['urn:entity:brand'], // Target brands specifically
						10 // Limit to 10 brand affinities
					);
					brandAffinities = brandResponse.domain_affinities['urn:entity:brand']?.entities || [];
				}
			}

			// Step 4: Combine and structure the persona
			this.setLoadingState(requestId, {
				progress: 90,
				stage: 'Creating persona profile'
			});

			const persona: PersonaProfile = {
				id: `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				name: this.generatePersonaName(request.target_description),
				demographic: this.extractDemographic(request.demographic_filters),
				cultural_attributes: this.extractCulturalAttributes(culturalInsights.data || ''),
				taste_profile: tasteData.recommended_content?.map(item => ({
					id: item.entity_id,
					name: item.name || '',
					category: item.type || 'general',
					confidence: 0.5, // Default confidence since it's not in QlooEntity
					attributes: item.properties || {}
				})) || [],
				behavioral_patterns: this.extractBehavioralPatterns(culturalInsights.data || ''),
				insights: {
					summary: this.extractSummary(culturalInsights.data || ''),
					key_motivations: this.extractMotivations(culturalInsights.data || ''),
					marketing_recommendations: this.extractMarketingRecs(culturalInsights.data || ''),
					content_preferences: this.extractContentPrefs(culturalInsights.data || '')
				},
				confidence_score: this.calculateConfidenceScore(culturalInsights.success, true),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			this.setLoadingState(requestId, {
				isLoading: false,
				progress: 100,
				stage: 'Complete'
			});

			return {
				success: true,
				data: persona
			};

		} catch (error) {
			console.error('[PersonaService] generatePersona error:', error);
			this.setLoadingState(requestId, {
				isLoading: false,
				error: {
					code: 'GENERATION_ERROR',
					message: error instanceof Error ? error.message : 'Unknown error',
					details: error,
					timestamp: new Date().toISOString()
				}
			});

			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to generate persona'
			};
		}
	}

	async testAPIs(): Promise<APIResponse<{ llm: { openai: boolean; anthropic: boolean; gemini: boolean }; qloo: boolean }>> {
		try {
			const [openaiTest, anthropicTest, geminiTest, qlooTest] = await Promise.all([
				openaiClient.testConnection(),
				anthropicClient.testConnection(),
				geminiClient.testConnection(),
				this.qloo.testConnection()
			]);

			const result = {
				success: true,
				data: {
					llm: {
						openai: openaiTest.success,
						anthropic: anthropicTest.success,
						gemini: geminiTest.success
					},
					qloo: qlooTest.success
				},
				message: `OpenAI: ${openaiTest.success ? 'Connected' : 'Failed'}, Anthropic: ${anthropicTest.success ? 'Connected' : 'Failed'}, Gemini: ${geminiTest.success ? 'Connected' : 'Failed'}, Qloo: ${qlooTest.success ? 'Connected' : 'Failed'}`
			};

			// Only log if there are failures
			const hasFailures = !openaiTest.success || !anthropicTest.success || !geminiTest.success || !qlooTest.success;
			if (hasFailures) {
				console.warn('[PersonaService] API test failures detected:', {
					openai: !openaiTest.success ? openaiTest.message : 'OK',
					anthropic: !anthropicTest.success ? anthropicTest.message : 'OK',
					gemini: !geminiTest.success ? geminiTest.message : 'OK',
					qloo: !qlooTest.success ? qlooTest.message : 'OK'
				});
			}

			return result;
		} catch (error) {
			console.error('[PersonaService] testAPIs error:', error);
			return {
				success: false,
				error: 'Failed to test API connections'
			};
		}
	}

	// Helper methods for parsing LLM responses
	private extractInterests(description: string): string[] {
		// Simple keyword extraction - in production, you might want more sophisticated NLP
		const interests = description.toLowerCase()
			.split(/[,\s]+/)
			.filter(word => word.length > 3)
			.slice(0, 10);
		return interests;
	}

	private generatePersonaName(description: string): string {
		const adjectives = ['Modern', 'Urban', 'Creative', 'Professional', 'Trendy', 'Classic'];
		const nouns = ['Consumer', 'Professional', 'Enthusiast', 'Explorer', 'Innovator', 'Advocate'];
		
		const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
		const noun = nouns[Math.floor(Math.random() * nouns.length)];
		
		return `${adj} ${noun}`;
	}

	private extractDemographic(filters: Record<string, any> = {}): PersonaProfile['demographic'] {
		return {
			age_range: filters.age_range || '25-35',
			gender: filters.gender || 'Mixed',
			location: filters.location || 'Urban',
			income_level: filters.income_level || 'Middle',
			education: filters.education || 'College Educated'
		};
	}

	private extractCulturalAttributes(insights: string): PersonaProfile['cultural_attributes'] {
		// In production, you'd parse the LLM response more intelligently
		return {
			values: ['Innovation', 'Quality', 'Authenticity'],
			interests: ['Technology', 'Design', 'Culture'],
			lifestyle: ['Urban Living', 'Work-Life Balance'],
			media_consumption: ['Digital First', 'Social Media', 'Streaming']
		};
	}

	private extractBehavioralPatterns(insights: string): PersonaProfile['behavioral_patterns'] {
		return {
			shopping_habits: ['Research-driven', 'Brand conscious', 'Online preferred'],
			decision_drivers: ['Quality', 'Value', 'Reviews'],
			communication_preferences: ['Digital channels', 'Visual content', 'Personalized messaging'],
			brand_affinities: ['Premium brands', 'Sustainable options', 'Innovative companies']
		};
	}

	private extractSummary(insights: string): string {
		return insights.split('\n')[0] || 'AI-generated persona based on cultural and behavioral analysis.';
	}

	private extractMotivations(insights: string): string[] {
		return ['Achievement', 'Connection', 'Innovation', 'Quality'];
	}

	private extractMarketingRecs(insights: string): string[] {
		return [
			'Focus on digital-first marketing strategies',
			'Emphasize quality and authenticity in messaging',
			'Use visual storytelling and social proof',
			'Leverage influencer partnerships'
		];
	}

	private extractContentPrefs(insights: string): string[] {
		return ['Video content', 'Interactive experiences', 'Educational content', 'Behind-the-scenes content'];
	}

	private calculateConfidenceScore(llmSuccess: boolean, qlooSuccess: boolean): number {
		let score = 0.5; // Base score
		if (llmSuccess) score += 0.3;
		if (qlooSuccess) score += 0.2;
		return Math.min(score, 1.0);
	}
}

// Singleton instance
export const personaService = new PersonaService();
