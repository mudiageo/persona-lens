import type { APIResponse, PersonaGenerationRequest, PersonaProfile } from '$lib/types/api';
import { setLoadingState } from '$lib/stores/loading';

class APIClient {
	private baseUrl = '/api';

	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<APIResponse<T>> {
		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				headers: {
					'Content-Type': 'application/json',
					...options.headers
				},
				...options
			});

			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					error: data.error || `Request failed with status ${response.status}`
				};
			}

			return {
				success: true,
				data: data.data || data,
				message: data.message
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Network error'
			};
		}
	}

	async testAPIConnections(): Promise<APIResponse<{ llm: { openai: boolean; anthropic: boolean; gemini: boolean }; qloo: boolean }>> {
		setLoadingState('api-test', { isLoading: true, error: null });
		
		try {
			const result = await this.makeRequest<{ llm: { openai: boolean; anthropic: boolean; gemini: boolean }; qloo: boolean }>('/test');
			
			setLoadingState('api-test', { 
				isLoading: false, 
				error: result.success ? null : { 
					code: 'API_TEST_FAILED',
					message: result.error || 'API test failed',
					timestamp: new Date().toISOString()
				}
			});
			
			return result;
		} catch (error) {
			const errorState = {
				code: 'NETWORK_ERROR',
				message: error instanceof Error ? error.message : 'Network error',
				timestamp: new Date().toISOString()
			};
			
			setLoadingState('api-test', { isLoading: false, error: errorState });
			
			return {
				success: false,
				error: errorState.message
			};
		}
	}

	async generatePersona(request: PersonaGenerationRequest): Promise<APIResponse<PersonaProfile>> {
		setLoadingState('persona-generation', { 
			isLoading: true, 
			error: null,
			progress: 0,
			stage: 'Sending request'
		});
		
		try {
			// Simulate progress updates
			let progressInterval: NodeJS.Timeout | undefined;
			
			progressInterval = setInterval(() => {
				setLoadingState('persona-generation', { 
					progress: 10 // Will be incremented
				});
			}, 500);

			const result = await this.makeRequest<PersonaProfile>('/personas', {
				method: 'POST',
				body: JSON.stringify(request)
			});

			if (progressInterval) clearInterval(progressInterval);
			
			setLoadingState('persona-generation', { 
				isLoading: false,
				progress: 100,
				stage: 'Complete',
				error: result.success ? null : { 
					code: 'PERSONA_GENERATION_FAILED',
					message: result.error || 'Persona generation failed',
					timestamp: new Date().toISOString()
				}
			});
			
			return result;
		} catch (error) {
			const errorState = {
				code: 'NETWORK_ERROR',
				message: error instanceof Error ? error.message : 'Network error',
				timestamp: new Date().toISOString()
			};
			
			setLoadingState('persona-generation', { 
				isLoading: false, 
				error: errorState 
			});
			
			return {
				success: false,
				error: errorState.message
			};
		}
	}

	async getPersonas(): Promise<APIResponse<any[]>> {
		return this.makeRequest<any[]>('/personas');
	}
}

// Singleton instance
export const apiClient = new APIClient();
