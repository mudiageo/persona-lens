// Qloo API Types
export interface QlooApiConfig {
	apiKey: string;
	baseUrl?: string;
	isHackathon?: boolean;
}

export interface QlooApiResponse<T = any> {
	success: boolean;
	results?: T;
	duration?: number;
	error?: string;
}

// Entity Types
export type QlooEntityType = 
	| 'urn:entity:artist'
	| 'urn:entity:book'
	| 'urn:entity:brand'
	| 'urn:entity:destination'
	| 'urn:entity:movie'
	| 'urn:entity:person'
	| 'urn:entity:place'
	| 'urn:entity:podcast'
	| 'urn:entity:tv_show'
	| 'urn:entity:video_game';

export type QlooFilterType = QlooEntityType | 'urn:demographics' | 'urn:tag';

// Tag Types
export interface QlooTag {
	tag_id: string;
	name: string;
	types: string[];
	subtype: string;
	tag_value: string;
	query?: Record<string, any>;
}

// Entity Types
export interface QlooEntity {
	name: string;
	entity_id: string;
	type: string;
	subtype: string;
	properties?: Record<string, any>;
	popularity?: number;
	tags?: QlooTag[];
}

// Demographics
export interface QlooDemographics {
	entity_id: string;
	query: {
		age?: {
			'24_and_younger': number;
			'25_to_29': number;
			'30_to_34': number;
			'35_to_44': number;
			'45_to_54': number;
			'55_and_older': number;
		};
		gender?: {
			male: number;
			female: number;
		};
	};
}

// Location
export interface QlooLocation {
	query?: string;
	latitude?: number;
	longitude?: number;
	radius?: number;
	address?: string;
}

// Request Parameters
export interface QlooInsightsParams {
	'filter.type': QlooFilterType;
	'filter.tags'?: string | string[];
	'filter.tag.types'?: string | string[];
	'filter.parents.types'?: string | string[];
	'signal.demographics.audiences'?: string | string[];
	'signal.interests.entities'?: string | string[];
	'signal.interests.tags'?: string | string[];
	'signal.location'?: string;
	'signal.location.query'?: string;
	limit?: number;
	offset?: number;
}

// Search Parameters
export interface QlooSearchParams {
	query: string;
	types?: string | string[];
	limit?: number;
	offset?: number;
}

// Analysis Parameters
export interface QlooAnalysisParams {
	entities?: string | string[];
	tags?: string | string[];
	demographics?: string | string[];
	location?: QlooLocation;
}

// Response Types
export interface QlooTagsResponse {
	tags: QlooTag[];
}

export interface QlooEntitiesResponse {
	entities: QlooEntity[];
}

export interface QlooDemographicsResponse {
	demographics: QlooDemographics[];
}

export interface QlooSearchResponse {
	entities: QlooEntity[];
}

export interface QlooAudiencesResponse {
	audiences: Array<{
		audience_id: string;
		name: string;
		description?: string;
		type: string;
	}>;
}

// Error Types
export class QlooApiError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public response?: any
	) {
		super(message);
		this.name = 'QlooApiError';
	}
}

// Cultural Context Types
export interface QlooCulturalContext {
	region: string;
	language?: string;
	cultural_traits?: string[];
	local_preferences?: Record<string, number>;
}

// Cross-Domain Affinity Types
export interface QlooCrossDomainAffinity {
	source_entity: string;
	target_domain: QlooEntityType;
	affinity_score: number;
	related_entities: QlooEntity[];
}

// Taste Profile Types
export interface QlooTasteProfile {
	entity_id: string;
	taste_tags: QlooTag[];
	affinity_scores: Record<string, number>;
	demographic_alignment: QlooDemographics;
	cultural_context?: QlooCulturalContext;
}
