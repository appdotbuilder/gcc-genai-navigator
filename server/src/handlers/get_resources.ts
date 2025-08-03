
import { db } from '../db';
import { resourcesTable } from '../db/schema';
import { type Resource } from '../schema';
import { eq, and, type SQL } from 'drizzle-orm';

export async function getResources(archetype?: string, dimension?: string): Promise<Resource[]> {
  try {
    const conditions: SQL<unknown>[] = [];

    // Filter by archetype if provided
    if (archetype) {
      conditions.push(eq(resourcesTable.target_archetype, archetype as any));
    }

    // Filter by dimension if provided
    if (dimension) {
      conditions.push(eq(resourcesTable.target_dimension, dimension as any));
    }

    // Build and execute query
    const results = conditions.length === 0 
      ? await db.select().from(resourcesTable).execute()
      : await db.select()
          .from(resourcesTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .execute();

    // Return results (no numeric conversions needed for this table)
    return results;
  } catch (error) {
    console.error('Get resources failed:', error);
    throw error;
  }
}
