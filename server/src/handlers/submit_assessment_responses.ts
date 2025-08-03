
import { db } from '../db';
import { assessmentsTable, assessmentResponsesTable, assessmentQuestionsTable } from '../db/schema';
import { type SubmitAssessmentResponsesInput, type Assessment } from '../schema';
import { eq, and } from 'drizzle-orm';

// Maturity score calculation logic
const calculateMaturityScore = (responses: number[]): number => {
  if (responses.length === 0) return 0;
  const average = responses.reduce((sum, score) => sum + score, 0) / responses.length;
  return Math.round(average * 100) / 100; // Round to 2 decimal places
};

// Archetype determination based on overall maturity score
const determineArchetype = (overallScore: number): 'leaders' | 'progressors' | 'emergents' | 'laggards' => {
  if (overallScore >= 4.0) return 'leaders';
  if (overallScore >= 3.0) return 'progressors';
  if (overallScore >= 2.0) return 'emergents';
  return 'laggards';
};

export async function submitAssessmentResponses(input: SubmitAssessmentResponsesInput): Promise<Assessment> {
  try {
    // First, verify the assessment exists
    const existingAssessment = await db.select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.id, input.assessment_id))
      .execute();

    if (existingAssessment.length === 0) {
      throw new Error(`Assessment with id ${input.assessment_id} not found`);
    }

    // Verify all questions exist
    const questionIds = input.responses.map(r => r.question_id);
    const existingQuestions = await db.select()
      .from(assessmentQuestionsTable)
      .where(eq(assessmentQuestionsTable.id, questionIds[0])) // Start with first question
      .execute();

    // Check each question exists
    for (const questionId of questionIds) {
      const questionExists = await db.select()
        .from(assessmentQuestionsTable)
        .where(eq(assessmentQuestionsTable.id, questionId))
        .execute();
      
      if (questionExists.length === 0) {
        throw new Error(`Question with id ${questionId} not found`);
      }
    }

    // Insert assessment responses
    const responseInserts = input.responses.map(response => ({
      assessment_id: input.assessment_id,
      question_id: response.question_id,
      response_value: response.response_value
    }));

    await db.insert(assessmentResponsesTable)
      .values(responseInserts)
      .execute();

    // Get all questions with their dimensions to calculate dimension scores
    const questionsWithDimensions = await db.select({
      id: assessmentQuestionsTable.id,
      dimension: assessmentQuestionsTable.dimension
    })
    .from(assessmentQuestionsTable)
    .execute();

    // Group responses by dimension
    const responsesByDimension: Record<string, number[]> = {};
    
    for (const response of input.responses) {
      const question = questionsWithDimensions.find(q => q.id === response.question_id);
      if (question) {
        if (!responsesByDimension[question.dimension]) {
          responsesByDimension[question.dimension] = [];
        }
        responsesByDimension[question.dimension].push(response.response_value);
      }
    }

    // Calculate dimension scores
    const strategyScore = responsesByDimension['strategy'] ? calculateMaturityScore(responsesByDimension['strategy']) : null;
    const talentScore = responsesByDimension['talent'] ? calculateMaturityScore(responsesByDimension['talent']) : null;
    const operatingModelScore = responsesByDimension['operating_model'] ? calculateMaturityScore(responsesByDimension['operating_model']) : null;
    const technologyScore = responsesByDimension['technology'] ? calculateMaturityScore(responsesByDimension['technology']) : null;
    const dataScore = responsesByDimension['data'] ? calculateMaturityScore(responsesByDimension['data']) : null;
    const adoptionScalingScore = responsesByDimension['adoption_scaling'] ? calculateMaturityScore(responsesByDimension['adoption_scaling']) : null;
    const aiTrustScore = responsesByDimension['ai_trust'] ? calculateMaturityScore(responsesByDimension['ai_trust']) : null;

    // Calculate overall maturity score from all responses
    const allResponseValues = input.responses.map(r => r.response_value);
    const overallMaturityScore = calculateMaturityScore(allResponseValues);

    // Determine archetype
    const archetype = determineArchetype(overallMaturityScore);

    // Update assessment with calculated scores
    const updatedAssessment = await db.update(assessmentsTable)
      .set({
        overall_maturity_score: overallMaturityScore.toString(),
        strategy_score: strategyScore?.toString() || null,
        talent_score: talentScore?.toString() || null,
        operating_model_score: operatingModelScore?.toString() || null,
        technology_score: technologyScore?.toString() || null,
        data_score: dataScore?.toString() || null,
        adoption_scaling_score: adoptionScalingScore?.toString() || null,
        ai_trust_score: aiTrustScore?.toString() || null,
        archetype: archetype,
        updated_at: new Date()
      })
      .where(eq(assessmentsTable.id, input.assessment_id))
      .returning()
      .execute();

    const result = updatedAssessment[0];

    // Convert numeric fields back to numbers
    return {
      ...result,
      annual_productivity_upliftment: parseFloat(result.annual_productivity_upliftment),
      attrition_rate: parseFloat(result.attrition_rate),
      overall_maturity_score: result.overall_maturity_score ? parseFloat(result.overall_maturity_score) : null,
      strategy_score: result.strategy_score ? parseFloat(result.strategy_score) : null,
      talent_score: result.talent_score ? parseFloat(result.talent_score) : null,
      operating_model_score: result.operating_model_score ? parseFloat(result.operating_model_score) : null,
      technology_score: result.technology_score ? parseFloat(result.technology_score) : null,
      data_score: result.data_score ? parseFloat(result.data_score) : null,
      adoption_scaling_score: result.adoption_scaling_score ? parseFloat(result.adoption_scaling_score) : null,
      ai_trust_score: result.ai_trust_score ? parseFloat(result.ai_trust_score) : null
    };
  } catch (error) {
    console.error('Assessment response submission failed:', error);
    throw error;
  }
}
