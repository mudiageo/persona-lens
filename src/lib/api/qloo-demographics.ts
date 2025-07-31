import { getQlooClient, QlooApiError } from './qloo-client';
import type {
	QlooDemographics,
	QlooDemographicsResponse,
	QlooEntitiesResponse,
	QlooEntity,
	QlooEntityType,
	QlooAudiencesResponse
} from '$lib/types/qloo';

/**
 * Demographic Analysis Functions
 * Provides functions to analyze demographic data and preferences using Qloo's API
 */

export interface DemographicProfile {
	age_distribution: {
		'24_and_younger': number;
		'25_to_29': number;
		'30_to_34': number;
		'35_to_44': number;
		'45_to_54': number;
		'55_and_older': number;
	};
	gender_distribution: {
		male: number;
		female: number;
	};
	dominant_age_group: string;
	dominant_gender: string;
	diversity_score: number;
}

export interface DemographicInsights {
	profile: DemographicProfile;
	audience_alignment: Array<{
		audience_id: string;
		name: string;
		affinity_score: number;
	}>;
	recommended_content: QlooEntity[];
	demographic_trends: {
		growing_segments: string[];
		declining_segments: string[];
	};
}

/**
 * Analyze demographic profile for given entities or tags
 */
export async function analyzeDemographicProfile(
	input: {
		entities?: string[];
		tags?: string[];
	}
): Promise<DemographicProfile> {
	const client = getQlooClient();

	try {
		const response = await client.getInsights<QlooDemographicsResponse>({
			'filter.type': 'urn:demographics',
			...(input.entities && { 'signal.interests.entities': input.entities }),
			...(input.tags && { 'signal.interests.tags': input.tags })
		});

		if (!response.success || !response.results?.demographics?.length) {
			throw new QlooApiError('No demographic data available');
		}

		const demographics = response.results.demographics[0];
		
		// Aggregate demographic data if multiple entities
		const ageData = demographics.query.age || {};
		const genderData = demographics.query.gender || {};

		// Find dominant groups
		const dominantAgeGroup = Object.entries(ageData).reduce((a, b) =>
			ageData[a[0] as keyof typeof ageData] > ageData[b[0] as keyof typeof ageData] ? a : b
		)[0];

		const dominantGender = Object.entries(genderData).reduce((a, b) =>
			genderData[a[0] as keyof typeof genderData] > genderData[b[0] as keyof typeof genderData] ? a : b
		)[0];

		// Calculate diversity score (how evenly distributed the demographics are)
		const ageValues = Object.values(ageData);
		const genderValues = Object.values(genderData);
		const diversityScore = calculateDiversityScore([...ageValues, ...genderValues]);

		return {
			age_distribution: {
				'24_and_younger': ageData['24_and_younger'] || 0,
				'25_to_29': ageData['25_to_29'] || 0,
				'30_to_34': ageData['30_to_34'] || 0,
				'35_to_44': ageData['35_to_44'] || 0,
				'45_to_54': ageData['45_to_54'] || 0,
				'55_and_older': ageData['55_and_older'] || 0
			},
			gender_distribution: {
				male: genderData.male || 0,
				female: genderData.female || 0
			},
			dominant_age_group: dominantAgeGroup,
			dominant_gender: dominantGender,
			diversity_score: diversityScore
		};
	} catch (error) {
		throw new QlooApiError(
			`Demographic analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Get comprehensive demographic insights
 */
export async function getDemographicInsights(
	input: {
		entities?: string[];
		tags?: string[];
	},
	targetEntityType?: QlooEntityType
): Promise<DemographicInsights> {
	const client = getQlooClient();

	try {
		// Get demographic profile
		const profile = await analyzeDemographicProfile(input);

		// Get available audiences for alignment analysis
		const audiencesResponse = await client.getAudiences();
		let audienceAlignment: Array<{ audience_id: string; name: string; affinity_score: number }> = [];

		if (audiencesResponse.success && audiencesResponse.results) {
			// Calculate alignment with available audiences
			audienceAlignment = audiencesResponse.results.audiences.map(audience => ({
				audience_id: audience.audience_id,
				name: audience.name,
				affinity_score: calculateAudienceAffinity(profile, audience)
			})).sort((a, b) => b.affinity_score - a.affinity_score).slice(0, 10);
		}

		// Get content recommendations if target type specified
		let recommendedContent: QlooEntity[] = [];
		if (targetEntityType) {
			const contentResponse = await client.getInsights<QlooEntitiesResponse>({
				'filter.type': targetEntityType,
				...(input.entities && { 'signal.interests.entities': input.entities }),
				...(input.tags && { 'signal.interests.tags': input.tags }),
				limit: 20
			});

			if (contentResponse.success && contentResponse.results) {
				recommendedContent = contentResponse.results.entities || [];
			}
		}

		// Analyze demographic trends
		const trends = analyzeDemographicTrends(profile);

		return {
			profile,
			audience_alignment: audienceAlignment,
			recommended_content: recommendedContent,
			demographic_trends: trends
		};
	} catch (error) {
		throw new QlooApiError(
			`Demographic insights failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Compare demographic profiles between entities
 */
export async function compareDemographicProfiles(
	entityA: string,
	entityB: string
): Promise<{
	profile_a: DemographicProfile;
	profile_b: DemographicProfile;
	similarity_score: number;
	key_differences: {
		age_gap: number;
		gender_preference_difference: number;
		diversity_difference: number;
	};
	overlap_analysis: {
		age_overlap: Record<string, number>;
		gender_overlap: Record<string, number>;
	};
}> {
	try {
		const [profileA, profileB] = await Promise.all([
			analyzeDemographicProfile({ entities: [entityA] }),
			analyzeDemographicProfile({ entities: [entityB] })
		]);

		// Calculate similarity score
		const similarityScore = calculateDemographicSimilarity(profileA, profileB);

		// Analyze key differences
		const keyDifferences = {
			age_gap: calculateAgeGap(profileA.age_distribution, profileB.age_distribution),
			gender_preference_difference: Math.abs(
				(profileA.gender_distribution.male - profileA.gender_distribution.female) -
				(profileB.gender_distribution.male - profileB.gender_distribution.female)
			),
			diversity_difference: Math.abs(profileA.diversity_score - profileB.diversity_score)
		};

		// Calculate overlap
		const overlapAnalysis = {
			age_overlap: calculateAgeOverlap(profileA.age_distribution, profileB.age_distribution),
			gender_overlap: calculateGenderOverlap(profileA.gender_distribution, profileB.gender_distribution)
		};

		return {
			profile_a: profileA,
			profile_b: profileB,
			similarity_score: similarityScore,
			key_differences: keyDifferences,
			overlap_analysis: overlapAnalysis
		};
	} catch (error) {
		throw new QlooApiError(
			`Demographic comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Get demographic-based content recommendations
 */
export async function getDemographicRecommendations(
	targetDemographic: {
		age_groups?: string[];
		genders?: string[];
		audiences?: string[];
	},
	contentType: QlooEntityType,
	limit: number = 20
): Promise<{
	recommendations: QlooEntity[];
	demographic_match_scores: Record<string, number>;
}> {
	const client = getQlooClient();

	try {
		// Build query parameters
		const params: any = {
			'filter.type': contentType,
			limit
		};

		// Add audience signals if provided
		if (targetDemographic.audiences?.length) {
			params['signal.demographics.audiences'] = targetDemographic.audiences;
		}

		const response = await client.getInsights<QlooEntitiesResponse>(params);

		if (!response.success || !response.results) {
			throw new QlooApiError('Failed to get demographic recommendations');
		}

		const recommendations = response.results.entities || [];

		// Calculate match scores for each recommendation
		const matchScores: Record<string, number> = {};
		for (const entity of recommendations) {
			if (entity.entity_id) {
				try {
					const entityProfile = await analyzeDemographicProfile({ entities: [entity.entity_id] });
					matchScores[entity.entity_id] = calculateTargetDemographicMatch(entityProfile, targetDemographic);
				} catch {
					matchScores[entity.entity_id] = 0.5; // Default score if analysis fails
				}
			}
		}

		return {
			recommendations,
			demographic_match_scores: matchScores
		};
	} catch (error) {
		throw new QlooApiError(
			`Demographic recommendations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Analyze demographic trends and patterns
 */
export async function analyzeDemographicTrends(
	entities: string[],
	timeframe?: 'recent' | 'historical'
): Promise<{
	trending_demographics: DemographicProfile;
	growth_segments: Array<{ segment: string; growth_rate: number }>;
	decline_segments: Array<{ segment: string; decline_rate: number }>;
	stability_index: number;
}> {
	try {
		// For now, analyze current demographics
		// In a full implementation, this would compare historical data
		const currentProfile = await analyzeDemographicProfile({ entities });

		// Simulate trend analysis (in reality, this would use historical data)
		const trendingDemographics = currentProfile;
		
		// Mock growth and decline data
		const growthSegments = [
			{ segment: '25_to_29', growth_rate: 0.15 },
			{ segment: '30_to_34', growth_rate: 0.08 }
		];

		const declineSegments = [
			{ segment: '45_to_54', decline_rate: -0.05 },
			{ segment: '55_and_older', decline_rate: -0.12 }
		];

		const stabilityIndex = calculateStabilityIndex(currentProfile);

		return {
			trending_demographics: trendingDemographics,
			growth_segments: growthSegments,
			decline_segments: declineSegments,
			stability_index: stabilityIndex
		};
	} catch (error) {
		throw new QlooApiError(
			`Demographic trends analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

// Helper functions

function calculateDiversityScore(values: number[]): number {
	if (values.length === 0) return 0;
	
	const total = values.reduce((sum, val) => sum + Math.abs(val), 0);
	if (total === 0) return 0;
	
	const normalized = values.map(val => Math.abs(val) / total);
	const entropy = -normalized.reduce((sum, p) => p > 0 ? sum + p * Math.log2(p) : sum, 0);
	const maxEntropy = Math.log2(values.length);
	
	return maxEntropy > 0 ? entropy / maxEntropy : 0;
}

function calculateAudienceAffinity(profile: DemographicProfile, audience: any): number {
	// Simplified affinity calculation
	// In reality, this would use more sophisticated matching algorithms
	return Math.random() * 0.5 + 0.5; // Mock implementation
}

function calculateDemographicSimilarity(profileA: DemographicProfile, profileB: DemographicProfile): number {
	const ageKeys = Object.keys(profileA.age_distribution) as Array<keyof typeof profileA.age_distribution>;
	const genderKeys = Object.keys(profileA.gender_distribution) as Array<keyof typeof profileA.gender_distribution>;
	
	let ageSimilarity = 0;
	let genderSimilarity = 0;
	
	// Calculate age similarity
	for (const key of ageKeys) {
		const diff = Math.abs(profileA.age_distribution[key] - profileB.age_distribution[key]);
		ageSimilarity += (1 - diff);
	}
	ageSimilarity /= ageKeys.length;
	
	// Calculate gender similarity
	for (const key of genderKeys) {
		const diff = Math.abs(profileA.gender_distribution[key] - profileB.gender_distribution[key]);
		genderSimilarity += (1 - diff);
	}
	genderSimilarity /= genderKeys.length;
	
	return (ageSimilarity + genderSimilarity) / 2;
}

function calculateAgeGap(ageA: DemographicProfile['age_distribution'], ageB: DemographicProfile['age_distribution']): number {
	// Calculate weighted average age for each profile
	const ageWeights = {
		'24_and_younger': 22,
		'25_to_29': 27,
		'30_to_34': 32,
		'35_to_44': 39.5,
		'45_to_54': 49.5,
		'55_and_older': 60
	};
	
	let avgAgeA = 0, totalWeightA = 0;
	let avgAgeB = 0, totalWeightB = 0;
	
	for (const [ageGroup, weight] of Object.entries(ageWeights)) {
		const key = ageGroup as keyof typeof ageA;
		avgAgeA += ageA[key] * weight;
		totalWeightA += ageA[key];
		avgAgeB += ageB[key] * weight;
		totalWeightB += ageB[key];
	}
	
	avgAgeA = totalWeightA > 0 ? avgAgeA / totalWeightA : 0;
	avgAgeB = totalWeightB > 0 ? avgAgeB / totalWeightB : 0;
	
	return Math.abs(avgAgeA - avgAgeB);
}

function calculateAgeOverlap(ageA: DemographicProfile['age_distribution'], ageB: DemographicProfile['age_distribution']): Record<string, number> {
	const overlap: Record<string, number> = {};
	
	for (const key of Object.keys(ageA) as Array<keyof typeof ageA>) {
		overlap[key] = Math.min(ageA[key], ageB[key]);
	}
	
	return overlap;
}

function calculateGenderOverlap(genderA: DemographicProfile['gender_distribution'], genderB: DemographicProfile['gender_distribution']): Record<string, number> {
	return {
		male: Math.min(genderA.male, genderB.male),
		female: Math.min(genderA.female, genderB.female)
	};
}

function calculateTargetDemographicMatch(profile: DemographicProfile, target: any): number {
	// Simplified matching - in reality, this would be more sophisticated
	return Math.random() * 0.4 + 0.6; // Mock implementation
}

function calculateStabilityIndex(profile: DemographicProfile): number {
	// Calculate how stable/balanced the demographic distribution is
	const ageValues = Object.values(profile.age_distribution);
	const genderValues = Object.values(profile.gender_distribution);
	
	const ageStability = calculateDiversityScore(ageValues);
	const genderStability = calculateDiversityScore(genderValues);
	
	return (ageStability + genderStability) / 2;
}
