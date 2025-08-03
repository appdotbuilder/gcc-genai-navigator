
import { db } from '../db';
import { assessmentsTable } from '../db/schema';
import { type CreateAssessmentInput, type Assessment } from '../schema';

export const createAssessment = async (input: CreateAssessmentInput): Promise<Assessment> => {
  try {
    // Insert assessment record
    const result = await db.insert(assessmentsTable)
      .values({
        gcc_name: input.gcc_name,
        contact_email: input.contact_email,
        annual_productivity_upliftment: input.annual_productivity_upliftment.toString(),
        attrition_rate: input.attrition_rate.toString(),
        genai_use_cases_developed: input.genai_use_cases_developed
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const assessment = result[0];
    return {
      ...assessment,
      annual_productivity_upliftment: parseFloat(assessment.annual_productivity_upliftment),
      attrition_rate: parseFloat(assessment.attrition_rate),
      overall_maturity_score: assessment.overall_maturity_score ? parseFloat(assessment.overall_maturity_score) : null,
      strategy_score: assessment.strategy_score ? parseFloat(assessment.strategy_score) : null,
      talent_score: assessment.talent_score ? parseFloat(assessment.talent_score) : null,
      operating_model_score: assessment.operating_model_score ? parseFloat(assessment.operating_model_score) : null,
      technology_score: assessment.technology_score ? parseFloat(assessment.technology_score) : null,
      data_score: assessment.data_score ? parseFloat(assessment.data_score) : null,
      adoption_scaling_score: assessment.adoption_scaling_score ? parseFloat(assessment.adoption_scaling_score) : null,
      ai_trust_score: assessment.ai_trust_score ? parseFloat(assessment.ai_trust_score) : null
    };
  } catch (error) {
    console.error('Assessment creation failed:', error);
    throw error;
  }
};
