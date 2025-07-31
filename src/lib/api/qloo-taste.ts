import { getQlooClient, QlooApiError } from './qloo-client';
import type {
	QlooTasteProfile,
	QlooTag,
	QlooEntity,
	QlooDemographics,
	QlooTagsResponse,
	QlooEntitiesResponse,
	QlooDemographicsResponse,
	QlooEntityType
} from '$lib/types/qloo';

/**
 * Taste Profile Analysis Functions
 * Provides functions to analyze taste profiles using Qloo's API
 */

export interface TasteProfileOptions {
	includeEntities?: boolean;
	includeDemographics?: boolean;
	includeCulturalContext?: boolean;
	limit?: number;
}

export interface TasteAnalysisInput {
	entities?: string[];
	tags?: string[];
	audiences?: string[];
	location?: string;
}

/**
 * Analyze taste profile for a given entity or set of inputs
 */
export async function analyzeTasteProfile(
	input: TasteAnalysisInput,
	options: TasteProfileOptions = {}
): Promise<QlooTasteProfile> {
	const client = getQlooClient();
	
	try {
		// Get tag insights
		const tagsResponse = await client.getInsights<QlooTagsResponse>({
			'filter.type': 'urn:tag',
			'filter.tag.types': 'urn:tag:keyword:media,urn:tag:genre:media,urn:tag:style:media',
			...(input.entities && { 'signal.interests.entities': input.entities }),
			...(input.tags && { 'signal.interests.tags': input.tags }),
			...(input.audiences && { 'signal.demographics.audiences': input.audiences }),
			...(input.location && { 'signal.location.query': input.location }),
			limit: options.limit || 50
		});

		if (!tagsResponse.success || !tagsResponse.results) {
			throw new QlooApiError('Failed to retrieve taste tags');
		}

		const tasteTags = tagsResponse.results.tags || [];

		// Get demographic insights if requested
		let demographicAlignment: QlooDemographics | undefined;
		if (options.includeDemographics && (input.entities || input.tags)) {
			const demoResponse = await client.getInsights<QlooDemographicsResponse>({
				'filter.type': 'urn:demographics',
				...(input.entities && { 'signal.interests.entities': input.entities }),
				...(input.tags && { 'signal.interests.tags': input.tags })
			});

			if (demoResponse.success && demoResponse.results?.demographics?.length) {
				demographicAlignment = demoResponse.results.demographics[0];
			}
		}

		// Calculate affinity scores based on tag frequency and relevance
		const affinityScores = calculateAffinityScores(tasteTags);

		// Build taste profile
		const tasteProfile: QlooTasteProfile = {
			entity_id: input.entities?.[0] || 'composite',
			taste_tags: tasteTags,
			affinity_scores: affinityScores,
			demographic_alignment: demographicAlignment || {
				entity_id: 'unknown',
				query: {}
			}
		};

		return tasteProfile;
	} catch (error) {
		throw new QlooApiError(
			`Taste profile analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Get taste tags for specific media types or keywords
 */
export async function getTasteTags(
	mediaTypes: string[] = ['urn:entity:movie', 'urn:entity:tv_show', 'urn:entity:book'],
	keywords?: string[]
): Promise<QlooTag[]> {
	const client = getQlooClient();

	try {
		const response = await client.getInsights<QlooTagsResponse>({
			'filter.type': 'urn:tag',
			'filter.tag.types': 'urn:tag:keyword:media,urn:tag:genre:media',
			'filter.parents.types': mediaTypes.join(','),
			...(keywords && { 'signal.interests.tags': keywords }),
			limit: 100
		});

		if (!response.success || !response.results) {
			throw new QlooApiError('Failed to retrieve taste tags');
		}

		return response.results.tags || [];
	} catch (error) {
		throw new QlooApiError(
			`Failed to get taste tags: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Analyze taste similarity between two entities
 */
export async function analyzeTasteSimilarity(
	entityA: string,
	entityB: string
): Promise<{
	similarity_score: number;
	common_tags: QlooTag[];
	unique_tags_a: QlooTag[];
	unique_tags_b: QlooTag[];
}> {
	const client = getQlooClient();

	try {
		// Get taste profiles for both entities
		const [profileA, profileB] = await Promise.all([
			analyzeTasteProfile({ entities: [entityA] }),
			analyzeTasteProfile({ entities: [entityB] })
		]);

		// Find common and unique tags
		const tagsA = new Set(profileA.taste_tags.map(t => t.tag_id));
		const tagsB = new Set(profileB.taste_tags.map(t => t.tag_id));
		
		const commonTagIds = new Set([...tagsA].filter(x => tagsB.has(x)));
		const uniqueAIds = new Set([...tagsA].filter(x => !tagsB.has(x)));
		const uniqueBIds = new Set([...tagsB].filter(x => !tagsA.has(x)));

		const commonTags = profileA.taste_tags.filter(t => commonTagIds.has(t.tag_id));
		const uniqueTagsA = profileA.taste_tags.filter(t => uniqueAIds.has(t.tag_id));
		const uniqueTagsB = profileB.taste_tags.filter(t => uniqueBIds.has(t.tag_id));

		// Calculate similarity score (Jaccard similarity)
		const union = tagsA.size + tagsB.size - commonTagIds.size;
		const similarity = union > 0 ? commonTagIds.size / union : 0;

		return {
			similarity_score: similarity,
			common_tags: commonTags,
			unique_tags_a: uniqueTagsA,
			unique_tags_b: uniqueTagsB
		};
	} catch (error) {
		throw new QlooApiError(
			`Taste similarity analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Get taste recommendations based on input preferences
 */
export async function getTasteRecommendations(
	input: TasteAnalysisInput,
	targetType: QlooEntityType,
	limit: number = 20
): Promise<QlooEntity[]> {
	const client = getQlooClient();

	try {
		const response = await client.getInsights<QlooEntitiesResponse>({
			'filter.type': targetType,
			...(input.entities && { 'signal.interests.entities': input.entities }),
			...(input.tags && { 'signal.interests.tags': input.tags }),
			...(input.audiences && { 'signal.demographics.audiences': input.audiences }),
			...(input.location && { 'signal.location.query': input.location }),
			limit
		});

		if (!response.success || !response.results) {
			throw new QlooApiError('Failed to get taste recommendations');
		}

		return response.results.entities || [];
	} catch (error) {
		throw new QlooApiError(
			`Taste recommendations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Analyze taste evolution over time (if temporal data is available)
 */
export async function analyzeTasteEvolution(
	entityId: string,
	timeframe?: 'recent' | 'trending' | 'classic'
): Promise<{
	current_taste: QlooTasteProfile;
	trending_elements: QlooTag[];
	stable_preferences: QlooTag[];
}> {
	const client = getQlooClient();

	try {
		// Get current taste profile
		const currentTaste = await analyzeTasteProfile({ entities: [entityId] });

		// Get trending data for comparison
		const trendingResponse = await client.getTrending('urn:entity:movie', 50);
		
		// For now, we'll use a simplified approach
		// In a real implementation, you'd have historical data comparison
		const trendingElements = currentTaste.taste_tags.slice(0, 10);
		const stablePreferences = currentTaste.taste_tags.slice(10, 20);

		return {
			current_taste: currentTaste,
			trending_elements: trendingElements,
			stable_preferences: stablePreferences
		};
	} catch (error) {
		throw new QlooApiError(
			`Taste evolution analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Helper function to calculate affinity scores from tags
 */
function calculateAffinityScores(tags: QlooTag[]): Record<string, number> {
	const scores: Record<string, number> = {};
	
	// Simple scoring based on tag frequency and type
	tags.forEach((tag, index) => {
		// Higher scores for earlier (more relevant) tags
		const baseScore = Math.max(0.1, 1 - (index / tags.length));
		
		// Boost scores for certain tag types
		let typeMultiplier = 1;
		if (tag.subtype?.includes('genre')) typeMultiplier = 1.5;
		if (tag.subtype?.includes('keyword')) typeMultiplier = 1.2;
		
		scores[tag.tag_id] = baseScore * typeMultiplier;
	});

	return scores;
}

/**
 * Get taste insights for a specific category
 */
export async function getCategoryTasteInsights(
	category: 'movies' | 'tv' | 'books' | 'music' | 'brands',
	userInput: TasteAnalysisInput,
	limit: number = 30
): Promise<{
	recommended_entities: QlooEntity[];
	taste_profile: QlooTasteProfile;
	category_specific_tags: QlooTag[];
}> {
	const entityTypeMap = {
		movies: 'urn:entity:movie' as QlooEntityType,
		tv: 'urn:entity:tv_show' as QlooEntityType,
		books: 'urn:entity:book' as QlooEntityType,
		music: 'urn:entity:artist' as QlooEntityType,
		brands: 'urn:entity:brand' as QlooEntityType
	};

	const targetType = entityTypeMap[category];
	
	try {
		const [recommendations, tasteProfile, categoryTags] = await Promise.all([
			getTasteRecommendations(userInput, targetType, limit),
			analyzeTasteProfile(userInput, { includeDemographics: true }),
			getTasteTags([targetType])
		]);

		return {
			recommended_entities: recommendations,
			taste_profile: tasteProfile,
			category_specific_tags: categoryTags
		};
	} catch (error) {
		throw new QlooApiError(
			`Category taste insights failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}
