import { getQlooClient, QlooApiError } from './qloo-client';
import type {
	QlooEntity,
	QlooEntityType,
	QlooEntitiesResponse,
	QlooCrossDomainAffinity
} from '$lib/types/qloo';

/**
 * Cross-Domain Affinity Functions
 * Provides functions to retrieve and analyze affinities across different content domains
 */

export interface CrossDomainAffinityMap {
	source_entity: QlooEntity;
	domain_affinities: Record<QlooEntityType, {
		entities: QlooEntity[];
		average_affinity: number;
		top_affinity_score: number;
	}>;
	strongest_domain: QlooEntityType;
	weakest_domain: QlooEntityType;
}

export interface AffinityCluster {
	cluster_id: string;
	entities: QlooEntity[];
	domains: QlooEntityType[];
	coherence_score: number;
	representative_tags: string[];
}

/**
 * Get cross-domain affinities for a given entity
 */
export async function getCrossDomainAffinities(
	sourceEntityId: string,
	targetDomains: QlooEntityType[] = [
		'urn:entity:movie',
		'urn:entity:tv_show',
		'urn:entity:book',
		'urn:entity:artist',
		'urn:entity:brand',
		'urn:entity:destination'
	],
	limit: number = 10
): Promise<CrossDomainAffinityMap> {
	const client = getQlooClient();

	try {
		// Get source entity details first
		const sourceResponse = await client.getEntityById(sourceEntityId);
		if (!sourceResponse.success || !sourceResponse.results?.entities?.length) {
			throw new QlooApiError('Source entity not found');
		}
		
		const sourceEntity = sourceResponse.results.entities[0];

		// Get affinities for each target domain
		const domainAffinities: Record<QlooEntityType, any> = {};
		
		await Promise.all(
			targetDomains.map(async (domain) => {
				try {
					const response = await client.getInsights<QlooEntitiesResponse>({
						'filter.type': domain,
						'signal.interests.entities': [sourceEntityId],
						limit
					});

					if (response.success && response.results?.entities) {
						const entities = response.results.entities;
						const affinityScores = entities.map((e, index) => 
							Math.max(0.1, 1 - (index / entities.length)) // Simple scoring based on ranking
						);
						
						domainAffinities[domain] = {
							entities,
							average_affinity: affinityScores.reduce((a, b) => a + b, 0) / affinityScores.length,
							top_affinity_score: affinityScores[0] || 0
						};
					} else {
						domainAffinities[domain] = {
							entities: [],
							average_affinity: 0,
							top_affinity_score: 0
						};
					}
				} catch (error) {
					console.warn(`Failed to get affinities for domain ${domain}:`, error);
					domainAffinities[domain] = {
						entities: [],
						average_affinity: 0,
						top_affinity_score: 0
					};
				}
			})
		);

		// Find strongest and weakest domains
		const domainScores = Object.entries(domainAffinities).map(
			([domain, data]) => ({ domain: domain as QlooEntityType, score: data.average_affinity })
		);
		
		domainScores.sort((a, b) => b.score - a.score);
		
		const strongestDomain = domainScores[0]?.domain || targetDomains[0];
		const weakestDomain = domainScores[domainScores.length - 1]?.domain || targetDomains[0];

		return {
			source_entity: sourceEntity,
			domain_affinities: domainAffinities,
			strongest_domain: strongestDomain,
			weakest_domain: weakestDomain
		};
	} catch (error) {
		throw new QlooApiError(
			`Cross-domain affinity retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Find entities with strong cross-domain appeal
 */
export async function findCrossDomainInfluencers(
	domains: QlooEntityType[],
	minAffinityScore: number = 0.7,
	limit: number = 20
): Promise<Array<{
	entity: QlooEntity;
	cross_domain_score: number;
	influenced_domains: QlooEntityType[];
	affinity_details: Record<QlooEntityType, number>;
}>> {
	const client = getQlooClient();

	try {
		// Get popular entities from the first domain as candidates
		const candidatesResponse = await client.getInsights<QlooEntitiesResponse>({
			'filter.type': domains[0],
			limit: limit * 2 // Get more candidates to filter
		});

		if (!candidatesResponse.success || !candidatesResponse.results?.entities) {
			throw new QlooApiError('Failed to get candidate entities');
		}

		const candidates = candidatesResponse.results.entities;
		const influencers = [];

		// Test each candidate for cross-domain influence
		for (const candidate of candidates.slice(0, limit)) {
			try {
				const affinityMap = await getCrossDomainAffinities(candidate.entity_id, domains, 5);
				
				// Calculate cross-domain score
				const domainScores = Object.values(affinityMap.domain_affinities)
					.map(data => data.average_affinity);
				
				const crossDomainScore = domainScores.reduce((a, b) => a + b, 0) / domainScores.length;
				const influencedDomains = domains.filter(domain => 
					affinityMap.domain_affinities[domain]?.average_affinity >= minAffinityScore
				);

				if (crossDomainScore >= minAffinityScore && influencedDomains.length >= 2) {
					const affinityDetails: Record<QlooEntityType, number> = {};
					domains.forEach(domain => {
						affinityDetails[domain] = affinityMap.domain_affinities[domain]?.average_affinity || 0;
					});

					influencers.push({
						entity: candidate,
						cross_domain_score: crossDomainScore,
						influenced_domains: influencedDomains,
						affinity_details: affinityDetails
					});
				}
			} catch (error) {
				// Skip entities that cause errors
				console.warn(`Failed to analyze entity ${candidate.entity_id}:`, error);
			}
		}

		// Sort by cross-domain score
		influencers.sort((a, b) => b.cross_domain_score - a.cross_domain_score);

		return influencers.slice(0, limit);
	} catch (error) {
		throw new QlooApiError(
			`Cross-domain influencer analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Analyze affinity clusters across domains
 */
export async function analyzeAffinityClusters(
	entities: string[],
	domains: QlooEntityType[],
	maxClusters: number = 5
): Promise<AffinityCluster[]> {
	const client = getQlooClient();

	try {
		// Get cross-domain data for all entities
		const entityAffinities = new Map<string, CrossDomainAffinityMap>();
		
		await Promise.all(
			entities.map(async (entityId) => {
				try {
					const affinity = await getCrossDomainAffinities(entityId, domains, 20);
					entityAffinities.set(entityId, affinity);
				} catch (error) {
					console.warn(`Failed to get affinities for entity ${entityId}:`, error);
				}
			})
		);

		// Simple clustering based on domain affinity patterns
		const clusters: AffinityCluster[] = [];
		const processedEntities = new Set<string>();

		let clusterId = 1;
		for (const [entityId, affinityData] of entityAffinities) {
			if (processedEntities.has(entityId)) continue;

			const cluster: AffinityCluster = {
				cluster_id: `cluster_${clusterId++}`,
				entities: [affinityData.source_entity],
				domains: [affinityData.strongest_domain],
				coherence_score: 0,
				representative_tags: []
			};

			processedEntities.add(entityId);

			// Find similar entities for this cluster
			for (const [otherEntityId, otherAffinityData] of entityAffinities) {
				if (processedEntities.has(otherEntityId)) continue;

				// Check similarity based on strongest domains
				if (otherAffinityData.strongest_domain === affinityData.strongest_domain) {
					cluster.entities.push(otherAffinityData.source_entity);
					processedEntities.add(otherEntityId);
					
					if (!cluster.domains.includes(otherAffinityData.strongest_domain)) {
						cluster.domains.push(otherAffinityData.strongest_domain);
					}
				}
			}

			// Calculate coherence score
			cluster.coherence_score = calculateClusterCoherence(cluster);

			// Get representative tags (simplified)
			cluster.representative_tags = getRepresentativeTags(cluster.entities);

			clusters.push(cluster);

			if (clusters.length >= maxClusters) break;
		}

		// Sort clusters by coherence score
		clusters.sort((a, b) => b.coherence_score - a.coherence_score);

		return clusters.slice(0, maxClusters);
	} catch (error) {
		throw new QlooApiError(
			`Affinity cluster analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Get recommendation bridges between domains
 */
export async function getRecommendationBridges(
	sourceDomain: QlooEntityType,
	targetDomain: QlooEntityType,
	sourceEntities: string[],
	limit: number = 10
): Promise<Array<{
	bridge_entity: QlooEntity;
	bridge_strength: number;
	source_connections: QlooEntity[];
	target_connections: QlooEntity[];
}>> {
	const client = getQlooClient();

	try {
		// Get entities from target domain that have affinity to source entities
		const bridgeResponse = await client.getInsights<QlooEntitiesResponse>({
			'filter.type': targetDomain,
			'signal.interests.entities': sourceEntities,
			limit: limit * 2
		});

		if (!bridgeResponse.success || !bridgeResponse.results?.entities) {
			throw new QlooApiError('Failed to find bridge entities');
		}

		const bridges = [];
		
		for (const bridgeEntity of bridgeResponse.results.entities.slice(0, limit)) {
			try {
				// Get connections back to source domain
				const sourceConnectionsResponse = await client.getInsights<QlooEntitiesResponse>({
					'filter.type': sourceDomain,
					'signal.interests.entities': [bridgeEntity.entity_id],
					limit: 5
				});

				// Get connections within target domain
				const targetConnectionsResponse = await client.getInsights<QlooEntitiesResponse>({
					'filter.type': targetDomain,
					'signal.interests.entities': [bridgeEntity.entity_id],
					limit: 5
				});

				const sourceConnections = sourceConnectionsResponse.success && sourceConnectionsResponse.results 
					? sourceConnectionsResponse.results.entities || []
					: [];

				const targetConnections = targetConnectionsResponse.success && targetConnectionsResponse.results
					? targetConnectionsResponse.results.entities || []
					: [];

				// Calculate bridge strength based on connections
				const bridgeStrength = (sourceConnections.length + targetConnections.length) / 10;

				bridges.push({
					bridge_entity: bridgeEntity,
					bridge_strength: Math.min(1, bridgeStrength),
					source_connections: sourceConnections,
					target_connections: targetConnections
				});
			} catch (error) {
				console.warn(`Failed to analyze bridge entity ${bridgeEntity.entity_id}:`, error);
			}
		}

		// Sort by bridge strength
		bridges.sort((a, b) => b.bridge_strength - a.bridge_strength);

		return bridges;
	} catch (error) {
		throw new QlooApiError(
			`Recommendation bridge analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Analyze affinity patterns across multiple entities
 */
export async function analyzeAffinityPatterns(
	entities: string[],
	domains: QlooEntityType[]
): Promise<{
	common_affinities: Record<QlooEntityType, QlooEntity[]>;
	unique_affinities: Record<string, Record<QlooEntityType, QlooEntity[]>>;
	affinity_strength_matrix: Record<string, Record<QlooEntityType, number>>;
	pattern_insights: {
		most_connected_domain: QlooEntityType;
		least_connected_domain: QlooEntityType;
		consistency_score: number;
	};
}> {
	try {
		// Get affinities for all entities
		const entityAffinities = new Map<string, CrossDomainAffinityMap>();
		
		await Promise.all(
			entities.map(async (entityId) => {
				try {
					const affinity = await getCrossDomainAffinities(entityId, domains, 10);
					entityAffinities.set(entityId, affinity);
				} catch (error) {
					console.warn(`Failed to get affinities for entity ${entityId}:`, error);
				}
			})
		);

		// Find common affinities
		const commonAffinities: Record<QlooEntityType, QlooEntity[]> = {};
		const uniqueAffinities: Record<string, Record<QlooEntityType, QlooEntity[]>> = {};
		const affinityStrengthMatrix: Record<string, Record<QlooEntityType, number>> = {};

		// Initialize structures
		domains.forEach(domain => {
			commonAffinities[domain] = [];
		});

		entities.forEach(entityId => {
			uniqueAffinities[entityId] = {};
			affinityStrengthMatrix[entityId] = {};
			domains.forEach(domain => {
				uniqueAffinities[entityId][domain] = [];
				affinityStrengthMatrix[entityId][domain] = 0;
			});
		});

		// Populate affinity data
		for (const [entityId, affinityData] of entityAffinities) {
			domains.forEach(domain => {
				const domainData = affinityData.domain_affinities[domain];
				if (domainData) {
					uniqueAffinities[entityId][domain] = domainData.entities;
					affinityStrengthMatrix[entityId][domain] = domainData.average_affinity;
				}
			});
		}

		// Find common entities across all source entities
		for (const domain of domains) {
			const entitySets = entities.map(entityId => 
				new Set(uniqueAffinities[entityId][domain].map(e => e.entity_id))
			);
			
			if (entitySets.length > 0) {
				const intersection = entitySets.reduce((acc, curr) => 
					new Set([...acc].filter(x => curr.has(x)))
				);
				
				// Get entity details for common entities
				commonAffinities[domain] = uniqueAffinities[entities[0]][domain]
					.filter(e => intersection.has(e.entity_id));
			}
		}

		// Calculate pattern insights
		const domainConnectivity = domains.map(domain => ({
			domain,
			connectivity: entities.reduce((sum, entityId) => 
				sum + affinityStrengthMatrix[entityId][domain], 0) / entities.length
		}));

		domainConnectivity.sort((a, b) => b.connectivity - a.connectivity);

		const mostConnectedDomain = domainConnectivity[0]?.domain || domains[0];
		const leastConnectedDomain = domainConnectivity[domainConnectivity.length - 1]?.domain || domains[0];

		// Calculate consistency score
		const consistencyScore = calculateAffinityConsistency(affinityStrengthMatrix, entities, domains);

		return {
			common_affinities: commonAffinities,
			unique_affinities: uniqueAffinities,
			affinity_strength_matrix: affinityStrengthMatrix,
			pattern_insights: {
				most_connected_domain: mostConnectedDomain,
				least_connected_domain: leastConnectedDomain,
				consistency_score: consistencyScore
			}
		};
	} catch (error) {
		throw new QlooApiError(
			`Affinity pattern analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

// Helper functions

function calculateClusterCoherence(cluster: AffinityCluster): number {
	// Simple coherence calculation based on entity count and domain diversity
	const entityCount = cluster.entities.length;
	const domainCount = cluster.domains.length;
	
	// More entities with fewer domains = higher coherence
	return entityCount / (domainCount + 1);
}

function getRepresentativeTags(entities: QlooEntity[]): string[] {
	// Extract common tags from entities
	const tagCounts = new Map<string, number>();
	
	entities.forEach(entity => {
		if (entity.tags) {
			entity.tags.forEach(tag => {
				tagCounts.set(tag.name, (tagCounts.get(tag.name) || 0) + 1);
			});
		}
	});

	// Return most common tags
	return Array.from(tagCounts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([tag]) => tag);
}

function calculateAffinityConsistency(
	matrix: Record<string, Record<QlooEntityType, number>>,
	entities: string[],
	domains: QlooEntityType[]
): number {
	// Calculate how consistent affinities are across entities
	let totalVariance = 0;
	let domainCount = 0;

	domains.forEach(domain => {
		const scores = entities.map(entityId => matrix[entityId][domain]);
		const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
		const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
		
		totalVariance += variance;
		domainCount++;
	});

	const avgVariance = totalVariance / domainCount;
	
	// Convert to consistency score (lower variance = higher consistency)
	return Math.max(0, 1 - avgVariance);
}
