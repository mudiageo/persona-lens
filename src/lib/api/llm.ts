import { env } from '$env/dynamic/private';
import type { 
	LLMRequest, 
	LLMResponse, 
	LLMMessage,
	APIResponse,
	APIError 
} from '$lib/types/api';

export class LLMAPIError extends Error {
	constructor(
		public code: string,
		message: string,
		public details?: any
	) {
		super(message);
		this.name = 'LLMAPIError';
	}
}

export class LLMClient {
	private apiKey: string;
	private baseUrl: string;
	private defaultModel: string;
	private provider: 'openai' | 'anthropic' | 'gemini';

	constructor(provider: 'openai' | 'anthropic' | 'gemini' = 'openai') {
		this.provider = provider;
		
		if (provider === 'openai') {
			this.apiKey = env.OPENAI_API_KEY || '';
			this.baseUrl = 'https://api.openai.com/v1';
			this.defaultModel = 'gpt-4';
		} else if (provider === 'anthropic') {
			this.apiKey = env.ANTHROPIC_API_KEY || '';
			this.baseUrl = 'https://api.anthropic.com/v1';
			this.defaultModel = 'claude-3-sonnet-20240229';
		} else if (provider === 'gemini') {
			this.apiKey = env.GEMINI_API_KEY || '';
			this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
			this.defaultModel = 'gemini-2.0-flash';
		} else {
			// Fallback to OpenAI
			this.apiKey = env.OPENAI_API_KEY || '';
			this.baseUrl = 'https://api.openai.com/v1';
			this.defaultModel = 'gpt-4';
		}

		if (!this.apiKey) {
			// throw new LLMAPIError(
			// 	'MISSING_API_KEY',
			// 	`${provider.toUpperCase()} API key not found in environment variables`
			// );
			console.log(`${provider.toUpperCase()} API key not found in environment variables`);
		}
	}

	private async makeRequest<T>(
		endpoint: string,
		data: any,
		options: RequestInit = {}
	): Promise<T> {
		try {
			let url: string;
			let headers: Record<string, string>;
			let body: string;

			if (this.provider === 'gemini') {
				// Gemini uses query parameter for API key
				url = `${this.baseUrl}${endpoint}`;
				headers = {
					'Content-Type': 'application/json',
						'X-goog-api-key': this.apiKey,
					...options.headers
				};
				// Transform data for Gemini format
				body = JSON.stringify(this.transformForGemini(data));
			} else if (this.provider === 'anthropic') {
				url = `${this.baseUrl}${endpoint}`;
				headers = {
					'Content-Type': 'application/json',
					'x-api-key': this.apiKey,
					'anthropic-version': '2023-06-01',
					...options.headers
				};
				// Transform data for Anthropic format
				body = JSON.stringify(this.transformForAnthropic(data));
			} else {
				// OpenAI format (default)
				url = `${this.baseUrl}${endpoint}`;
				headers = {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.apiKey}`,
					...options.headers
				};
				body = JSON.stringify(data);
			}

			const response = await fetch(url, {
				method: 'POST',
				headers,
				body,
				...options
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new LLMAPIError(
					`HTTP_${response.status}`,
					errorData.error?.message || `Request failed with status ${response.status}`,
					errorData
				);
			}

			const responseData = await response.json();
			
			// Transform response back to standard format
			if (this.provider === 'gemini') {
				return this.transformFromGemini(responseData) as T;
			} else if (this.provider === 'anthropic') {
				return this.transformFromAnthropic(responseData) as T;
			}
			
			return responseData;
		} catch (error) {
			if (error instanceof LLMAPIError) {
				throw error;
			}
			throw new LLMAPIError(
				'NETWORK_ERROR',
				'Failed to connect to LLM API',
				error
			);
		}
	}

	async generateCompletion(request: LLMRequest): Promise<APIResponse<LLMResponse>> {
		try {
			const requestData = {
				model: request.model || this.defaultModel,
				messages: request.messages,
				temperature: request.temperature || 0.7,
				max_tokens: request.max_tokens || 1000,
				stream: request.stream || false
			};

			let endpoint: string;
			if (this.provider === 'gemini') {
				endpoint = `/models/${this.defaultModel}:generateContent`;
			} else if (this.provider === 'anthropic') {
				endpoint = '/messages';
			} else {
				endpoint = '/chat/completions';
			}

			const response = await this.makeRequest<LLMResponse>(endpoint, requestData);
			
			return {
				success: true,
				data: response
			};
		} catch (error) {
			const apiError = error as APIError;
			return {
				success: false,
				error: apiError.message,
				data: undefined
			};
		}
	}

	async generatePersonaInsights(
		targetDescription: string,
		culturalContext?: string,
		businessContext?: string
	): Promise<APIResponse<string>> {
		const messages: LLMMessage[] = [
			{
				role: 'system',
				content: `You are a market research expert specializing in cultural analysis and persona development. 
				Generate detailed insights about target audiences based on cultural patterns, taste profiles, and behavioral nuances.
				Focus on actionable insights that go beyond basic demographics.`
			},
			{
				role: 'user',
				content: `Analyze this target audience: "${targetDescription}"
				${culturalContext ? `Cultural context: ${culturalContext}` : ''}
				${businessContext ? `Business context: ${businessContext}` : ''}
				
				Provide insights on:
				1. Cultural values and lifestyle preferences
				2. Decision-making patterns and motivations
				3. Communication and media consumption habits
				4. Brand affinities and taste profiles
				5. Marketing and engagement recommendations
				
				Format the response as structured insights with specific, actionable recommendations.`
			}
		];

		try {
			const response = await this.generateCompletion({ messages });
			
			if (response.success && response.data) {
				const content = response.data.choices[0]?.message?.content;
				return {
					success: true,
					data: content || ''
				};
			}
			
			return {
				success: false,
				error: response.error || 'Failed to generate insights'
			};
		} catch (error) {
			return {
				success: false,
				error: 'Error generating persona insights'
			};
		}
	}

	async testConnection(): Promise<APIResponse<boolean>> {
		try {
			const testMessages: LLMMessage[] = [
				{
					role: 'user',
					content: 'Hello, please respond with "Connection successful" to test the API.'
				}
			];

			const response = await this.generateCompletion({ 
				messages: testMessages,
				max_tokens: 50
			});

			return {
				success: response.success,
				data: response.success,
				message: response.success ? 'LLM API connection successful' : 'LLM API connection failed'
			};
		} catch (error) {
			return {
				success: false,
				data: false,
				error: 'Failed to test LLM API connection'
			};
		}
	}

	// Transformation methods for different API formats
	private transformForGemini(data: any): any {
	// Destructure the OpenAI-like data object
	const { messages, temperature, max_tokens } = data;

	// 1. Extract and combine all system messages into a single prompt
	const systemPrompt = messages
		.filter((msg: LLMMessage) => msg.role === 'system')
		.map((msg: LLMMessage) => msg.content)
		.join('\n');

	// 2. Filter out the original system messages to get the conversation history
	const conversationMessages = messages.filter(
		(msg: LLMMessage) => msg.role !== 'system'
	);

	// 3. Prepend the system prompt to the first message in the conversation
	if (systemPrompt && conversationMessages.length > 0) {
		conversationMessages[0].content = `${systemPrompt}\n\n${conversationMessages[0].content}`;
	}

	// 4. Map the cleaned conversation to Gemini's expected format
	const contents = conversationMessages.map((msg: LLMMessage) => ({
		role: msg.role === 'assistant' ? 'model' : 'user',
		parts: [{ text: msg.content }],
	}));

	return {
		contents,
		generationConfig: {
			temperature: temperature ?? 0.7,
			maxOutputTokens: max_tokens ?? 1000,
		},
	};
}

	private transformFromGemini(response: any): any {
		// Transform Gemini response to OpenAI format
		const candidate = response.candidates?.[0];
		if (!candidate) {
			throw new LLMAPIError('INVALID_RESPONSE', 'No candidates in Gemini response');
		}

		return {
			id: 'gemini-' + Date.now(),
			object: 'chat.completion',
			created: Math.floor(Date.now() / 1000),
			model: this.defaultModel,
			choices: [{
				index: 0,
				message: {
					role: 'assistant',
					content: candidate.content?.parts?.[0]?.text || ''
				},
				finish_reason: candidate.finishReason || 'stop'
			}],
			usage: {
				prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
				completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
				total_tokens: response.usageMetadata?.totalTokenCount || 0
			}
		};
	}

	private transformForAnthropic(data: any): any {
		// Transform OpenAI format to Anthropic format
		const { messages, model, temperature, max_tokens } = data;
		
		// Separate system message from user/assistant messages
		const systemMessage = messages.find((msg: LLMMessage) => msg.role === 'system');
		const conversationMessages = messages.filter((msg: LLMMessage) => msg.role !== 'system');

		return {
			model: model || this.defaultModel,
			max_tokens: max_tokens || 1000,
			temperature: temperature || 0.7,
			system: systemMessage?.content || '',
			messages: conversationMessages.map((msg: LLMMessage) => ({
				role: msg.role,
				content: msg.content
			}))
		};
	}

	private transformFromAnthropic(response: any): any {
		// Transform Anthropic response to OpenAI format
		return {
			id: 'anthropic-' + Date.now(),
			object: 'chat.completion',
			created: Math.floor(Date.now() / 1000),
			model: this.defaultModel,
			choices: [{
				index: 0,
				message: {
					role: 'assistant',
					content: response.content?.[0]?.text || ''
				},
				finish_reason: response.stop_reason || 'stop'
			}],
			usage: {
				prompt_tokens: response.usage?.input_tokens || 0,
				completion_tokens: response.usage?.output_tokens || 0,
				total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
			}
		};
	}
}

// Singleton instances
export const openaiClient = new LLMClient('openai');
export const anthropicClient = new LLMClient('anthropic');
export const geminiClient = new LLMClient('gemini');

// Default client (Gemini)
export const llmClient = geminiClient;
