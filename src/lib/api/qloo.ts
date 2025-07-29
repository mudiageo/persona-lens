import { env } from '$env/dynamic/private';
import type { 
	QlooRecommendationRequest,
	QlooRecommendation,
	QlooResponse,
	QlooTasteProfile,
	APIResponse,
	APIError 
} from '$lib/types/api';

export class QlooAPIError extends Error {
	constructor(
		public code: string,
		message: string,
		public details?: any
	) {
		super(message);
		this.name = 'QlooAPIError';
	}
}

export class QlooClient {
	private apiKey: string;
	private baseUrl: string;

	constructor() {
		this.apiKey = env.QLOO_API_KEY || '';
		this.baseUrl = env.QLOO_API_URL || 'https://api.qloo.com/v1';

		if (!this.apiKey) {
			throw new QlooAPIError(
				'MISSING_API_KEY',
				'Qloo API key not found in environment variables'
			);
		}
	}

	private async makeRequest<T>(
		endpoint: string,
		data?: any,
		method: 'GET' | 'POST' = 'GET'
	): Promise<T> {
		try {
			const options: RequestInit = {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.apiKey}`,
					'Accept': 'application/json'
				}
			};

			if (data && method === 'POST') {
				options.body = JSON.stringify(data);
			}

			const url = data && method === 'GET' 
				? `${this.baseUrl}${endpoint}?${new URLSearchParams(data).toString()}`
				: `${this.baseUrl}${endpoint}`;

			const response = await fetch(url, options);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new QlooAPIError(
					`HTTP_${response.status}`,
					errorData.error?.message || `Request failed with status ${response.status}`,
					errorData
				);
			}

			return await response.json();
		} catch (error) {
			if (error instanceof QlooAPIError) {
				throw error;
			}
			throw new QlooAPIError(
				'NETWORK_ERROR',
				'Failed to connect to Qloo API',
				error
			);
		}
	}

	async getRecommendations(request: QlooRecommendationRequest): Promise<APIResponse<QlooRecommendation[]>> {
		try {
			const response = await this.makeRequest<QlooResponse<QlooRecommendation[]>>(
				'/recommendations',
				request,
				'POST'
			);

			if (response.status === 'success') {
				return {
					success: true,
					data: response.data
				};
			} else {
				return {
					success: false,
					error: response.error?.message || 'Failed to get recommendations'
				};
			}
		} catch (error) {
			const apiError = error as APIError;
			return {
				success: false,
				error: apiError.message || 'Error fetching recommendations'
			};
		}
	}

	async getTasteProfile(entityId: string, entityType: string = 'person'): Promise<APIResponse<QlooTasteProfile[]>> {
		try {
			const response = await this.makeRequest<QlooResponse<QlooTasteProfile[]>>(
				'/taste-profile',
				{ entity_id: entityId, entity_type: entityType }
			);

			if (response.status === 'success') {
				return {
					success: true,
					data: response.data
				};
			} else {
				return {
					success: false,
					error: response.error?.message || 'Failed to get taste profile'
				};
			}
		} catch (error) {
			const apiError = error as APIError;
			return {
				success: false,
				error: apiError.message || 'Error fetching taste profile'
			};
		}
	}

	async searchEntities(query: string, type?: string, limit: number = 10): Promise<APIResponse<any[]>> {
		try {
			const params: any = {
				q: query,
				limit: limit.toString()
			};

			if (type) {
				params.type = type;
			}

			const response = await this.makeRequest<QlooResponse<any[]>>(
				'/search',
				params
			);

			if (response.status === 'success') {
				return {
					success: true,
					data: response.data
				};
			} else {
				return {
					success: false,
					error: response.error?.message || 'Failed to search entities'
				};
			}
		} catch (error) {
			const apiError = error as APIError;
			return {
				success: false,
				error: apiError.message || 'Error searching entities'
			};
		}
	}

	async getCulturalInsights(
		demographic: Record<string, any>,
		interests: string[]
	): Promise<APIResponse<QlooRecommendation[]>> {
		try {
			const request: QlooRecommendationRequest = {
				input: {
					type: 'demographic',
					data: {
						...demographic,
						interests
					}
				},
				output_types: ['culture', 'lifestyle', 'brand', 'media'],
				count: 50
			};

			return await this.getRecommendations(request);
		} catch (error) {
			return {
				success: false,
				error: 'Error fetching cultural insights'
			};
		}
	}

	async getBrandAffinities(tasteProfile: QlooTasteProfile[]): Promise<APIResponse<QlooRecommendation[]>> {
		try {
			const request: QlooRecommendationRequest = {
				input: {
					type: 'taste_profile',
					data: tasteProfile
				},
				output_types: ['brand', 'product'],
				count: 30
			};

			return await this.getRecommendations(request);
		} catch (error) {
			return {
				success: false,
				error: 'Error fetching brand affinities'
			};
		}
	}

	async testConnection(): Promise<APIResponse<boolean>> {
		try {
			// Test with a simple search query
			const response = await this.searchEntities('test', undefined, 1);
			
			return {
				success: response.success,
				data: response.success,
				message: response.success ? 'Qloo API connection successful' : 'Qloo API connection failed'
			};
		} catch (error) {
			return {
				success: false,
				data: false,
				error: 'Failed to test Qloo API connection'
			};
		}
	}
}

// Singleton instance
export const qlooClient = new QlooClient();
