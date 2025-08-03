
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const maturityDimensionEnum = pgEnum('maturity_dimension', [
  'strategy',
  'talent',
  'operating_model',
  'technology',
  'data',
  'adoption_scaling',
  'ai_trust'
]);

export const gccArchetypeEnum = pgEnum('gcc_archetype', [
  'leaders',
  'progressors',
  'emergents',
  'laggards'
]);

export const recommendationCategoryEnum = pgEnum('recommendation_category', [
  'strategic_alignment',
  'talent_capability_building',
  'innovation_value_creation',
  'operating_model_technology',
  'risk_resilience',
  'impact_measurement_governance'
]);

export const businessFunctionEnum = pgEnum('business_function', [
  'finance',
  'hr',
  'operations',
  'technology',
  'marketing',
  'customer_service',
  'procurement',
  'risk_management'
]);

export const contentTypeEnum = pgEnum('content_type', [
  'case_study',
  'best_practice',
  'insight',
  'framework'
]);

// Tables
export const assessmentQuestionsTable = pgTable('assessment_questions', {
  id: serial('id').primaryKey(),
  dimension: maturityDimensionEnum('dimension').notNull(),
  question_text: text('question_text').notNull(),
  question_order: integer('question_order').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const assessmentsTable = pgTable('assessments', {
  id: serial('id').primaryKey(),
  gcc_name: text('gcc_name').notNull(),
  contact_email: text('contact_email').notNull(),
  annual_productivity_upliftment: numeric('annual_productivity_upliftment', { precision: 10, scale: 2 }).notNull(),
  attrition_rate: numeric('attrition_rate', { precision: 5, scale: 2 }).notNull(),
  genai_use_cases_developed: integer('genai_use_cases_developed').notNull(),
  overall_maturity_score: numeric('overall_maturity_score', { precision: 5, scale: 2 }),
  strategy_score: numeric('strategy_score', { precision: 5, scale: 2 }),
  talent_score: numeric('talent_score', { precision: 5, scale: 2 }),
  operating_model_score: numeric('operating_model_score', { precision: 5, scale: 2 }),
  technology_score: numeric('technology_score', { precision: 5, scale: 2 }),
  data_score: numeric('data_score', { precision: 5, scale: 2 }),
  adoption_scaling_score: numeric('adoption_scaling_score', { precision: 5, scale: 2 }),
  ai_trust_score: numeric('ai_trust_score', { precision: 5, scale: 2 }),
  archetype: gccArchetypeEnum('archetype'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const assessmentResponsesTable = pgTable('assessment_responses', {
  id: serial('id').primaryKey(),
  assessment_id: integer('assessment_id').references(() => assessmentsTable.id).notNull(),
  question_id: integer('question_id').references(() => assessmentQuestionsTable.id).notNull(),
  response_value: integer('response_value').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const businessQueriesTable = pgTable('business_queries', {
  id: serial('id').primaryKey(),
  assessment_id: integer('assessment_id').references(() => assessmentsTable.id).notNull(),
  query_text: text('query_text').notNull(),
  target_function: businessFunctionEnum('target_function').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const recommendationsTable = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  assessment_id: integer('assessment_id').references(() => assessmentsTable.id).notNull(),
  category: recommendationCategoryEnum('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority_level: integer('priority_level').notNull(),
  is_critical_imperative: boolean('is_critical_imperative').notNull(),
  expected_impact: text('expected_impact'),
  implementation_timeline: text('implementation_timeline'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const resourcesTable = pgTable('resources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  content_type: contentTypeEnum('content_type').notNull(),
  target_archetype: gccArchetypeEnum('target_archetype'),
  target_dimension: maturityDimensionEnum('target_dimension'),
  content_url: text('content_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const assessmentsRelations = relations(assessmentsTable, ({ many }) => ({
  responses: many(assessmentResponsesTable),
  businessQueries: many(businessQueriesTable),
  recommendations: many(recommendationsTable),
}));

export const assessmentResponsesRelations = relations(assessmentResponsesTable, ({ one }) => ({
  assessment: one(assessmentsTable, {
    fields: [assessmentResponsesTable.assessment_id],
    references: [assessmentsTable.id],
  }),
  question: one(assessmentQuestionsTable, {
    fields: [assessmentResponsesTable.question_id],
    references: [assessmentQuestionsTable.id],
  }),
}));

export const businessQueriesRelations = relations(businessQueriesTable, ({ one }) => ({
  assessment: one(assessmentsTable, {
    fields: [businessQueriesTable.assessment_id],
    references: [assessmentsTable.id],
  }),
}));

export const recommendationsRelations = relations(recommendationsTable, ({ one }) => ({
  assessment: one(assessmentsTable, {
    fields: [recommendationsTable.assessment_id],
    references: [assessmentsTable.id],
  }),
}));

// Export all tables for relation queries
export const tables = {
  assessmentQuestions: assessmentQuestionsTable,
  assessments: assessmentsTable,
  assessmentResponses: assessmentResponsesTable,
  businessQueries: businessQueriesTable,
  recommendations: recommendationsTable,
  resources: resourcesTable,
};
