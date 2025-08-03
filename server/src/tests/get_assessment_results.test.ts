
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  assessmentsTable, 
  assessmentResponsesTable, 
  recommendationsTable, 
  businessQueriesTable,
  assessmentQuestionsTable
} from '../db/schema';
import { getAssessmentResults } from '../handlers/get_assessment_results';

describe('getAssessmentResults', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should get complete assessment results', async () => {
    // Create assessment
    const assessmentResult = await db.insert(assessmentsTable)
      .values({
        gcc_name: 'Test GCC',
        contact_email: 'test@example.com',
        annual_productivity_upliftment: '15.5',
        attrition_rate: '8.2',
        genai_use_cases_developed: 12,
        overall_maturity_score: '3.5',
        strategy_score: '4.0',
        talent_score: '3.2',
        operating_model_score: '3.8',
        technology_score: '2.9',
        data_score: '3.1',
        adoption_scaling_score: '3.6',
        ai_trust_score: '3.3',
        archetype: 'progressors'
      })
      .returning()
      .execute();

    const assessmentId = assessmentResult[0].id;

    // Create assessment question
    const questionResult = await db.insert(assessmentQuestionsTable)
      .values({
        dimension: 'strategy',
        question_text: 'Test question',
        question_order: 1
      })
      .returning()
      .execute();

    const questionId = questionResult[0].id;

    // Create assessment response
    await db.insert(assessmentResponsesTable)
      .values({
        assessment_id: assessmentId,
        question_id: questionId,
        response_value: 4
      })
      .execute();

    // Create recommendation
    await db.insert(recommendationsTable)
      .values({
        assessment_id: assessmentId,
        category: 'strategic_alignment',
        title: 'Test Recommendation',
        description: 'Test recommendation description',
        priority_level: 1,
        is_critical_imperative: true,
        expected_impact: 'High impact',
        implementation_timeline: '3-6 months'
      })
      .execute();

    // Create business query
    await db.insert(businessQueriesTable)
      .values({
        assessment_id: assessmentId,
        query_text: 'How to improve AI adoption?',
        target_function: 'technology'
      })
      .execute();

    const results = await getAssessmentResults(assessmentId);

    // Verify assessment data
    expect(results.assessment.id).toEqual(assessmentId);
    expect(results.assessment.gcc_name).toEqual('Test GCC');
    expect(results.assessment.contact_email).toEqual('test@example.com');
    expect(results.assessment.annual_productivity_upliftment).toEqual(15.5);
    expect(results.assessment.attrition_rate).toEqual(8.2);
    expect(results.assessment.genai_use_cases_developed).toEqual(12);
    expect(results.assessment.overall_maturity_score).toEqual(3.5);
    expect(results.assessment.strategy_score).toEqual(4.0);
    expect(results.assessment.talent_score).toEqual(3.2);
    expect(results.assessment.operating_model_score).toEqual(3.8);
    expect(results.assessment.technology_score).toEqual(2.9);
    expect(results.assessment.data_score).toEqual(3.1);
    expect(results.assessment.adoption_scaling_score).toEqual(3.6);
    expect(results.assessment.ai_trust_score).toEqual(3.3);
    expect(results.assessment.archetype).toEqual('progressors');
    expect(results.assessment.created_at).toBeInstanceOf(Date);
    expect(results.assessment.updated_at).toBeInstanceOf(Date);

    // Verify responses
    expect(results.responses).toHaveLength(1);
    expect(results.responses[0].assessment_id).toEqual(assessmentId);
    expect(results.responses[0].question_id).toEqual(questionId);
    expect(results.responses[0].response_value).toEqual(4);
    expect(results.responses[0].created_at).toBeInstanceOf(Date);

    // Verify recommendations
    expect(results.recommendations).toHaveLength(1);
    expect(results.recommendations[0].assessment_id).toEqual(assessmentId);
    expect(results.recommendations[0].category).toEqual('strategic_alignment');
    expect(results.recommendations[0].title).toEqual('Test Recommendation');
    expect(results.recommendations[0].description).toEqual('Test recommendation description');
    expect(results.recommendations[0].priority_level).toEqual(1);
    expect(results.recommendations[0].is_critical_imperative).toEqual(true);
    expect(results.recommendations[0].expected_impact).toEqual('High impact');
    expect(results.recommendations[0].implementation_timeline).toEqual('3-6 months');
    expect(results.recommendations[0].created_at).toBeInstanceOf(Date);

    // Verify business queries
    expect(results.business_queries).toHaveLength(1);
    expect(results.business_queries[0].assessment_id).toEqual(assessmentId);
    expect(results.business_queries[0].query_text).toEqual('How to improve AI adoption?');
    expect(results.business_queries[0].target_function).toEqual('technology');
    expect(results.business_queries[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle assessment with null scores', async () => {
    // Create assessment with null scores
    const assessmentResult = await db.insert(assessmentsTable)
      .values({
        gcc_name: 'Test GCC',
        contact_email: 'test@example.com',
        annual_productivity_upliftment: '10.0',
        attrition_rate: '5.0',
        genai_use_cases_developed: 5,
        overall_maturity_score: null,
        strategy_score: null,
        talent_score: null,
        operating_model_score: null,
        technology_score: null,
        data_score: null,
        adoption_scaling_score: null,
        ai_trust_score: null,
        archetype: null
      })
      .returning()
      .execute();

    const assessmentId = assessmentResult[0].id;

    const results = await getAssessmentResults(assessmentId);

    expect(results.assessment.overall_maturity_score).toBeNull();
    expect(results.assessment.strategy_score).toBeNull();
    expect(results.assessment.talent_score).toBeNull();
    expect(results.assessment.operating_model_score).toBeNull();
    expect(results.assessment.technology_score).toBeNull();
    expect(results.assessment.data_score).toBeNull();
    expect(results.assessment.adoption_scaling_score).toBeNull();
    expect(results.assessment.ai_trust_score).toBeNull();
    expect(results.assessment.archetype).toBeNull();
  });

  it('should return empty arrays when no related data exists', async () => {
    // Create assessment only
    const assessmentResult = await db.insert(assessmentsTable)
      .values({
        gcc_name: 'Test GCC',
        contact_email: 'test@example.com',
        annual_productivity_upliftment: '10.0',
        attrition_rate: '5.0',
        genai_use_cases_developed: 5
      })
      .returning()
      .execute();

    const assessmentId = assessmentResult[0].id;

    const results = await getAssessmentResults(assessmentId);

    expect(results.assessment.id).toEqual(assessmentId);
    expect(results.responses).toHaveLength(0);
    expect(results.recommendations).toHaveLength(0);
    expect(results.business_queries).toHaveLength(0);
  });

  it('should throw error for non-existent assessment', async () => {
    await expect(getAssessmentResults(999999)).rejects.toThrow(/Assessment with id 999999 not found/i);
  });
});
