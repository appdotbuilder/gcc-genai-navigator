
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assessmentQuestionsTable } from '../db/schema';
import { getAssessmentQuestions } from '../handlers/get_assessment_questions';
import { eq } from 'drizzle-orm';

describe('getAssessmentQuestions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no questions exist', async () => {
    const result = await getAssessmentQuestions();
    expect(result).toEqual([]);
  });

  it('should fetch all assessment questions', async () => {
    // Create test questions
    await db.insert(assessmentQuestionsTable).values([
      {
        dimension: 'strategy',
        question_text: 'How well defined is your AI strategy?',
        question_order: 1
      },
      {
        dimension: 'talent',
        question_text: 'Do you have dedicated AI talent?',
        question_order: 1
      },
      {
        dimension: 'strategy',
        question_text: 'Is AI strategy aligned with business goals?',
        question_order: 2
      }
    ]).execute();

    const result = await getAssessmentQuestions();

    expect(result).toHaveLength(3);
    expect(result[0].dimension).toEqual('strategy');
    expect(result[0].question_text).toEqual('How well defined is your AI strategy?');
    expect(result[0].question_order).toEqual(1);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return questions ordered by dimension and question_order', async () => {
    // Create questions out of order to test sorting
    await db.insert(assessmentQuestionsTable).values([
      {
        dimension: 'talent',
        question_text: 'Talent question 2',
        question_order: 2
      },
      {
        dimension: 'strategy',
        question_text: 'Strategy question 1',
        question_order: 1
      },
      {
        dimension: 'talent',
        question_text: 'Talent question 1',
        question_order: 1
      },
      {
        dimension: 'strategy',
        question_text: 'Strategy question 2',
        question_order: 2
      }
    ]).execute();

    const result = await getAssessmentQuestions();

    expect(result).toHaveLength(4);
    
    // Should be ordered by dimension first (strategy comes before talent alphabetically)
    expect(result[0].dimension).toEqual('strategy');
    expect(result[0].question_order).toEqual(1);
    expect(result[1].dimension).toEqual('strategy');
    expect(result[1].question_order).toEqual(2);
    expect(result[2].dimension).toEqual('talent');
    expect(result[2].question_order).toEqual(1);
    expect(result[3].dimension).toEqual('talent');
    expect(result[3].question_order).toEqual(2);
  });

  it('should save questions to database correctly', async () => {
    await db.insert(assessmentQuestionsTable).values({
      dimension: 'technology',
      question_text: 'How mature is your AI infrastructure?',
      question_order: 1
    }).execute();

    const result = await getAssessmentQuestions();
    
    // Verify data was saved and retrieved correctly
    const savedQuestion = await db.select()
      .from(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.id, result[0].id))
      .execute();

    expect(savedQuestion).toHaveLength(1);
    expect(savedQuestion[0].dimension).toEqual('technology');
    expect(savedQuestion[0].question_text).toEqual('How mature is your AI infrastructure?');
    expect(savedQuestion[0].question_order).toEqual(1);
    expect(savedQuestion[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle all maturity dimensions', async () => {
    // Test all possible dimensions
    const dimensions = ['strategy', 'talent', 'operating_model', 'technology', 'data', 'adoption_scaling', 'ai_trust'] as const;
    
    const questionsData = dimensions.map((dimension, index) => ({
      dimension,
      question_text: `Test question for ${dimension}`,
      question_order: 1
    }));

    await db.insert(assessmentQuestionsTable).values(questionsData).execute();

    const result = await getAssessmentQuestions();

    expect(result).toHaveLength(7);
    
    // Verify all dimensions are present
    const resultDimensions = result.map(q => q.dimension);
    dimensions.forEach(dimension => {
      expect(resultDimensions).toContain(dimension);
    });
  });
});
