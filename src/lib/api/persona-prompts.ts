import type { LLMMessage } from '$lib/types/api';
import type { PersonaGenerationData } from '$lib/schemas/persona-form';

/**
 * Prompt templates for persona generation using LLM
 */

export const PERSONA_SYSTEM_PROMPT = `You are an expert market researcher and behavioral psychologist specializing in creating detailed, actionable customer personas. 

Your task is to generate comprehensive personas that combine demographic data, behavioral insights, taste profiles, and cultural context to create vivid, realistic profiles that businesses can use for marketing, product development, and strategic decision-making.

Guidelines:
- Create personas that feel like real people with specific traits, preferences, and behaviors
- Include both conscious and subconscious motivations
- Provide actionable insights for marketing and product development
- Consider cultural nuances and regional preferences
- Base insights on psychological principles and market research best practices
- Use specific examples and scenarios rather than generic statements
- Include potential pain points, aspirations, and decision-making triggers
- Suggest communication styles and channels that resonate with each persona

Always structure your response as valid JSON with the specified schema.`;

export const PERSONA_GENERATION_PROMPT = `Based on the following business and target audience information, generate a detailed customer persona:

**Business Information:**
- Company: {{business_name}}
- Industry: {{industry}}
- Business Type: {{business_type}}
- Company Size: {{company_size}}
- Description: {{business_description}}
{{#if website}}- Website: {{website}}{{/if}}

**Product/Service Details:**
- Name: {{product_name}}
- Type: {{product_type}}
- Price Range: {{price_range}}
- Description: {{product_description}}
- Key Features: {{key_features}}
- Unique Value Proposition: {{unique_value_proposition}}
{{#if competitors}}- Main Competitors: {{competitors}}{{/if}}

**Target Audience:**
- Description: {{target_description}}
- Age Range: {{age_range}}
- Gender: {{gender}}
- Location: {{location}}
- Income Level: {{income_level}}
- Education: {{education}}
{{#if cultural_context}}- Cultural Context: {{cultural_context}}{{/if}}

**Research Goals:**
- Primary Goal: {{primary_goal}}
- Use Case: {{use_case}}
- Timeline: {{timeline}}
- Budget Range: {{budget_range}}
{{#if specific_questions}}- Specific Questions: {{specific_questions}}{{/if}}

Please generate a comprehensive persona that includes:

1. **Demographics & Basic Info**
   - Name, age, location, occupation, income
   - Family status, education level
   - Living situation and lifestyle

2. **Psychographics & Personality**
   - Values, beliefs, and motivations
   - Personality traits and characteristics
   - Lifestyle preferences and habits
   - Stress triggers and relaxation methods

3. **Behavioral Patterns**
   - Daily routines and weekly schedules
   - Decision-making process and criteria
   - Information gathering and research habits
   - Shopping behaviors and preferences

4. **Digital & Media Consumption**
   - Preferred communication channels
   - Social media usage patterns
   - Content consumption habits
   - Technology adoption and comfort level

5. **Goals & Pain Points**
   - Primary goals and aspirations
   - Current challenges and frustrations
   - Barriers to achieving goals
   - Success metrics and indicators

6. **Product/Service Relationship**
   - How they would discover your product/service
   - Key factors in their decision-making
   - Potential objections and concerns
   - Ideal customer experience and journey
   - Post-purchase behavior and loyalty factors

7. **Marketing & Engagement Strategy**
   - Best channels to reach them
   - Messaging that resonates
   - Content types they engage with
   - Timing and frequency preferences

Respond with a JSON object following this exact structure:

{
  "persona": {
    "name": "string",
    "tagline": "string (brief description)",
    "demographics": {
      "age": "number",
      "gender": "string",
      "location": "string",
      "occupation": "string",
      "income": "string",
      "education": "string",
      "family_status": "string",
      "living_situation": "string"
    },
    "psychographics": {
      "values": ["string"],
      "motivations": ["string"],
      "personality_traits": ["string"],
      "lifestyle": "string",
      "stress_triggers": ["string"],
      "relaxation_methods": ["string"]
    },
    "behavioral_patterns": {
      "daily_routine": "string",
      "decision_making_style": "string",
      "research_habits": "string",
      "shopping_behavior": "string",
      "brand_loyalty": "string"
    },
    "digital_behavior": {
      "primary_devices": ["string"],
      "social_media_platforms": ["string"],
      "content_preferences": ["string"],
      "technology_comfort": "string",
      "online_activity_times": ["string"]
    },
    "goals_and_pain_points": {
      "primary_goals": ["string"],
      "aspirations": ["string"],
      "current_challenges": ["string"],
      "frustrations": ["string"],
      "success_metrics": ["string"]
    },
    "product_relationship": {
      "discovery_channels": ["string"],
      "decision_factors": ["string"],
      "potential_objections": ["string"],
      "ideal_experience": "string",
      "post_purchase_behavior": "string"
    },
    "marketing_strategy": {
      "best_channels": ["string"],
      "messaging_style": "string",
      "content_types": ["string"],
      "communication_frequency": "string",
      "timing_preferences": ["string"]
    },
    "quotes": {
      "pain_point": "string (what they might say about their main frustration)",
      "aspiration": "string (what they might say about their goals)",
      "product_need": "string (what they might say about needing your product/service)"
    }
  }
}`;

export const PERSONA_ENHANCEMENT_PROMPT = `Based on the following Qloo taste profile data and existing persona information, enhance the persona with deeper cultural and behavioral insights:

**Existing Persona Data:**
{{persona_data}}

**Qloo Taste Profile Data:**
{{qloo_data}}

**Cultural Context:**
{{cultural_context}}

Please enhance the persona by:

1. **Refining taste preferences** based on Qloo data
2. **Adding cultural nuances** and regional specificities
3. **Deepening behavioral insights** with taste-driven motivations
4. **Expanding lifestyle details** with specific brands, activities, and preferences
5. **Enhancing marketing strategy** with taste-based targeting

Return the enhanced persona using the same JSON structure, but with richer, more specific details that incorporate the taste profile and cultural insights.`;

export const PERSONA_VALIDATION_PROMPT = `Review and validate this persona for accuracy, completeness, and actionability:

**Persona to Validate:**
{{persona_data}}

**Original Requirements:**
{{requirements}}

Please evaluate the persona on:

1. **Accuracy**: Are the details realistic and internally consistent?
2. **Completeness**: Does it cover all required aspects comprehensively?
3. **Actionability**: Are the insights specific enough for practical use?
4. **Authenticity**: Does it feel like a real person rather than generic?
5. **Relevance**: Does it align with the business context and goals?

If improvements are needed, provide an enhanced version. If it's good as-is, confirm validation.

Respond with:
{
  "validation": {
    "is_valid": "boolean",
    "accuracy_score": "number (1-10)",
    "completeness_score": "number (1-10)",
    "actionability_score": "number (1-10)",
    "overall_score": "number (1-10)",
    "feedback": "string",
    "suggested_improvements": ["string"]
  },
  "enhanced_persona": "object (if improvements were made, otherwise null)"
}`;

/**
 * Template engine for replacing placeholders in prompts
 */
export function interpolateTemplate(template: string, data: Record<string, any>): string {
  let result = template;
  
  // Handle {{#if variable}} blocks
  result = result.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, variable, content) => {
    const value = getNestedValue(data, variable);
    return value ? content : '';
  });
  
  // Handle {{variable}} replacements
  result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = getNestedValue(data, path);
    return value !== undefined && value !== null ? String(value) : '';
  });
  
  return result;
}

/**
 * Get nested object value by path (e.g., "user.profile.name")
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Create LLM messages for persona generation
 */
export function createPersonaGenerationMessages(formData: PersonaGenerationData): LLMMessage[] {
  const prompt = interpolateTemplate(PERSONA_GENERATION_PROMPT, {
    // Business info
    business_name: formData.business_info.business_name,
    industry: formData.business_info.industry,
    business_type: formData.business_info.business_type,
    company_size: formData.business_info.company_size,
    business_description: formData.business_info.business_description,
    website: formData.business_info.website,
    
    // Product details
    product_name: formData.product_details.product_name,
    product_type: formData.product_details.product_type,
    price_range: formData.product_details.price_range,
    product_description: formData.product_details.product_description,
    key_features: formData.product_details.key_features,
    unique_value_proposition: formData.product_details.unique_value_proposition,
    competitors: formData.product_details.competitors,
    
    // Target audience
    target_description: formData.target_audience.target_description,
    age_range: formData.target_audience.age_range,
    gender: formData.target_audience.gender,
    location: formData.target_audience.location,
    income_level: formData.target_audience.income_level,
    education: formData.target_audience.education,
    cultural_context: formData.target_audience.cultural_context,
    
    // Research goals
    primary_goal: formData.research_goals.primary_goal,
    use_case: formData.research_goals.use_case,
    timeline: formData.research_goals.timeline,
    budget_range: formData.research_goals.budget_range,
    specific_questions: formData.research_goals.specific_questions
  });

  return [
    {
      role: 'system',
      content: PERSONA_SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: prompt
    }
  ];
}

/**
 * Create enhancement messages for integrating Qloo data
 */
export function createPersonaEnhancementMessages(
  existingPersona: any,
  qlooData: any,
  culturalContext?: string
): LLMMessage[] {
  const prompt = interpolateTemplate(PERSONA_ENHANCEMENT_PROMPT, {
    persona_data: JSON.stringify(existingPersona, null, 2),
    qloo_data: JSON.stringify(qlooData, null, 2),
    cultural_context: culturalContext || 'General global context'
  });

  return [
    {
      role: 'system',
      content: PERSONA_SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: prompt
    }
  ];
}

/**
 * Create validation messages for persona review
 */
export function createPersonaValidationMessages(
  persona: any,
  requirements: any
): LLMMessage[] {
  const prompt = interpolateTemplate(PERSONA_VALIDATION_PROMPT, {
    persona_data: JSON.stringify(persona, null, 2),
    requirements: JSON.stringify(requirements, null, 2)
  });

  return [
    {
      role: 'system',
      content: PERSONA_SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: prompt
    }
  ];
}
