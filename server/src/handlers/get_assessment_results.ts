
import { db } from '../db';
import { 
  assessmentsTable, 
  assessmentResponsesTable, 
  recommendationsTable, 
  businessQueriesTable 
} from '../db/schema';
import { type AssessmentResults } from '../schema';
import { eq } from 'drizzle-orm';

export async function getAssessmentResults(assessmentId: number): Promise<AssessmentResults> {
  try {
    // Fetch assessment
    const assessments = await db.select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.id, assessmentId))
      .execute();

    if (assessments.length === 0) {
      throw new Error(`Assessment with id ${assessmentId} not found`);
    }

    const assessmentData = assessments[0];

    // Fetch responses
    const responsesData = await db.select()
      .from(assessmentResponsesTable)
      .where(eq(assessmentResponsesTable.assessment_id, assessmentId))
      .execute();

    // Fetch recommendations
    const recommendationsData = await db.select()
      .from(recommendationsTable)
      .where(eq(recommendationsTable.assessment_id, assessmentId))
      .execute();

    // Fetch business queries
    const businessQueriesData = await db.select()
      .from(businessQueriesTable)
      .where(eq(businessQueriesTable.assessment_id, assessmentId))
      .execute();

    // Convert numeric fields for assessment
    const assessment = {
      ...assessmentData,
      annual_productivity_upliftment: parseFloat(assessmentData.annual_productivity_upliftment),
      attrition_rate: parseFloat(assessmentData.attrition_rate),
      overall_maturity_score: assessmentData.overall_maturity_score ? parseFloat(assessmentData.overall_maturity_score) : null,
      strategy_score: assessmentData.strategy_score ? parseFloat(assessmentData.strategy_score) : null,
      talent_score: assessmentData.talent_score ? parseFloat(assessmentData.talent_score) : null,
      operating_model_score: assessmentData.operating_model_score ? parseFloat(assessmentData.operating_model_score) : null,
      technology_score: assessmentData.technology_score ? parseFloat(assessmentData.technology_score) : null,
      data_score: assessmentData.data_score ? parseFloat(assessmentData.data_score) : null,
      adoption_scaling_score: assessmentData.adoption_scaling_score ? parseFloat(assessmentData.adoption_scaling_score) : null,
      ai_trust_score: assessmentData.ai_trust_score ? parseFloat(assessmentData.ai_trust_score) : null
    };

    return {
      assessment,
      responses: responsesData,
      recommendations: recommendationsData,
      business_queries: businessQueriesData
    };
  } catch (error) {
    console.error('Get assessment results failed:', error);
    throw error;
  }
}
