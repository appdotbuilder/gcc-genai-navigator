
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assessmentsTable, assessmentQuestionsTable, assessmentResponsesTable } from '../db/schema';
import { type SubmitAssessmentResponsesInput } from '../schema';
import { submitAssessmentResponses } from '../handlers/submit_assessment_responses';
import { eq } from 'drizzle-orm';

describe('submitAssessmentResponses', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testAssessmentId: number;
  let testQuestionIds: number[];

  beforeEach(async () => {
    // Create test assessment
    const assessment = await db.insert(assessmentsTable)
      .values({
        gcc_name: 'Test GCC',
        contact_email: 'test@example.com',
        annual_productivity_upliftment: '15.5',
        attrition_rate: '5.2',
        genai_use_cases_developed: 10
      })
      .returning()
      .execute();

    testAssessmentId = assessment[0].id;

    // Create test questions for different dimensions
    const questions = await db.insert(assessmentQuestionsTable)
      .values([
        {
          dimension: 'strategy',
          question_text: 'Strategy question 1',
          question_order: 1
        },
        {
          dimension: 'strategy',
          question_text: 'Strategy question 2',
          question_order: 2
        },
        {
          dimension: 'talent',
          question_text: 'Talent question 1',
          question_order: 3
        },
        {
          dimension: 'technology',
          question_text: 'Technology question 1',
          question_order: 4
        }
      ])
      .returning()
      .execute();

    testQuestionIds = questions.map(q => q.id);
  });

  const testInput: SubmitAssessmentResponsesInput = {
    assessment_id: 0, // Will be set in beforeEach
    responses: [
      { question_id: 0, response_value: 4 }, // Will be set in beforeEach
      { question_id: 0, response_value: 5 }, // Will be set in beforeEach
      { question_id: 0, response_value: 3 }, // Will be set in beforeEach
      { question_id: 0, response_value: 2 }  // Will be set in beforeEach
    ]
  };

  it('should submit assessment responses and calculate scores', async () => {
    const input = {
      ...testInput,
      assessment_id: testAssessmentId,
      responses: [
        { question_id: testQuestionIds[0], response_value: 4 },
        { question_id: testQuestionIds[1], response_value: 5 },
        { question_id: testQuestionIds[2], response_value: 3 },
        { question_id: testQuestionIds[3], response_value: 2 }
      ]
    };

    const result = await submitAssessmentResponses(input);

    // Verify basic fields
    expect(result.id).toEqual(testAssessmentId);
    expect(result.gcc_name).toEqual('Test GCC');
    expect(result.contact_email).toEqual('test@example.com');

    // Verify calculated scores
    expect(result.overall_maturity_score).toEqual(3.5); // (4+5+3+2)/4 = 3.5
    expect(result.strategy_score).toEqual(4.5); // (4+5)/2 = 4.5
    expect(result.talent_score).toEqual(3); // 3/1 = 3
    expect(result.technology_score).toEqual(2); // 2/1 = 2

    // Verify archetype determination
    expect(result.archetype).toEqual('progressors'); // 3.5 falls in progressors range

    // Verify updated_at is recent
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save responses to database', async () => {
    const input = {
      ...testInput,
      assessment_id: testAssessmentId,
      responses: [
        { question_id: testQuestionIds[0], response_value: 4 },
        { question_id: testQuestionIds[1], response_value: 5 }
      ]
    };

    await submitAssessmentResponses(input);

    // Check responses were saved
    const savedResponses = await db.select()
      .from(assessmentResponsesTable)
      .where(eq(assessmentResponsesTable.assessment_id, testAssessmentId))
      .execute();

    expect(savedResponses).toHaveLength(2);
    expect(savedResponses[0].response_value).toEqual(4);
    expect(savedResponses[1].response_value).toEqual(5);
  });

  it('should determine correct archetype for leaders', async () => {
    const input = {
      ...testInput,
      assessment_id: testAssessmentId,
      responses: [
        { question_id: testQuestionIds[0], response_value: 5 },
        { question_id: testQuestionIds[1], response_value: 4 }
      ]
    };

    const result = await submitAssessmentResponses(input);

    expect(result.overall_maturity_score).toEqual(4.5); // (5+4)/2 = 4.5
    expect(result.archetype).toEqual('leaders'); // >= 4.0 = leaders
  });

  it('should determine correct archetype for emergents', async () => {
    const input = {
      ...testInput,
      assessment_id: testAssessmentId,
      responses: [
        { question_id: testQuestionIds[0], response_value: 2 },
        { question_id: testQuestionIds[1], response_value: 3 }
      ]
    };

    const result = await submitAssessmentResponses(input);

    expect(result.overall_maturity_score).toEqual(2.5); // (2+3)/2 = 2.5
    expect(result.archetype).toEqual('emergents'); // >= 2.0 and < 3.0 = emergents
  });

  it('should determine correct archetype for laggards', async () => {
    const input = {
      ...testInput,
      assessment_id: testAssessmentId,
      responses: [
        { question_id: testQuestionIds[0], response_value: 1 },
        { question_id: testQuestionIds[1], response_value: 2 }
      ]
    };

    const result = await submitAssessmentResponses(input);

    expect(result.overall_maturity_score).toEqual(1.5); // (1+2)/2 = 1.5
    expect(result.archetype).toEqual('laggards'); // < 2.0 = laggards
  });

  it('should throw error for non-existent assessment', async () => {
    const input = {
      ...testInput,
      assessment_id: 99999,
      responses: [
        { question_id: testQuestionIds[0], response_value: 4 }
      ]
    };

    await expect(submitAssessmentResponses(input)).rejects.toThrow(/Assessment with id 99999 not found/i);
  });

  it('should throw error for non-existent question', async () => {
    const input = {
      ...testInput,
      assessment_id: testAssessmentId,
      responses: [
        { question_id: 99999, response_value: 4 }
      ]
    };

    await expect(submitAssessmentResponses(input)).rejects.toThrow(/Question with id 99999 not found/i);
  });

  it('should handle mixed dimension responses correctly', async () => {
    const input = {
      ...testInput,
      assessment_id: testAssessmentId,
      responses: [
        { question_id: testQuestionIds[0], response_value: 5 }, // strategy
        { question_id: testQuestionIds[1], response_value: 3 }, // strategy
        { question_id: testQuestionIds[2], response_value: 4 }, // talent
        { question_id: testQuestionIds[3], response_value: 2 }  // technology
      ]
    };

    const result = await submitAssessmentResponses(input);

    // Verify dimension-specific scores
    expect(result.strategy_score).toEqual(4); // (5+3)/2 = 4
    expect(result.talent_score).toEqual(4); // 4/1 = 4
    expect(result.technology_score).toEqual(2); // 2/1 = 2
    expect(result.overall_maturity_score).toEqual(3.5); // (5+3+4+2)/4 = 3.5
  });
});
