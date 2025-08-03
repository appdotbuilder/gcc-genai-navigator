
import { db } from '../db';
import { assessmentQuestionsTable } from '../db/schema';
import { type AssessmentQuestion } from '../schema';
import { asc } from 'drizzle-orm';

export async function getAssessmentQuestions(): Promise<AssessmentQuestion[]> {
  try {
    const questions = await db.select()
      .from(assessmentQuestionsTable)
      .orderBy(asc(assessmentQuestionsTable.dimension), asc(assessmentQuestionsTable.question_order))
      .execute();

    return questions;
  } catch (error) {
    console.error('Failed to fetch assessment questions:', error);
    throw error;
  }
}
