import { llmClient, LLMAPIError } from '$lib/api/llm';
import { QlooService } from '$lib/api/qloo';
import type { PersonaGenerationData } from '$lib/schemas/persona-form';
import type { LLMMessage, APIResponse } from '$lib/types/api';
import {
  createPersonaGenerationMessages,
  createPersonaEnhancementMessages,
  createPersonaValidationMessages
} from '$lib/api/persona-prompts';

export interface GeneratedPersona {
  id: string;
  name: string;
  tagline: string;
  demographics: {
    age: number;
    gender: string;
    location: string;
    occupation: string;
    income: string;
    education: string;
    family_status: string;
    living_situation: string;
  };
  psychographics: {
    values: string[];
    motivations: string[];
    personality_traits: string[];
    lifestyle: string;
    stress_triggers: string[];
    relaxation_methods: string[];
  };
  behavioral_patterns: {
    daily_routine: string;
    decision_making_style: string;
    research_habits: string;
    shopping_behavior: string;
    brand_loyalty: string;
  };
  digital_behavior: {
    primary_devices: string[];
    social_media_platforms: string[];
    content_preferences: string[];
    technology_comfort: string;
    online_activity_times: string[];
  };
  goals_and_pain_points: {
    primary_goals: string[];
    aspirations: string[];
    current_challenges: string[];
    frustrations: string[];
    success_metrics: string[];
  };
  product_relationship: {
    discovery_channels: string[];
    decision_factors: string[];
    potential_objections: string[];
    ideal_experience: string;
    post_purchase_behavior: string;
  };
  marketing_strategy: {
    best_channels: string[];
    messaging_style: string;
    content_types: string[];
    communication_frequency: string;
    timing_preferences: string[];
  };
  quotes: {
    pain_point: string;
    aspiration: string;
    product_need: string;
  };
  // Additional metadata
  confidence_score: number;
  qloo_insights?: any;
  generation_timestamp: string;
}

export interface PersonaGenerationOptions {
  includeQlooInsights?: boolean;
  enhanceWithCulturalData?: boolean;
  validateResults?: boolean;
  retryAttempts?: number;
  model?: string;
  temperature?: number;
}

export interface PersonaGenerationResult {
  success: boolean;
  persona?: GeneratedPersona;
  error?: string;
  metadata?: {
    generation_time_ms: number;
    qloo_insights_included: boolean;
    validation_score?: number;
    retry_attempts: number;
  };
}

export class PersonaGenerationService {
  private qlooService: QlooService;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor() {
    this.qlooService = new QlooService();
  }

  /**
   * Generate a comprehensive persona from form data
   */
  async generatePersona(
    formData: PersonaGenerationData,
    options: PersonaGenerationOptions = {}
  ): Promise<PersonaGenerationResult> {
    const startTime = Date.now();
    let retryAttempts = 0;
    const maxRetries = options.retryAttempts || this.maxRetries;

    try {
      // Step 1: Generate base persona with LLM
      const basePersona = await this.generateBasePersona(formData, options, maxRetries);
      if (!basePersona.success || !basePersona.data) {
        return {
          success: false,
          error: 'Failed to generate base persona',
          metadata: {
            generation_time_ms: Date.now() - startTime,
            qloo_insights_included: false,
            retry_attempts: retryAttempts
          }
        };
      }

      let persona = basePersona.data;

      // Step 2: Enhance with Qloo insights if requested
      let qlooInsights = null;
      if (options.includeQlooInsights) {
        try {
          qlooInsights = await this.gatherQlooInsights(formData);
          if (qlooInsights) {
            const enhancedPersona = await this.enhancePersonaWithQloo(
              persona,
              qlooInsights,
              formData.target_audience.cultural_context
            );
            if (enhancedPersona.success && enhancedPersona.data) {
              persona = enhancedPersona.data;
            }
          }
        } catch (error) {
          console.warn('Qloo enhancement failed, proceeding with base persona:', error);
        }
      }

      // Step 3: Validate results if requested
      let validationScore = undefined;
      if (options.validateResults) {
        try {
          const validation = await this.validatePersona(persona, formData);
          if (validation.success && validation.data) {
            validationScore = validation.data.overall_score;
            // Use enhanced persona if validation provided improvements
            if (validation.data.enhanced_persona) {
              persona = validation.data.enhanced_persona;
            }
          }
        } catch (error) {
          console.warn('Persona validation failed:', error);
        }
      }

      // Step 4: Finalize persona with metadata
      const finalPersona: GeneratedPersona = {
        ...persona,
        id: this.generatePersonaId(),
        confidence_score: this.calculateConfidenceScore(persona, qlooInsights, validationScore),
        qloo_insights: qlooInsights,
        generation_timestamp: new Date().toISOString()
      };

      return {
        success: true,
        persona: finalPersona,
        metadata: {
          generation_time_ms: Date.now() - startTime,
          qloo_insights_included: !!qlooInsights,
          validation_score: validationScore,
          retry_attempts: retryAttempts
        }
      };

    } catch (error) {
      console.error('Persona generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          generation_time_ms: Date.now() - startTime,
          qloo_insights_included: false,
          retry_attempts: retryAttempts
        }
      };
    }
  }

  /**
   * Generate base persona using LLM
   */
  private async generateBasePersona(
    formData: PersonaGenerationData,
    options: PersonaGenerationOptions,
    maxRetries: number
  ): Promise<APIResponse<any>> {
    const messages = createPersonaGenerationMessages(formData);
    
    return this.retryOperation(async () => {
      const response = await llmClient.generateCompletion({
        messages,
        model: options.model,
        temperature: options.temperature || 0.7,
        max_tokens: 3000
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate persona');
      }

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in LLM response');
      }

      // Parse JSON response
      try {
        const personaData = JSON.parse(content);
        return {
          success: true,
          data: personaData.persona
        };
      } catch (parseError) {
        // Try to extract JSON from response if it's wrapped in markdown or other text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const personaData = JSON.parse(jsonMatch[0]);
            return {
              success: true,
              data: personaData.persona || personaData
            };
          } catch (e) {
            throw new Error('Failed to parse persona JSON from LLM response');
          }
        }
        throw new Error('Invalid JSON in LLM response');
      }
    }, maxRetries);
  }

  /**
   * Gather insights from Qloo API
   */
  private async gatherQlooInsights(formData: PersonaGenerationData): Promise<any> {
    try {
      const insights = await this.qlooService.generatePersonaInsights({
        targetDescription: formData.target_audience.target_description,
        demographics: {
          age_range: formData.target_audience.age_range,
          gender: formData.target_audience.gender,
          location: formData.target_audience.location,
          income_level: formData.target_audience.income_level,
          education: formData.target_audience.education
        },
        culturalContext: formData.target_audience.cultural_context,
        businessInfo: {
          industry: formData.business_info.industry,
          businessType: formData.business_info.business_type,
          productType: formData.product_details.product_type
        }
      });

      return insights;
    } catch (error) {
      console.warn('Failed to gather Qloo insights:', error);
      return null;
    }
  }

  /**
   * Enhance persona with Qloo data
   */
  private async enhancePersonaWithQloo(
    persona: any,
    qlooData: any,
    culturalContext?: string
  ): Promise<APIResponse<any>> {
    const messages = createPersonaEnhancementMessages(persona, qlooData, culturalContext);
    
    return this.retryOperation(async () => {
      const response = await llmClient.generateCompletion({
        messages,
        temperature: 0.6,
        max_tokens: 3000
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to enhance persona');
      }

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in enhancement response');
      }

      try {
        const enhancedData = JSON.parse(content);
        return {
          success: true,
          data: enhancedData.persona || enhancedData
        };
      } catch (parseError) {
        // Fallback to original persona if enhancement fails
        return {
          success: true,
          data: persona
        };
      }
    }, 2); // Fewer retries for enhancement
  }

  /**
   * Validate generated persona
   */
  private async validatePersona(
    persona: any,
    requirements: PersonaGenerationData
  ): Promise<APIResponse<any>> {
    const messages = createPersonaValidationMessages(persona, requirements);
    
    return this.retryOperation(async () => {
      const response = await llmClient.generateCompletion({
        messages,
        temperature: 0.3, // Lower temperature for validation
        max_tokens: 2000
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to validate persona');
      }

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in validation response');
      }

      try {
        const validationData = JSON.parse(content);
        return {
          success: true,
          data: {
            overall_score: validationData.validation?.overall_score || 7,
            enhanced_persona: validationData.enhanced_persona
          }
        };
      } catch (parseError) {
        // Return default validation if parsing fails
        return {
          success: true,
          data: { overall_score: 7 }
        };
      }
    }, 2);
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    delay: number = this.baseDelay
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const backoffDelay = delay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError!;
  }

  /**
   * Generate unique persona ID
   */
  private generatePersonaId(): string {
    return `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate confidence score based on available data
   */
  private calculateConfidenceScore(
    persona: any,
    qlooInsights: any,
    validationScore?: number
  ): number {
    let score = 70; // Base score

    // Add points for completeness
    if (persona.demographics && Object.keys(persona.demographics).length >= 6) score += 10;
    if (persona.psychographics && persona.psychographics.values?.length >= 3) score += 5;
    if (persona.behavioral_patterns && persona.behavioral_patterns.daily_routine) score += 5;
    if (persona.marketing_strategy && persona.marketing_strategy.best_channels?.length >= 2) score += 5;

    // Add points for Qloo insights
    if (qlooInsights) score += 10;

    // Use validation score if available
    if (validationScore) {
      score = Math.round((score + validationScore * 10) / 2);
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Test the service connectivity
   */
  async testService(): Promise<{ llm: boolean; qloo: boolean }> {
    const results = { llm: false, qloo: false };

    try {
      const llmTest = await llmClient.testConnection();
      results.llm = llmTest.success;
    } catch (error) {
      console.error('LLM test failed:', error);
    }

    try {
      // Simple Qloo test
      await this.qlooService.searchEntities({ query: 'test', limit: 1 });
      results.qloo = true;
    } catch (error) {
      console.error('Qloo test failed:', error);
    }

    return results;
  }
}

// Export singleton instance
export const personaGenerationService = new PersonaGenerationService();
