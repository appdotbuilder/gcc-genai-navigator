
import { z } from 'zod';

// Enums for various assessment dimensions
export const maturityDimensionSchema = z.enum([
  'strategy',
  'talent',
  'operating_model',
  'technology',
  'data',
  'adoption_scaling',
  'ai_trust'
]);

export const gccArchetypeSchema = z.enum([
  'leaders',
  'progressors',
  'emergents',
  'laggards'
]);

export const recommendationCategorySchema = z.enum([
  'strategic_alignment',
  'talent_capability_building',
  'innovation_value_creation',
  'operating_model_technology',
  'risk_resilience',
  'impact_measurement_governance'
]);

export const businessFunctionSchema = z.enum([
  'finance',
  'hr',
  'operations',
  'technology',
  'marketing',
  'customer_service',
  'procurement',
  'risk_management'
]);

// Assessment schemas
export const assessmentQuestionSchema = z.object({
  id: z.number(),
  dimension: maturityDimensionSchema,
  question_text: z.string(),
  question_order: z.number().int(),
  created_at: z.coerce.date()
});

export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

export const assessmentResponseSchema = z.object({
  id: z.number(),
  assessment_id: z.number(),
  question_id: z.number(),
  response_value: z.number().int().min(1).max(5), // 1-5 scale
  created_at: z.coerce.date()
});

export type AssessmentResponse = z.infer<typeof assessmentResponseSchema>;

export const assessmentSchema = z.object({
  id: z.number(),
  gcc_name: z.string(),
  contact_email: z.string().email(),
  annual_productivity_upliftment: z.number().nonnegative(),
  attrition_rate: z.number().nonnegative(),
  genai_use_cases_developed: z.number().int().nonnegative(),
  overall_maturity_score: z.number().nullable(),
  strategy_score: z.number().nullable(),
  talent_score: z.number().nullable(),
  operating_model_score: z.number().nullable(),
  technology_score: z.number().nullable(),
  data_score: z.number().nullable(),
  adoption_scaling_score: z.number().nullable(),
  ai_trust_score: z.number().nullable(),
  archetype: gccArchetypeSchema.nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Assessment = z.infer<typeof assessmentSchema>;

// Business query schemas
export const businessQuerySchema = z.object({
  id: z.number(),
  assessment_id: z.number(),
  query_text: z.string(),
  target_function: businessFunctionSchema,
  created_at: z.coerce.date()
});

export type BusinessQuery = z.infer<typeof businessQuerySchema>;

// Recommendation schemas
export const recommendationSchema = z.object({
  id: z.number(),
  assessment_id: z.number(),
  category: recommendationCategorySchema,
  title: z.string(),
  description: z.string(),
  priority_level: z.number().int().min(1).max(5),
  is_critical_imperative: z.boolean(),
  expected_impact: z.string().nullable(),
  implementation_timeline: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Recommendation = z.infer<typeof recommendationSchema>;

// Resource hub schemas
export const resourceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  content_type: z.enum(['case_study', 'best_practice', 'insight', 'framework']),
  target_archetype: gccArchetypeSchema.nullable(),
  target_dimension: maturityDimensionSchema.nullable(),
  content_url: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Resource = z.infer<typeof resourceSchema>;

// Input schemas for creating assessments
export const createAssessmentInputSchema = z.object({
  gcc_name: z.string(),
  contact_email: z.string().email(),
  annual_productivity_upliftment: z.number().nonnegative(),
  attrition_rate: z.number().nonnegative(),
  genai_use_cases_developed: z.number().int().nonnegative()
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentInputSchema>;

// Input schemas for submitting assessment responses
export const submitAssessmentResponsesInputSchema = z.object({
  assessment_id: z.number(),
  responses: z.array(z.object({
    question_id: z.number(),
    response_value: z.number().int().min(1).max(5)
  }))
});

export type SubmitAssessmentResponsesInput = z.infer<typeof submitAssessmentResponsesInputSchema>;

// Input schemas for business queries
export const createBusinessQueryInputSchema = z.object({
  assessment_id: z.number(),
  query_text: z.string(),
  target_function: businessFunctionSchema
});

export type CreateBusinessQueryInput = z.infer<typeof createBusinessQueryInputSchema>;

// Assessment results schema
export const assessmentResultsSchema = z.object({
  assessment: assessmentSchema,
  responses: z.array(assessmentResponseSchema),
  recommendations: z.array(recommendationSchema),
  business_queries: z.array(businessQuerySchema)
});

export type AssessmentResults = z.infer<typeof assessmentResultsSchema>;
