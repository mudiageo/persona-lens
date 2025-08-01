import type {
	QlooApiConfig,
	QlooApiResponse,
	QlooInsightsParams,
	QlooSearchParams,
	QlooAnalysisParams,
	QlooTagsResponse,
	QlooEntitiesResponse,
	QlooDemographicsResponse,
	QlooSearchResponse,
	QlooAudiencesResponse,
	QlooTasteProfile,
	QlooCrossDomainAffinity,
	QlooCulturalContext,
	QlooEntityType,
	QlooLocation
} from '$lib/types/qloo';

/**
 * Core Qloo API Client
 * Provides access to Qloo's Insights API for taste-based recommendations and analysis
 */
export class QlooApiClient {
	private config: Required<QlooApiConfig>;

	constructor(config: QlooApiConfig) {
		this.config = {
			apiKey: config.apiKey,
			baseUrl: config.baseUrl || (config.isHackathon ? 'https://hackathon.api.qloo.com' : 'https://staging.api.qloo.com'),
			isHackathon: config.isHackathon || false
		};
	}

	/**
	 * Make authenticated request to Qloo API
	 */
	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<QlooApiResponse<T>> {
		try {
			const url = `${this.config.baseUrl}${endpoint}`;
			
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': this.config.apiKey,
					...options.headers
				},
				...options
			});

			const data = await response.json();

			if (!response.ok) {
				console.error('[QlooApiClient] Request failed:', {
					url,
					status: response.status,
					error: data.error,
					data
				});
				throw new QlooApiError(
					data.error || `Request failed with status ${response.status}`,
					response.status,
					data
				);
			}

			return data as QlooApiResponse<T>;
		} catch (error) {
			console.error('[QlooApiClient] Request error:', {
				endpoint,
				error: error instanceof Error ? error.message : error
			});
			if (error instanceof QlooApiError) {
				throw error;
			}
			
			throw new QlooApiError(
				`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				0,
				error
			);
		}
	}

	/**
	 * Build query string from parameters
	 */
	private buildQueryString(params: Record<string, any>): string {
		const searchParams = new URLSearchParams();
		
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					searchParams.append(key, value.join(','));
				} else {
					searchParams.append(key, String(value));
				}
			}
		});

		return searchParams.toString();
	}

	/**
	 * Get insights based on specified parameters
	 */
	async getInsights<T = QlooEntitiesResponse | QlooTagsResponse | QlooDemographicsResponse>(
		params: QlooInsightsParams
	): Promise<QlooApiResponse<T>> {
		const queryString = this.buildQueryString(params);
		return this.makeRequest<T>(`/v2/insights?${queryString}`);
	}

	/**
	 * Search for entities by name or query
	 */
	async searchEntities(params: QlooSearchParams): Promise<QlooApiResponse<QlooSearchResponse>> {
		const queryString = this.buildQueryString(params);
		return this.makeRequest<QlooSearchResponse>(`/search?${queryString}`);
	}

	/**
	 * Get entity details by ID
	 */
	async getEntityById(entityId: string): Promise<QlooApiResponse<{ entities: any[] }>> {
		return this.makeRequest(`/entities?entity_ids=${entityId}`);
	}

	/**
	 * Search for tags
	 */
	async searchTags(query: string, types?: string[]): Promise<QlooApiResponse<{ tags: any[] }>> {
		const params: Record<string, any> = { query };
		if (types && types.length > 0) {
			params.types = types.join(',');
		}
		const queryString = this.buildQueryString(params);
		return this.makeRequest(`/v2/tags?${queryString}`);
	}

	/**
	 * Get available audiences
	 */
	async getAudiences(): Promise<QlooApiResponse<QlooAudiencesResponse>> {
		return this.makeRequest<QlooAudiencesResponse>('/v2/audiences');
	}

	/**
	 * Get analysis data
	 */
	async getAnalysis(params: QlooAnalysisParams): Promise<QlooApiResponse<any>> {
		const queryString = this.buildQueryString(params);
		return this.makeRequest(`/analysis?${queryString}`);
	}

	/**
	 * Get trending data
	 */
	async getTrending(entityType: QlooEntityType, limit?: number): Promise<QlooApiResponse<QlooEntitiesResponse>> {
		const params: Record<string, any> = { 'filter.type': entityType };
		if (limit) params.limit = limit;
		const queryString = this.buildQueryString(params);
		return this.makeRequest<QlooEntitiesResponse>(`/trending?${queryString}`);
	}
}

/**
 * QlooApiError class for handling API errors
 */
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

// Export singleton instance factory
let clientInstance: QlooApiClient | null = null;

export function createQlooClient(config: QlooApiConfig): QlooApiClient {
	clientInstance = new QlooApiClient(config);
	return clientInstance;
}

export function getQlooClient(): QlooApiClient {
	if (!clientInstance) {
		throw new Error('Qloo client not initialized. Call createQlooClient() first.');
	}
	return clientInstance;
}
