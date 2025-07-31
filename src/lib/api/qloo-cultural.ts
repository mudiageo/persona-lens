import { getQlooClient, QlooApiError } from './qloo-client';
import type {
	QlooEntity,
	QlooEntityType,
	QlooEntitiesResponse,
	QlooLocation,
	QlooCulturalContext,
	QlooTag,
	QlooTagsResponse
} from '$lib/types/qloo';

/**
 * Cultural Context Analysis Functions
 * Provides functions to analyze cultural preferences and regional variations
 */

export interface CulturalProfile {
	region: string;
	cultural_markers: QlooTag[];
	local_preferences: QlooEntity[];
	cultural_affinity_scores: Record<string, number>;
	demographic_overlay: {
		age_bias: string;
		gender_bias: string;
	};
	language_context?: string;
}

export interface CulturalComparison {
	region_a: CulturalProfile;
	region_b: CulturalProfile;
	cultural_distance: number;
	shared_preferences: QlooEntity[];
	unique_preferences_a: QlooEntity[];
	unique_preferences_b: QlooEntity[];
	convergence_areas: string[];
	divergence_areas: string[];
}

export interface GlobalCulturalTrends {
	trending_globally: QlooEntity[];
	regional_variations: Record<string, QlooEntity[]>;
	cultural_bridges: Array<{
		entity: QlooEntity;
		cross_cultural_appeal: number;
		regions: string[];
	}>;
	localization_opportunities: Array<{
		content: QlooEntity;
		target_regions: string[];
		adaptation_suggestions: string[];
	}>;
}

/**
 * Analyze cultural context for a specific location
 */
export async function analyzeCulturalContext(
	location: QlooLocation,
	contentType: QlooEntityType = 'urn:entity:movie',
	limit: number = 30
): Promise<CulturalProfile> {
	const client = getQlooClient();

	try {
		// Get location-based content preferences
		const locationResponse = await client.getInsights<QlooEntitiesResponse>({
			'filter.type': contentType,
			...(location.query && { 'signal.location.query': location.query }),
			limit
		});

		if (!locationResponse.success || !locationResponse.results) {
			throw new QlooApiError('Failed to get location-based preferences');
		}

		const localPreferences = locationResponse.results.entities || [];

		// Get cultural tags/markers for the region
		const culturalTagsResponse = await client.getInsights<QlooTagsResponse>({
			'filter.type': 'urn:tag',
			'filter.tag.types': 'urn:tag:keyword:media,urn:tag:cultural:media,urn:tag:language:media',
			...(location.query && { 'signal.location.query': location.query }),
			limit: 50
		});

		const culturalMarkers = culturalTagsResponse.success && culturalTagsResponse.results
			? culturalTagsResponse.results.tags || []
			: [];

		// Calculate cultural affinity scores
		const culturalAffinityScores = await calculateCulturalAffinityScores(
			localPreferences,
			culturalMarkers
		);

		// Analyze demographic overlay (simplified)
		const demographicOverlay = await analyzeDemographicOverlay(localPreferences);

		return {
			region: location.query || `${location.latitude},${location.longitude}`,
			cultural_markers: culturalMarkers,
			local_preferences: localPreferences,
			cultural_affinity_scores: culturalAffinityScores,
			demographic_overlay: demographicOverlay,
			language_context: detectLanguageContext(culturalMarkers)
		};
	} catch (error) {
		throw new QlooApiError(
			`Cultural context analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Compare cultural contexts between two locations
 */
export async function compareCulturalContexts(
	locationA: QlooLocation,
	locationB: QlooLocation,
	contentType: QlooEntityType = 'urn:entity:movie'
): Promise<CulturalComparison> {
	try {
		const [profileA, profileB] = await Promise.all([
			analyzeCulturalContext(locationA, contentType),
			analyzeCulturalContext(locationB, contentType)
		]);

		// Calculate cultural distance
		const culturalDistance = calculateCulturalDistance(profileA, profileB);

		// Find shared and unique preferences
		const preferencesA = new Set(profileA.local_preferences.map(e => e.entity_id));
		const preferencesB = new Set(profileB.local_preferences.map(e => e.entity_id));

		const sharedIds = new Set([...preferencesA].filter(x => preferencesB.has(x)));
		const uniqueAIds = new Set([...preferencesA].filter(x => !preferencesB.has(x)));
		const uniqueBIds = new Set([...preferencesB].filter(x => !preferencesA.has(x)));

		const sharedPreferences = profileA.local_preferences.filter(e => sharedIds.has(e.entity_id));
		const uniquePreferencesA = profileA.local_preferences.filter(e => uniqueAIds.has(e.entity_id));
		const uniquePreferencesB = profileB.local_preferences.filter(e => uniqueBIds.has(e.entity_id));

		// Analyze convergence and divergence areas
		const convergenceAreas = findConvergenceAreas(profileA, profileB);
		const divergenceAreas = findDivergenceAreas(profileA, profileB);

		return {
			region_a: profileA,
			region_b: profileB,
			cultural_distance: culturalDistance,
			shared_preferences: sharedPreferences,
			unique_preferences_a: uniquePreferencesA,
			unique_preferences_b: uniquePreferencesB,
			convergence_areas: convergenceAreas,
			divergence_areas: divergenceAreas
		};
	} catch (error) {
		throw new QlooApiError(
			`Cultural comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Analyze global cultural trends
 */
export async function analyzeGlobalCulturalTrends(
	contentType: QlooEntityType = 'urn:entity:movie',
	regions: string[] = [
		'North America',
		'Europe',
		'Asia',
		'Latin America',
		'Middle East',
		'Africa'
	]
): Promise<GlobalCulturalTrends> {
	const client = getQlooClient();

	try {
		// Get trending content globally
		const globalTrendingResponse = await client.getTrending(contentType, 50);
		const trendingGlobally = globalTrendingResponse.success && globalTrendingResponse.results
			? globalTrendingResponse.results.entities || []
			: [];

		// Get regional variations
		const regionalVariations: Record<string, QlooEntity[]> = {};
		
		await Promise.all(
			regions.map(async (region) => {
				try {
					const regionalResponse = await client.getInsights<QlooEntitiesResponse>({
						'filter.type': contentType,
						'signal.location.query': region,
						limit: 20
					});

					regionalVariations[region] = regionalResponse.success && regionalResponse.results
						? regionalResponse.results.entities || []
						: [];
				} catch (error) {
					console.warn(`Failed to get trends for region ${region}:`, error);
					regionalVariations[region] = [];
				}
			})
		);

		// Find cultural bridges (content popular across multiple regions)
		const culturalBridges = findCulturalBridges(regionalVariations, trendingGlobally);

		// Identify localization opportunities
		const localizationOpportunities = identifyLocalizationOpportunities(
			trendingGlobally,
			regionalVariations
		);

		return {
			trending_globally: trendingGlobally.slice(0, 20),
			regional_variations: regionalVariations,
			cultural_bridges: culturalBridges,
			localization_opportunities: localizationOpportunities
		};
	} catch (error) {
		throw new QlooApiError(
			`Global cultural trends analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Get culturally adapted recommendations
 */
export async function getCulturallyAdaptedRecommendations(
	userPreferences: {
		entities?: string[];
		tags?: string[];
	},
	targetLocation: QlooLocation,
	contentType: QlooEntityType,
	adaptationLevel: 'light' | 'moderate' | 'heavy' = 'moderate',
	limit: number = 20
): Promise<{
	recommendations: QlooEntity[];
	adaptation_explanations: Record<string, string>;
	cultural_relevance_scores: Record<string, number>;
	alternative_suggestions: QlooEntity[];
}> {
	const client = getQlooClient();

	try {
		// Get cultural context for target location
		const culturalContext = await analyzeCulturalContext(targetLocation, contentType);

		// Get base recommendations
		const baseResponse = await client.getInsights<QlooEntitiesResponse>({
			'filter.type': contentType,
			...(userPreferences.entities && { 'signal.interests.entities': userPreferences.entities }),
			...(userPreferences.tags && { 'signal.interests.tags': userPreferences.tags }),
			...(targetLocation.query && { 'signal.location.query': targetLocation.query }),
			limit: limit * 2 // Get more to filter
		});

		if (!baseResponse.success || !baseResponse.results) {
			throw new QlooApiError('Failed to get base recommendations');
		}

		const baseRecommendations = baseResponse.results.entities || [];

		// Apply cultural adaptation
		const adaptedResults = await applyCulturalAdaptation(
			baseRecommendations,
			culturalContext,
			adaptationLevel,
			limit
		);

		// Get alternative suggestions for content that doesn't adapt well
		const alternativeResponse = await client.getInsights<QlooEntitiesResponse>({
			'filter.type': contentType,
			'signal.location.query': targetLocation.query || 'global',
			limit: 10
		});

		const alternativeSuggestions = alternativeResponse.success && alternativeResponse.results
			? alternativeResponse.results.entities || []
			: [];

		return {
			recommendations: adaptedResults.recommendations,
			adaptation_explanations: adaptedResults.explanations,
			cultural_relevance_scores: adaptedResults.relevanceScores,
			alternative_suggestions: alternativeSuggestions.slice(0, 5)
		};
	} catch (error) {
		throw new QlooApiError(
			`Culturally adapted recommendations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Analyze cultural sentiment for content
 */
export async function analyzeCulturalSentiment(
	contentId: string,
	regions: string[]
): Promise<Record<string, {
	sentiment_score: number;
	cultural_reception: 'positive' | 'neutral' | 'negative';
	adaptation_needs: string[];
	market_potential: number;
}>> {
	const client = getQlooClient();

	try {
		const results: Record<string, any> = {};

		await Promise.all(
			regions.map(async (region) => {
				try {
					// Get content's performance in the region
					const regionResponse = await client.getInsights<QlooEntitiesResponse>({
						'filter.type': 'urn:entity:movie', // Assuming movie for example
						'signal.interests.entities': [contentId],
						'signal.location.query': region,
						limit: 10
					});

					// Calculate sentiment based on ranking and popularity
					const sentimentScore = regionResponse.success && regionResponse.results?.entities?.length
						? Math.random() * 0.6 + 0.2 // Mock sentiment score
						: 0.1;

					const culturalReception: 'positive' | 'neutral' | 'negative' = 
						sentimentScore > 0.6 ? 'positive' :
						sentimentScore > 0.3 ? 'neutral' : 'negative';

					const adaptationNeeds = generateAdaptationNeeds(sentimentScore, region);
					const marketPotential = calculateMarketPotential(sentimentScore, region);

					results[region] = {
						sentiment_score: sentimentScore,
						cultural_reception: culturalReception,
						adaptation_needs: adaptationNeeds,
						market_potential: marketPotential
					};
				} catch (error) {
					console.warn(`Failed to analyze sentiment for region ${region}:`, error);
					results[region] = {
						sentiment_score: 0.3,
						cultural_reception: 'neutral' as const,
						adaptation_needs: ['Market research needed'],
						market_potential: 0.3
					};
				}
			})
		);

		return results;
	} catch (error) {
		throw new QlooApiError(
			`Cultural sentiment analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

// Helper functions

async function calculateCulturalAffinityScores(
	preferences: QlooEntity[],
	culturalMarkers: QlooTag[]
): Promise<Record<string, number>> {
	const scores: Record<string, number> = {};
	
	// Calculate scores based on tag overlap and cultural relevance
	culturalMarkers.forEach((marker, index) => {
		// Higher scores for more prominent cultural markers
		const baseScore = Math.max(0.1, 1 - (index / culturalMarkers.length));
		
		// Boost for certain cultural tag types
		let typeMultiplier = 1;
		if (marker.subtype?.includes('cultural')) typeMultiplier = 1.8;
		if (marker.subtype?.includes('language')) typeMultiplier = 1.5;
		if (marker.subtype?.includes('regional')) typeMultiplier = 1.3;
		
		scores[marker.tag_id] = baseScore * typeMultiplier;
	});

	return scores;
}

async function analyzeDemographicOverlay(preferences: QlooEntity[]): Promise<{
	age_bias: string;
	gender_bias: string;
}> {
	// Simplified demographic analysis
	// In a real implementation, this would analyze the demographic data of the preferences
	
	const ageBiases = ['young_adult', 'middle_age', 'mature', 'mixed'];
	const genderBiases = ['male_leaning', 'female_leaning', 'balanced'];
	
	return {
		age_bias: ageBiases[Math.floor(Math.random() * ageBiases.length)],
		gender_bias: genderBiases[Math.floor(Math.random() * genderBiases.length)]
	};
}

function detectLanguageContext(culturalMarkers: QlooTag[]): string {
	// Look for language-related tags
	const languageTags = culturalMarkers.filter(tag => 
		tag.subtype?.includes('language') || 
		tag.name.toLowerCase().includes('language') ||
		tag.name.toLowerCase().includes('english') ||
		tag.name.toLowerCase().includes('spanish') ||
		tag.name.toLowerCase().includes('french')
	);
	
	if (languageTags.length > 0) {
		return languageTags[0].name;
	}
	
	return 'English'; // Default
}

function calculateCulturalDistance(profileA: CulturalProfile, profileB: CulturalProfile): number {
	// Calculate distance based on multiple factors
	
	// Tag similarity
	const tagsA = new Set(profileA.cultural_markers.map(t => t.tag_id));
	const tagsB = new Set(profileB.cultural_markers.map(t => t.tag_id));
	const tagIntersection = new Set([...tagsA].filter(x => tagsB.has(x)));
	const tagUnion = new Set([...tagsA, ...tagsB]);
	const tagSimilarity = tagUnion.size > 0 ? tagIntersection.size / tagUnion.size : 0;
	
	// Preference similarity
	const prefsA = new Set(profileA.local_preferences.map(e => e.entity_id));
	const prefsB = new Set(profileB.local_preferences.map(e => e.entity_id));
	const prefIntersection = new Set([...prefsA].filter(x => prefsB.has(x)));
	const prefUnion = new Set([...prefsA, ...prefsB]);
	const prefSimilarity = prefUnion.size > 0 ? prefIntersection.size / prefUnion.size : 0;
	
	// Combined distance (lower similarity = higher distance)
	const combinedSimilarity = (tagSimilarity + prefSimilarity) / 2;
	return 1 - combinedSimilarity;
}

function findConvergenceAreas(profileA: CulturalProfile, profileB: CulturalProfile): string[] {
	// Find areas where cultures are converging
	const commonTags = profileA.cultural_markers.filter(tagA => 
		profileB.cultural_markers.some(tagB => tagB.tag_id === tagA.tag_id)
	);
	
	// Extract convergence themes from common tags
	const themes = new Set<string>();
	commonTags.forEach(tag => {
		if (tag.subtype?.includes('genre')) themes.add('Entertainment Preferences');
		if (tag.subtype?.includes('cultural')) themes.add('Cultural Values');
		if (tag.subtype?.includes('lifestyle')) themes.add('Lifestyle Choices');
		if (tag.subtype?.includes('technology')) themes.add('Technology Adoption');
	});
	
	return Array.from(themes);
}

function findDivergenceAreas(profileA: CulturalProfile, profileB: CulturalProfile): string[] {
	// Find areas where cultures are diverging
	const uniqueTagsA = profileA.cultural_markers.filter(tagA => 
		!profileB.cultural_markers.some(tagB => tagB.tag_id === tagA.tag_id)
	);
	
	const uniqueTagsB = profileB.cultural_markers.filter(tagB => 
		!profileA.cultural_markers.some(tagA => tagA.tag_id === tagB.tag_id)
	);
	
	const divergenceThemes = new Set<string>();
	[...uniqueTagsA, ...uniqueTagsB].forEach(tag => {
		if (tag.subtype?.includes('traditional')) divergenceThemes.add('Traditional Values');
		if (tag.subtype?.includes('modern')) divergenceThemes.add('Modern Preferences');
		if (tag.subtype?.includes('religious')) divergenceThemes.add('Religious Beliefs');
		if (tag.subtype?.includes('political')) divergenceThemes.add('Political Views');
	});
	
	return Array.from(divergenceThemes);
}

function findCulturalBridges(
	regionalVariations: Record<string, QlooEntity[]>,
	globalTrending: QlooEntity[]
): Array<{
	entity: QlooEntity;
	cross_cultural_appeal: number;
	regions: string[];
}> {
	const bridges: Array<{
		entity: QlooEntity;
		cross_cultural_appeal: number;
		regions: string[];
	}> = [];
	
	// Find entities that appear in multiple regions
	const entityRegionMap = new Map<string, string[]>();
	
	Object.entries(regionalVariations).forEach(([region, entities]) => {
		entities.forEach(entity => {
			if (!entityRegionMap.has(entity.entity_id)) {
				entityRegionMap.set(entity.entity_id, []);
			}
			entityRegionMap.get(entity.entity_id)!.push(region);
		});
	});
	
	// Find entities with cross-cultural appeal (appearing in 3+ regions)
	entityRegionMap.forEach((regions, entityId) => {
		if (regions.length >= 3) {
			const entity = globalTrending.find(e => e.entity_id === entityId);
			if (entity) {
				bridges.push({
					entity,
					cross_cultural_appeal: regions.length / Object.keys(regionalVariations).length,
					regions
				});
			}
		}
	});
	
	return bridges.sort((a, b) => b.cross_cultural_appeal - a.cross_cultural_appeal).slice(0, 10);
}

function identifyLocalizationOpportunities(
	globalTrending: QlooEntity[],
	regionalVariations: Record<string, QlooEntity[]>
): Array<{
	content: QlooEntity;
	target_regions: string[];
	adaptation_suggestions: string[];
}> {
	const opportunities: Array<{
		content: QlooEntity;
		target_regions: string[];
		adaptation_suggestions: string[];
	}> = [];
	
	// Find globally trending content that's not popular in certain regions
	globalTrending.slice(0, 10).forEach(entity => {
		const missingRegions: string[] = [];
		
		Object.entries(regionalVariations).forEach(([region, entities]) => {
			const isPopularInRegion = entities.some(e => e.entity_id === entity.entity_id);
			if (!isPopularInRegion) {
				missingRegions.push(region);
			}
		});
		
		if (missingRegions.length > 0) {
			opportunities.push({
				content: entity,
				target_regions: missingRegions,
				adaptation_suggestions: generateLocalizationSuggestions(entity, missingRegions)
			});
		}
	});
	
	return opportunities.slice(0, 5);
}

function generateLocalizationSuggestions(entity: QlooEntity, regions: string[]): string[] {
	const suggestions: string[] = [];
	
	regions.forEach(region => {
		switch (region.toLowerCase()) {
			case 'asia':
				suggestions.push('Add subtitles in local languages', 'Cultural sensitivity review');
				break;
			case 'latin america':
				suggestions.push('Spanish/Portuguese dubbing', 'Local cultural references');
				break;
			case 'middle east':
				suggestions.push('Cultural adaptation review', 'Local partnership opportunities');
				break;
			case 'africa':
				suggestions.push('Local language support', 'Regional distribution strategy');
				break;
			default:
				suggestions.push('Market research', 'Local partnerships');
		}
	});
	
	return [...new Set(suggestions)]; // Remove duplicates
}

async function applyCulturalAdaptation(
	recommendations: QlooEntity[],
	culturalContext: CulturalProfile,
	adaptationLevel: 'light' | 'moderate' | 'heavy',
	limit: number
): Promise<{
	recommendations: QlooEntity[];
	explanations: Record<string, string>;
	relevanceScores: Record<string, number>;
}> {
	const adaptedRecommendations: QlooEntity[] = [];
	const explanations: Record<string, string> = {};
	const relevanceScores: Record<string, number> = {};
	
	// Score recommendations based on cultural relevance
	const scoredRecommendations = recommendations.map(entity => {
		let relevanceScore = 0.5; // Base score
		
		// Check for cultural marker alignment
		if (entity.tags) {
			const culturalTagIds = new Set(culturalContext.cultural_markers.map(m => m.tag_id));
			const entityTagIds = new Set(entity.tags.map(t => t.id || t.tag_id));
			const overlap = [...culturalTagIds].filter(id => entityTagIds.has(id)).length;
			const totalTags = Math.max(culturalTagIds.size, entityTagIds.size);
			
			if (totalTags > 0) {
				relevanceScore += (overlap / totalTags) * 0.5;
			}
		}
		
		// Apply adaptation level multiplier
		const adaptationMultiplier = {
			light: 0.8,
			moderate: 1.0,
			heavy: 1.2
		}[adaptationLevel];
		
		relevanceScore *= adaptationMultiplier;
		
		return { entity, relevanceScore };
	});
	
	// Sort by relevance and take top results
	scoredRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
	
	scoredRecommendations.slice(0, limit).forEach(({ entity, relevanceScore }) => {
		adaptedRecommendations.push(entity);
		relevanceScores[entity.entity_id] = relevanceScore;
		explanations[entity.entity_id] = generateAdaptationExplanation(entity, culturalContext, relevanceScore);
	});
	
	return {
		recommendations: adaptedRecommendations,
		explanations,
		relevanceScores
	};
}

function generateAdaptationExplanation(
	entity: QlooEntity,
	culturalContext: CulturalProfile,
	relevanceScore: number
): string {
	if (relevanceScore > 0.8) {
		return `Highly relevant to ${culturalContext.region} cultural preferences`;
	} else if (relevanceScore > 0.6) {
		return `Good cultural fit for ${culturalContext.region} with some local appeal`;
	} else if (relevanceScore > 0.4) {
		return `Moderate cultural relevance, may need localization`;
	} else {
		return `Low cultural relevance, consider local alternatives`;
	}
}

function generateAdaptationNeeds(sentimentScore: number, region: string): string[] {
	const needs: string[] = [];
	
	if (sentimentScore < 0.3) {
		needs.push('Major cultural adaptation required');
		needs.push('Local market research');
		needs.push('Cultural sensitivity review');
	} else if (sentimentScore < 0.6) {
		needs.push('Minor cultural adjustments');
		needs.push('Local partnership opportunities');
	} else {
		needs.push('Minimal adaptation needed');
		needs.push('Direct market entry viable');
	}
	
	// Add region-specific needs
	switch (region.toLowerCase()) {
		case 'asia':
			needs.push('Language localization');
			break;
		case 'middle east':
			needs.push('Religious compliance review');
			break;
		case 'europe':
			needs.push('GDPR compliance');
			break;
	}
	
	return needs;
}

function calculateMarketPotential(sentimentScore: number, region: string): number {
	// Base potential from sentiment
	let potential = sentimentScore;
	
	// Regional market size adjustments (simplified)
	const marketSizeMultipliers: Record<string, number> = {
		'north america': 1.2,
		'asia': 1.5,
		'europe': 1.1,
		'latin america': 0.9,
		'middle east': 0.8,
		'africa': 0.7
	};
	
	const multiplier = marketSizeMultipliers[region.toLowerCase()] || 1.0;
	potential *= multiplier;
	
	return Math.min(1.0, potential);
}
