
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assessmentsTable } from '../db/schema';
import { type CreateAssessmentInput } from '../schema';
import { createAssessment } from '../handlers/create_assessment';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateAssessmentInput = {
  gcc_name: 'Test GCC Company',
  contact_email: 'test@example.com',
  annual_productivity_upliftment: 15.5,
  attrition_rate: 8.25,
  genai_use_cases_developed: 12
};

describe('createAssessment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an assessment with all required fields', async () => {
    const result = await createAssessment(testInput);

    // Validate basic fields
    expect(result.gcc_name).toEqual('Test GCC Company');
    expect(result.contact_email).toEqual('test@example.com');
    expect(result.annual_productivity_upliftment).toEqual(15.5);
    expect(typeof result.annual_productivity_upliftment).toBe('number');
    expect(result.attrition_rate).toEqual(8.25);
    expect(typeof result.attrition_rate).toBe('number');
    expect(result.genai_use_cases_developed).toEqual(12);
    
    // Validate auto-generated fields
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    
    // Validate nullable score fields are null initially
    expect(result.overall_maturity_score).toBeNull();
    expect(result.strategy_score).toBeNull();
    expect(result.talent_score).toBeNull();
    expect(result.operating_model_score).toBeNull();
    expect(result.technology_score).toBeNull();
    expect(result.data_score).toBeNull();
    expect(result.adoption_scaling_score).toBeNull();
    expect(result.ai_trust_score).toBeNull();
    expect(result.archetype).toBeNull();
  });

  it('should save assessment to database correctly', async () => {
    const result = await createAssessment(testInput);

    // Query database to verify data was saved
    const assessments = await db.select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.id, result.id))
      .execute();

    expect(assessments).toHaveLength(1);
    const savedAssessment = assessments[0];
    
    expect(savedAssessment.gcc_name).toEqual('Test GCC Company');
    expect(savedAssessment.contact_email).toEqual('test@example.com');
    expect(parseFloat(savedAssessment.annual_productivity_upliftment)).toEqual(15.5);
    expect(parseFloat(savedAssessment.attrition_rate)).toEqual(8.25);
    expect(savedAssessment.genai_use_cases_developed).toEqual(12);
    expect(savedAssessment.created_at).toBeInstanceOf(Date);
    expect(savedAssessment.updated_at).toBeInstanceOf(Date);
  });

  it('should handle zero values correctly', async () => {
    const zeroInput: CreateAssessmentInput = {
      gcc_name: 'Zero Test GCC',
      contact_email: 'zero@example.com',
      annual_productivity_upliftment: 0,
      attrition_rate: 0,
      genai_use_cases_developed: 0
    };

    const result = await createAssessment(zeroInput);

    expect(result.annual_productivity_upliftment).toEqual(0);
    expect(result.attrition_rate).toEqual(0);
    expect(result.genai_use_cases_developed).toEqual(0);
    expect(typeof result.annual_productivity_upliftment).toBe('number');
    expect(typeof result.attrition_rate).toBe('number');
  });

  it('should handle large numeric values correctly', async () => {
    const largeInput: CreateAssessmentInput = {
      gcc_name: 'Large Values GCC',
      contact_email: 'large@example.com',
      annual_productivity_upliftment: 99999.99,
      attrition_rate: 100.00,
      genai_use_cases_developed: 1000
    };

    const result = await createAssessment(largeInput);

    expect(result.annual_productivity_upliftment).toEqual(99999.99);
    expect(result.attrition_rate).toEqual(100.00);
    expect(result.genai_use_cases_developed).toEqual(1000);
  });
});
