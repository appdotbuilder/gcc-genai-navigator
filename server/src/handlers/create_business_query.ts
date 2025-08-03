
import { db } from '../db';
import { businessQueriesTable } from '../db/schema';
import { type CreateBusinessQueryInput, type BusinessQuery } from '../schema';

export const createBusinessQuery = async (input: CreateBusinessQueryInput): Promise<BusinessQuery> => {
  try {
    // Insert business query record
    const result = await db.insert(businessQueriesTable)
      .values({
        assessment_id: input.assessment_id,
        query_text: input.query_text,
        target_function: input.target_function
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Business query creation failed:', error);
    throw error;
  }
};
