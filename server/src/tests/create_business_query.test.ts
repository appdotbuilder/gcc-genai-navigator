
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { businessQueriesTable, assessmentsTable } from '../db/schema';
import { type CreateBusinessQueryInput } from '../schema';
import { createBusinessQuery } from '../handlers/create_business_query';
import { eq } from 'drizzle-orm';

describe('createBusinessQuery', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testAssessmentId: number;

  beforeEach(async () => {
    // Create prerequisite assessment data
    const assessmentResult = await db.insert(assessmentsTable)
      .values({
        gcc_name: 'Test GCC',
        contact_email: 'test@example.com',
        annual_productivity_upliftment: '10.5',
        attrition_rate: '5.2',
        genai_use_cases_developed: 3
      })
      .returning()
      .execute();
    
    testAssessmentId = assessmentResult[0].id;
  });

  const testInput: CreateBusinessQueryInput = {
    assessment_id: 0, // Will be set in test
    query_text: 'How can we optimize our finance processes using GenAI?',
    target_function: 'finance'
  };

  it('should create a business query', async () => {
    const input = { ...testInput, assessment_id: testAssessmentId };
    const result = await createBusinessQuery(input);

    // Basic field validation
    expect(result.assessment_id).toEqual(testAssessmentId);
    expect(result.query_text).toEqual('How can we optimize our finance processes using GenAI?');
    expect(result.target_function).toEqual('finance');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save business query to database', async () => {
    const input = { ...testInput, assessment_id: testAssessmentId };
    const result = await createBusinessQuery(input);

    // Query using proper drizzle syntax
    const queries = await db.select()
      .from(businessQueriesTable)
      .where(eq(businessQueriesTable.id, result.id))
      .execute();

    expect(queries).toHaveLength(1);
    expect(queries[0].assessment_id).toEqual(testAssessmentId);
    expect(queries[0].query_text).toEqual('How can we optimize our finance processes using GenAI?');
    expect(queries[0].target_function).toEqual('finance');
    expect(queries[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different business functions', async () => {
    const hrInput: CreateBusinessQueryInput = {
      assessment_id: testAssessmentId,
      query_text: 'How can we improve talent acquisition with AI?',
      target_function: 'hr'
    };

    const result = await createBusinessQuery(hrInput);

    expect(result.target_function).toEqual('hr');
    expect(result.query_text).toEqual('How can we improve talent acquisition with AI?');
  });

  it('should fail with invalid assessment_id', async () => {
    const invalidInput = { ...testInput, assessment_id: 99999 };
    
    await expect(createBusinessQuery(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
