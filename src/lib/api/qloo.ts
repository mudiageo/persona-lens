import { env } from '$env/dynamic/private';
import { createQlooClient, getQlooClient, QlooApiError } from './qloo-client';
import type { QlooApiConfig, QlooEntityType, QlooLocation } from '$lib/types/qloo';

// Import all specialized services
import {
	analyzeTasteProfile,
	getTasteTags,
	analyzeTasteSimilarity,
	getTasteRecommendations,
	analyzeTasteEvolution,
	getCategoryTasteInsights,
	type TasteAnalysisInput,
	type TasteProfileOptions
} from './qloo-taste';

import {
	analyzeDemographicProfile,
	getDemographicInsights,
	compareDemographicProfiles,
	getDemographicRecommendations,
	analyzeDemographicTrends,
	type DemographicProfile,
	type DemographicInsights
} from './qloo-demographics';

import {
	getCrossDomainAffinities,
	findCrossDomainInfluencers,
	analyzeAffinityClusters,
	getRecommendationBridges,
	analyzeAffinityPatterns,
	type CrossDomainAffinityMap,
	type AffinityCluster
} from './qloo-cross-domain';

import {
	analyzeCulturalContext,
	compareCulturalContexts,
	analyzeGlobalCulturalTrends,
	getCulturallyAdaptedRecommendations,
	analyzeCulturalSentiment,
	type CulturalProfile,
	type CulturalComparison,
	type GlobalCulturalTrends
} from './qloo-cultural';

/**
 * Comprehensive Qloo Service
 * Main service class that provides access to all Qloo API functionality
 */
export class QlooService {
	private initialized = false;

	/**
	 * Initialize the Qloo service with API configuration
	 */
	async initialize(config: QlooApiConfig): Promise<void> {
		try {
			createQlooClient(config);
			this.initialized = true;
		} catch (error) {
			console.error('[QlooService] Initialization failed:', error);
			throw new QlooApiError(
				`Failed to initialize Qloo service: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Check if the service is initialized and initialize if needed
	 */
	private async ensureInitialized(): Promise<void> {
		if (!this.initialized) {
			try {
				await this.initialize({
					apiKey: env.QLOO_API_KEY || '',
					baseUrl: env.QLOO_API_URL || 'https://hackathon.qloo.com',
					isHackathon: true
				});
			} catch (error) {
				console.error('[QlooService] Auto-initialization failed:', error);
				throw error;
			}
		}
	}

	// =============================================================================
	// TASTE ANALYSIS METHODS
	// =============================================================================

	/**
	 * Analyze taste profile for given inputs
	 */
	async analyzeTasteProfile(
		input: TasteAnalysisInput,
		options?: TasteProfileOptions
	) {
		this.ensureInitialized();
		return analyzeTasteProfile(input, options);
	}

	/**
	 * Get taste tags for specific media types
	 */
	async getTasteTags(mediaTypes?: string[], keywords?: string[]) {
		this.ensureInitialized();
		return getTasteTags(mediaTypes, keywords);
	}

	/**
	 * Analyze taste similarity between entities
	 */
	async analyzeTasteSimilarity(entityA: string, entityB: string) {
		this.ensureInitialized();
		return analyzeTasteSimilarity(entityA, entityB);
	}

	/**
	 * Get taste-based recommendations
	 */
	async getTasteRecommendations(
		input: TasteAnalysisInput,
		targetType: QlooEntityType,
		limit?: number
	) {
		this.ensureInitialized();
		return getTasteRecommendations(input, targetType, limit);
	}

	/**
	 * Analyze taste evolution over time
	 */
	async analyzeTasteEvolution(entityId: string, timeframe?: 'recent' | 'trending' | 'classic') {
		this.ensureInitialized();
		return analyzeTasteEvolution(entityId, timeframe);
	}

	/**
	 * Get category-specific taste insights
	 */
	async getCategoryTasteInsights(
		category: 'movies' | 'tv' | 'books' | 'music' | 'brands',
		userInput: TasteAnalysisInput,
		limit?: number
	) {
		this.ensureInitialized();
		return getCategoryTasteInsights(category, userInput, limit);
	}

	// =============================================================================
	// DEMOGRAPHIC ANALYSIS METHODS
	// =============================================================================

	/**
	 * Analyze demographic profile
	 */
	async analyzeDemographicProfile(input: { entities?: string[]; tags?: string[] }) {
		this.ensureInitialized();
		return analyzeDemographicProfile(input);
	}

	/**
	 * Get comprehensive demographic insights
	 */
	async getDemographicInsights(
		input: { entities?: string[]; tags?: string[] },
		targetEntityType?: QlooEntityType
	) {
		try {
			await this.ensureInitialized();
			return await getDemographicInsights(input, targetEntityType);
		} catch (error) {
			console.error('[QlooService] getDemographicInsights failed:', error);
			throw error;
		}
	}

	/**
	 * Compare demographic profiles between entities
	 */
	async compareDemographicProfiles(entityA: string, entityB: string) {
		this.ensureInitialized();
		return compareDemographicProfiles(entityA, entityB);
	}

	/**
	 * Get demographic-based recommendations
	 */
	async getDemographicRecommendations(
		targetDemographic: {
			age_groups?: string[];
			genders?: string[];
			audiences?: string[];
		},
		contentType: QlooEntityType,
		limit?: number
	) {
		this.ensureInitialized();
		return getDemographicRecommendations(targetDemographic, contentType, limit);
	}

	/**
	 * Analyze demographic trends
	 */
	async analyzeDemographicTrends(entities: string[], timeframe?: 'recent' | 'historical') {
		this.ensureInitialized();
		return analyzeDemographicTrends(entities, timeframe);
	}

	// =============================================================================
	// CROSS-DOMAIN AFFINITY METHODS
	// =============================================================================

	/**
	 * Get cross-domain affinities for an entity
	 */
	async getCrossDomainAffinities(
		sourceEntityId: string,
		targetDomains?: QlooEntityType[],
		limit?: number
	) {
		try {
			await this.ensureInitialized();
			return await getCrossDomainAffinities(sourceEntityId, targetDomains, limit);
		} catch (error) {
			console.error('[QlooService] getCrossDomainAffinities failed:', error);
			throw error;
		}
	}

	/**
	 * Find entities with strong cross-domain appeal
	 */
	async findCrossDomainInfluencers(
		domains: QlooEntityType[],
		minAffinityScore?: number,
		limit?: number
	) {
		this.ensureInitialized();
		return findCrossDomainInfluencers(domains, minAffinityScore, limit);
	}

	/**
	 * Analyze affinity clusters across domains
	 */
	async analyzeAffinityClusters(
		entities: string[],
		domains: QlooEntityType[],
		maxClusters?: number
	) {
		this.ensureInitialized();
		return analyzeAffinityClusters(entities, domains, maxClusters);
	}

	/**
	 * Get recommendation bridges between domains
	 */
	async getRecommendationBridges(
		sourceDomain: QlooEntityType,
		targetDomain: QlooEntityType,
		sourceEntities: string[],
		limit?: number
	) {
		this.ensureInitialized();
		return getRecommendationBridges(sourceDomain, targetDomain, sourceEntities, limit);
	}

	/**
	 * Analyze affinity patterns across entities
	 */
	async analyzeAffinityPatterns(entities: string[], domains: QlooEntityType[]) {
		this.ensureInitialized();
		return analyzeAffinityPatterns(entities, domains);
	}

	// =============================================================================
	// CULTURAL CONTEXT METHODS
	// =============================================================================

	/**
	 * Analyze cultural context for a location
	 */
	async analyzeCulturalContext(
		location: QlooLocation,
		contentType?: QlooEntityType,
		limit?: number
	) {
		this.ensureInitialized();
		return analyzeCulturalContext(location, contentType, limit);
	}

	/**
	 * Compare cultural contexts between locations
	 */
	async compareCulturalContexts(
		locationA: QlooLocation,
		locationB: QlooLocation,
		contentType?: QlooEntityType
	) {
		this.ensureInitialized();
		return compareCulturalContexts(locationA, locationB, contentType);
	}

	/**
	 * Analyze global cultural trends
	 */
	async analyzeGlobalCulturalTrends(contentType?: QlooEntityType, regions?: string[]) {
		this.ensureInitialized();
		return analyzeGlobalCulturalTrends(contentType, regions);
	}

	/**
	 * Get culturally adapted recommendations
	 */
	async getCulturallyAdaptedRecommendations(
		userPreferences: { entities?: string[]; tags?: string[] },
		targetLocation: QlooLocation,
		contentType: QlooEntityType,
		adaptationLevel?: 'light' | 'moderate' | 'heavy',
		limit?: number
	) {
		this.ensureInitialized();
		return getCulturallyAdaptedRecommendations(
			userPreferences,
			targetLocation,
			contentType,
			adaptationLevel,
			limit
		);
	}

	/**
	 * Analyze cultural sentiment for content
	 */
	async analyzeCulturalSentiment(contentId: string, regions: string[]) {
		this.ensureInitialized();
		return analyzeCulturalSentiment(contentId, regions);
	}

	// =============================================================================
	// UTILITY METHODS
	// =============================================================================

	/**
	 * Search for entities by name
	 */
	async searchEntities(query: string, types?: string[], limit?: number) {
		this.ensureInitialized();
		const client = getQlooClient();
		return client.searchEntities({ query, types, limit });
	}

	/**
	 * Get entity details by ID
	 */
	async getEntityById(entityId: string) {
		this.ensureInitialized();
		const client = getQlooClient();
		return client.getEntityById(entityId);
	}

	/**
	 * Search for tags
	 */
	async searchTags(query: string, types?: string[]) {
		this.ensureInitialized();
		const client = getQlooClient();
		return client.searchTags(query, types);
	}

	/**
	 * Get available audiences
	 */
	async getAudiences() {
		this.ensureInitialized();
		const client = getQlooClient();
		return client.getAudiences();
	}

	/**
	 * Get trending content
	 */
	async getTrending(entityType: QlooEntityType, limit?: number) {
		this.ensureInitialized();
		const client = getQlooClient();
		return client.getTrending(entityType, limit);
	}

	// =============================================================================
	// INTEGRATED ANALYSIS METHODS
	// =============================================================================

	/**
	 * Comprehensive entity analysis combining all features
	 */
	async comprehensiveEntityAnalysis(entityId: string) {
		this.ensureInitialized();

		try {
			const [
				tasteProfile,
				demographicProfile,
				crossDomainAffinities,
				// Cultural analysis would need location context
			] = await Promise.all([
				this.analyzeTasteProfile({ entities: [entityId] }),
				this.analyzeDemographicProfile({ entities: [entityId] }),
				this.getCrossDomainAffinities(entityId),
			]);

			return {
				entity_id: entityId,
				taste_profile: tasteProfile,
				demographic_profile: demographicProfile,
				cross_domain_affinities: crossDomainAffinities,
				analysis_timestamp: new Date().toISOString()
			};
		} catch (error) {
			throw new QlooApiError(
				`Comprehensive analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Multi-dimensional recommendation engine
	 */
	async getMultiDimensionalRecommendations(
		input: {
			entities?: string[];
			tags?: string[];
			demographics?: { age_groups?: string[]; genders?: string[]; audiences?: string[] };
			location?: QlooLocation;
			cultural_adaptation?: 'light' | 'moderate' | 'heavy';
		},
		targetType: QlooEntityType,
		limit: number = 20
	) {
		this.ensureInitialized();

		try {
			// Get base taste recommendations
			const tasteRecommendations = await this.getTasteRecommendations(
				{ entities: input.entities, tags: input.tags },
				targetType,
				limit * 2
			);

			// Get demographic recommendations if demographic info provided
			let demographicRecommendations = null;
			if (input.demographics) {
				demographicRecommendations = await this.getDemographicRecommendations(
					input.demographics,
					targetType,
					limit
				);
			}

			// Get culturally adapted recommendations if location provided
			let culturalRecommendations = null;
			if (input.location) {
				culturalRecommendations = await this.getCulturallyAdaptedRecommendations(
					{ entities: input.entities, tags: input.tags },
					input.location,
					targetType,
					input.cultural_adaptation,
					limit
				);
			}

			// Combine and score recommendations
			const combinedRecommendations = this.combineRecommendations(
				tasteRecommendations,
				demographicRecommendations?.recommendations,
				culturalRecommendations?.recommendations,
				limit
			);

			return {
				recommendations: combinedRecommendations,
				taste_based: tasteRecommendations.slice(0, 10),
				demographic_based: demographicRecommendations?.recommendations.slice(0, 10) || [],
				culturally_adapted: culturalRecommendations?.recommendations.slice(0, 10) || [],
				cultural_relevance_scores: culturalRecommendations?.cultural_relevance_scores || {},
				demographic_match_scores: demographicRecommendations?.demographic_match_scores || {}
			};
		} catch (error) {
			throw new QlooApiError(
				`Multi-dimensional recommendations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Cultural market analysis for content
	 */
	async culturalMarketAnalysis(
		contentId: string,
		targetRegions: string[] = ['North America', 'Europe', 'Asia', 'Latin America']
	) {
		this.ensureInitialized();

		try {
			const [culturalSentiment, crossDomainAffinities] = await Promise.all([
				this.analyzeCulturalSentiment(contentId, targetRegions),
				this.getCrossDomainAffinities(contentId)
			]);

			// Calculate market scores
			const marketScores = Object.entries(culturalSentiment).map(([region, sentiment]) => ({
				region,
				market_score: sentiment.market_potential,
				sentiment_score: sentiment.sentiment_score,
				cultural_reception: sentiment.cultural_reception,
				adaptation_needs: sentiment.adaptation_needs
			}));

			marketScores.sort((a, b) => b.market_score - a.market_score);

			return {
				content_id: contentId,
				market_analysis: marketScores,
				cross_domain_appeal: crossDomainAffinities,
				top_markets: marketScores.slice(0, 3),
				adaptation_priority: marketScores.filter(m => 
					m.market_score > 0.6 && m.sentiment_score < 0.5
				),
				analysis_timestamp: new Date().toISOString()
			};
		} catch (error) {
			throw new QlooApiError(
				`Cultural market analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	// =============================================================================
	// MULTI-DIMENSIONAL ANALYSIS METHODS
	// =============================================================================

	/**
	 * Perform comprehensive multi-dimensional analysis
	 */
	async performMultiDimensionalAnalysis(input: {
		taste?: TasteAnalysisInput;
		demographics?: { entities?: string[]; tags?: string[] };
		location?: QlooLocation;
		crossDomainTargets?: QlooEntityType[];
		analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
	}) {
		this.ensureInitialized();

		const results: any = {
			timestamp: new Date().toISOString(),
			analysis: {}
		};

		try {
			// Taste analysis
			if (input.taste) {
				results.analysis.taste = await this.analyzeTasteProfile(input.taste);
			}

			// Demographic analysis  
			if (input.demographics) {
				results.analysis.demographics = await this.analyzeDemographicProfile(input.demographics);
			}

			// Cultural context analysis
			if (input.location) {
				results.analysis.cultural = await this.analyzeCulturalContext(input.location);
			}

			// Cross-domain analysis
			if (input.crossDomainTargets && (input.taste?.entities?.[0] || input.demographics?.entities?.[0])) {
				const sourceEntity = input.taste?.entities?.[0] || input.demographics?.entities?.[0];
				if (sourceEntity) {
					results.analysis.crossDomain = await this.getCrossDomainAffinities(
						sourceEntity,
						input.crossDomainTargets
					);
				}
			}

			return {
				success: true,
				data: results
			};
		} catch (error) {
			throw new QlooApiError(
				`Multi-dimensional analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Generate comprehensive recommendations using all available data
	 */
	async generateComprehensiveRecommendations(input: {
		taste?: TasteAnalysisInput;
		demographics?: DemographicProfile;
		location?: QlooLocation;
		targetTypes: QlooEntityType[];
		preferences?: {
			novelty?: 'conservative' | 'moderate' | 'adventurous';
			diversity?: 'focused' | 'balanced' | 'wide';
			cultural_adaptation?: 'local' | 'global' | 'mixed';
		};
		limit?: number;
	}) {
		this.ensureInitialized();

		try {
			const recommendations: any = {
				primary: [],
				crossDomain: [],
				culturallyAdapted: [],
				metadata: {
					analysisType: 'comprehensive',
					timestamp: new Date().toISOString(),
					confidence: 0
				}
			};

			// Get primary recommendations for each target type
			for (const targetType of input.targetTypes) {
				if (input.taste) {
					const tasteRecs = await this.getTasteRecommendations(input.taste, targetType, input.limit);
					recommendations.primary.push({
						type: 'taste',
						targetType,
						recommendations: tasteRecs
					});
				}

				if (input.demographics) {
					const demoRecs = await this.getDemographicRecommendations(
						{
							age_groups: input.demographics.age_distribution ? Object.keys(input.demographics.age_distribution) : [],
							genders: input.demographics.gender_distribution ? Object.keys(input.demographics.gender_distribution) : [],
							audiences: []
						},
						targetType,
						input.limit
					);
					recommendations.primary.push({
						type: 'demographic',
						targetType,
						recommendations: demoRecs
					});
				}
			}

			// Get cross-domain recommendations if we have a source entity
			const sourceEntity = input.taste?.entities?.[0];
			if (sourceEntity) {
				const crossDomainRecs = await this.getCrossDomainAffinities(
					sourceEntity,
					input.targetTypes,
					input.limit
				);
				recommendations.crossDomain = crossDomainRecs;
			}

			// Get culturally adapted recommendations if location is provided
			if (input.location && recommendations.primary.length > 0) {
				const baseRecs = recommendations.primary
					.flatMap((r: any) => r.recommendations?.data?.entities || [])
					.map((e: any) => e.entity_id)
					.slice(0, input.limit || 10);

				if (baseRecs.length > 0) {
					const culturalRecs = await this.getCulturallyAdaptedRecommendations(
						{ entities: baseRecs },
						input.location,
						input.targetTypes[0] || 'urn:entity:movie',
						'moderate'
					);
					recommendations.culturallyAdapted = culturalRecs;
				}
			}

			// Calculate confidence score based on available data
			let confidence = 0.3; // Base confidence
			if (input.taste) confidence += 0.3;
			if (input.demographics) confidence += 0.2;
			if (input.location) confidence += 0.2;
			recommendations.metadata.confidence = Math.min(confidence, 1.0);

			return {
				success: true,
				data: recommendations
			};
		} catch (error) {
			throw new QlooApiError(
				`Comprehensive recommendations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Test API connection and functionality
	 */
	async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
		try {
			// Auto-initialize if not already initialized
			if (!this.initialized) {
				try {
					await this.initialize({
						apiKey: env.QLOO_API_KEY || '',
						baseUrl: env.QLOO_API_URL || 'https://hackathon.api.qloo.com',
						isHackathon: true
					});
				} catch (initError) {
					console.error('[QlooService] testConnection initialization failed:', initError);
					return {
						success: false,
						message: `Qloo API initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`
					};
				}
			}

			const client = getQlooClient();
			
			// Test basic search functionality
			const testResult = await client.searchEntities({
				query: 'Marvel',
				limit: 1
			});

			// Also test audience API specifically
			let audienceTestResult = null;
			let audienceStatus = 'failed';
			try {
				console.log('[QlooService] Testing audience API endpoint...');
				audienceTestResult = await client.getAudiences();
				
				if (audienceTestResult.success) {
					// Check if we got real data or fallback data by looking for specific test audience
					const hasTestAudience = audienceTestResult.results?.audiences?.some(
						aud => aud.audience_id === 'aud_gen_z_consumers'
					);
					audienceStatus = hasTestAudience ? 'fallback_data' : 'live_api';
					console.log(`[QlooService] Audience API test successful (${audienceStatus}):`, {
						audienceCount: audienceTestResult.results?.audiences?.length || 0,
						sampleAudiences: audienceTestResult.results?.audiences?.slice(0, 3).map(a => a.name) || []
					});
				}
			} catch (audienceError) {
				console.error('[QlooService] Audience API test failed:', audienceError);
				audienceStatus = 'error';
			}

			if (testResult.results) {
				return {
					success: true,
					message: 'Qloo API connection successful',
					details: {
						testQuery: 'Marvel',
						resultCount: testResult.results?.entities?.length || 0,
						audienceTest: audienceStatus,
						audienceCount: audienceTestResult?.results?.audiences?.length || 0
					}
				};
			} else {
				console.error('[QlooService] testConnection failed - no results returned:', testResult);
				return {
					success: false,
					message: 'Qloo API connection failed - no results returned'
				};
			}
		} catch (error) {
			console.error('[QlooService] testConnection error:', error);
			return {
				success: false,
				message: `Qloo API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			};
		}
	}

	// =============================================================================
	// PRIVATE HELPER METHODS
	// =============================================================================

	private combineRecommendations(
		tasteRecs: any[],
		demoRecs?: any[],
		culturalRecs?: any[],
		limit: number = 20
	): any[] {
		// Create a map to track entity scores
		const entityScores = new Map<string, { entity: any; score: number }>();

		// Add taste recommendations (base weight: 1.0)
		tasteRecs.forEach((entity, index) => {
			const score = Math.max(0.1, 1 - (index / tasteRecs.length));
			entityScores.set(entity.entity_id, { entity, score });
		});

		// Add demographic recommendations (weight: 0.8)
		if (demoRecs) {
			demoRecs.forEach((entity, index) => {
				const score = Math.max(0.1, 1 - (index / demoRecs.length)) * 0.8;
				const existing = entityScores.get(entity.entity_id);
				if (existing) {
					existing.score += score;
				} else {
					entityScores.set(entity.entity_id, { entity, score });
				}
			});
		}

		// Add cultural recommendations (weight: 0.9)
		if (culturalRecs) {
			culturalRecs.forEach((entity, index) => {
				const score = Math.max(0.1, 1 - (index / culturalRecs.length)) * 0.9;
				const existing = entityScores.get(entity.entity_id);
				if (existing) {
					existing.score += score;
				} else {
					entityScores.set(entity.entity_id, { entity, score });
				}
			});
		}

		// Sort by combined score and return top results
		return Array.from(entityScores.values())
			.sort((a, b) => b.score - a.score)
			.slice(0, limit)
			.map(item => item.entity);
	}
}

// Create and export singleton instance
export const qlooService = new QlooService();

// Export all types for convenience
export type {
	// Core types
	QlooApiConfig,
	QlooEntityType,
	QlooLocation,
	
	// Taste types
	TasteAnalysisInput,
	TasteProfileOptions,
	
	// Demographic types
	DemographicProfile,
	DemographicInsights,
	
	// Cross-domain types
	CrossDomainAffinityMap,
	AffinityCluster,
	
	// Cultural types
	CulturalProfile,
	CulturalComparison,
	GlobalCulturalTrends
};

// Export error class
export { QlooApiError };
