#!/bin/bash

# PersonaLens LLM Integration Test Script
# This script tests the LLM integration for persona generation

echo "=== PersonaLens LLM Integration Test ==="
echo "Testing persona generation service..."

# Check if required environment variables are set
echo "Environment Configuration:"
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:+✓ Set} ${OPENAI_API_KEY:-✗ Missing}"
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:+✓ Set} ${ANTHROPIC_API_KEY:-✗ Missing}"
echo "GEMINI_API_KEY: ${GEMINI_API_KEY:+✓ Set} ${GEMINI_API_KEY:-✗ Missing}"
echo "QLOO_API_KEY: ${QLOO_API_KEY:+✓ Set} ${QLOO_API_KEY:-✗ Missing}"
echo ""

# Test the health endpoint
echo "Testing service health..."
curl -X GET http://localhost:5173/api/test \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" || echo "Server not running or endpoint unavailable"

echo ""
echo "Testing persona generation..."

# Test persona generation with sample data
curl -X POST http://localhost:5173/api/test \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -d '{
    "business_info": {
      "business_name": "EcoTech Solutions",
      "industry": "Technology",
      "business_type": "B2C",
      "company_size": "51-200 employees",
      "business_description": "Sustainable technology products"
    },
    "target_audience": {
      "target_description": "Environmentally conscious millennials",
      "age_range": "25-35",
      "gender": "All",
      "location": "Urban areas",
      "income_level": "$50,000-$100,000",
      "education": "Bachelor'\''s degree"
    },
    "product_details": {
      "product_name": "SmartHome Energy Manager",
      "product_type": "Smart Home Device",
      "product_description": "AI-powered energy management system",
      "price_range": "$200-$400",
      "key_features": ["Real-time monitoring", "AI optimization"],
      "unique_value_proposition": "Reduce energy costs by 30%"
    },
    "research_goals": {
      "primary_goal": "Understand customer motivations",
      "use_case": "Product development",
      "specific_questions": "What drives purchase decisions?"
    }
  }' || echo "Test failed or server not running"

echo ""
echo "=== Test Complete ==="
echo "If you see successful responses above, the LLM integration is working!"
echo "If you see errors, check:"
echo "1. Environment variables are set"
echo "2. Development server is running (pnpm run dev)"
echo "3. API keys are valid"
