import { llmClient, openaiClient, anthropicClient, geminiClient, LLMAPIError } from '$lib/api/llm';
import type { LLMRequest, LLMResponse, APIResponse } from '$lib/types/api';

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
  jitterFactor: number;
}

/**
 * Enhanced LLM client with retry logic and rate limiting
 */
export class EnhancedLLMClient {
  private requestQueue: Array<{
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timestamp: number;
  }> = [];
  
  private requestHistory: number[] = [];
  private processing = false;
  
  private rateLimitConfig: RateLimitConfig = {
    requestsPerMinute: 20,
    requestsPerHour: 100,
    burstLimit: 5
  };
  
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    exponentialBase: 2,
    jitterFactor: 0.1
  };

  constructor(
    rateLimitConfig?: Partial<RateLimitConfig>,
    retryConfig?: Partial<RetryConfig>
  ) {
    if (rateLimitConfig) {
      this.rateLimitConfig = { ...this.rateLimitConfig, ...rateLimitConfig };
    }
    if (retryConfig) {
      this.retryConfig = { ...this.retryConfig, ...retryConfig };
    }
  }

  /**
   * Generate completion with retry logic and rate limiting
   */
  async generateCompletion(
    request: LLMRequest,
    provider: 'openai' | 'anthropic' | 'gemini' = 'gemini'
  ): Promise<APIResponse<LLMResponse>> {
    return new Promise((resolve, reject) => {
      const requestWrapper = async () => {
        return this.executeWithRetry(async () => {
          const client = this.getClient(provider);
          return await client.generateCompletion(request);
        });
      };

      this.requestQueue.push({
        request: requestWrapper,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this.processQueue();
    });
  }

  /**
   * Generate persona insights with automatic fallback between providers
   */
  async generatePersonaInsights(
    targetDescription: string,
    culturalContext?: string,
    businessContext?: string,
    preferredProvider: 'openai' | 'anthropic' | 'gemini' = 'gemini'
  ): Promise<APIResponse<string>> {
    const providers: Array<'openai' | 'anthropic' | 'gemini'> = [preferredProvider];
    
    // Add fallback providers
    if (preferredProvider !== 'gemini') providers.push('gemini');
    if (preferredProvider !== 'openai') providers.push('openai');
    if (preferredProvider !== 'anthropic') providers.push('anthropic');

    let lastError: any;

    for (const provider of providers) {
      try {
        const client = this.getClient(provider);
        const result = await client.generatePersonaInsights(
          targetDescription,
          culturalContext,
          businessContext
        );
        
        if (result.success) {
          return result;
        }
        lastError = result.error;
      } catch (error) {
        lastError = error;
        console.warn(`Provider ${provider} failed, trying next:`, error);
      }
    }

    return {
      success: false,
      error: `All providers failed. Last error: ${lastError}`
    };
  }

  /**
   * Test connection to all providers
   */
  async testConnections(): Promise<{
    openai: boolean;
    anthropic: boolean;
    gemini: boolean;
    overall: boolean;
  }> {
    const results = {
      openai: false,
      anthropic: false,
      gemini: false,
      overall: false
    };

    // Test each provider with timeout
    const testPromises = [
      this.testProvider('openai').then(success => { results.openai = success; }),
      this.testProvider('anthropic').then(success => { results.anthropic = success; }),
      this.testProvider('gemini').then(success => { results.gemini = success; })
    ];

    try {
      await Promise.allSettled(testPromises);
      results.overall = results.openai || results.anthropic || results.gemini;
    } catch (error) {
      console.error('Connection test failed:', error);
    }

    return results;
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus(): {
    requestsInLastMinute: number;
    requestsInLastHour: number;
    canMakeRequest: boolean;
    nextAvailableTime?: number;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    // Clean old entries
    this.requestHistory = this.requestHistory.filter(time => time > oneHourAgo);

    const requestsInLastMinute = this.requestHistory.filter(time => time > oneMinuteAgo).length;
    const requestsInLastHour = this.requestHistory.length;

    const canMakeRequest = 
      requestsInLastMinute < this.rateLimitConfig.requestsPerMinute &&
      requestsInLastHour < this.rateLimitConfig.requestsPerHour;

    let nextAvailableTime: number | undefined;
    if (!canMakeRequest) {
      if (requestsInLastMinute >= this.rateLimitConfig.requestsPerMinute) {
        // Find oldest request in last minute
        const oldestInMinute = Math.min(...this.requestHistory.filter(time => time > oneMinuteAgo));
        nextAvailableTime = oldestInMinute + 60000;
      } else {
        // Find oldest request in last hour
        const oldestInHour = Math.min(...this.requestHistory);
        nextAvailableTime = oldestInHour + 3600000;
      }
    }

    return {
      requestsInLastMinute,
      requestsInLastHour,
      canMakeRequest,
      nextAvailableTime
    };
  }

  private getClient(provider: 'openai' | 'anthropic' | 'gemini') {
    switch (provider) {
      case 'openai':
        return openaiClient;
      case 'anthropic':
        return anthropicClient;
      case 'gemini':
        return geminiClient;
      default:
        return llmClient; // Default to Gemini
    }
  }

  private async testProvider(provider: 'openai' | 'anthropic' | 'gemini'): Promise<boolean> {
    try {
      const client = this.getClient(provider);
      const result = await Promise.race([
        client.testConnection(),
        new Promise<APIResponse<boolean>>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);
      return result.success;
    } catch (error) {
      return false;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.requestQueue.length > 0) {
      const rateLimitStatus = this.getRateLimitStatus();
      
      if (!rateLimitStatus.canMakeRequest) {
        // Wait until we can make another request
        const waitTime = rateLimitStatus.nextAvailableTime! - Date.now();
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        continue;
      }

      const queueItem = this.requestQueue.shift();
      if (!queueItem) break;

      try {
        this.requestHistory.push(Date.now());
        const result = await queueItem.request();
        queueItem.resolve(result);
      } catch (error) {
        queueItem.reject(error);
      }

      // Small delay between requests to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain types of errors
        if (error instanceof LLMAPIError) {
          if (error.code === 'INVALID_API_KEY' || error.code === 'INSUFFICIENT_QUOTA') {
            throw error;
          }
        }
        
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const baseDelay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.exponentialBase, attempt),
          this.retryConfig.maxDelay
        );
        
        const jitter = baseDelay * this.retryConfig.jitterFactor * Math.random();
        const delay = baseDelay + jitter;

        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

// Export enhanced client instances
export const enhancedLLMClient = new EnhancedLLMClient();

// Conservative rate limits for production
export const productionLLMClient = new EnhancedLLMClient(
  {
    requestsPerMinute: 10,
    requestsPerHour: 50,
    burstLimit: 3
  },
  {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 60000,
    exponentialBase: 2.5,
    jitterFactor: 0.2
  }
);