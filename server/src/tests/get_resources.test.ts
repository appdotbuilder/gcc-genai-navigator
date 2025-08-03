
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { resourcesTable } from '../db/schema';
import { getResources } from '../handlers/get_resources';

describe('getResources', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all resources when no filters provided', async () => {
    // Create test resources
    await db.insert(resourcesTable).values([
      {
        title: 'AI Strategy Framework',
        description: 'A comprehensive framework for AI strategy',
        content_type: 'framework',
        target_archetype: 'leaders',
        target_dimension: 'strategy',
        content_url: 'https://example.com/framework'
      },
      {
        title: 'Data Best Practices',
        description: 'Best practices for data management',
        content_type: 'best_practice',
        target_archetype: 'progressors',
        target_dimension: 'data',
        content_url: null
      },
      {
        title: 'General AI Insights',
        description: 'General insights about AI adoption',
        content_type: 'insight',
        target_archetype: null,
        target_dimension: null,
        content_url: 'https://example.com/insights'
      }
    ]).execute();

    const results = await getResources();

    expect(results).toHaveLength(3);
    expect(results[0].title).toEqual('AI Strategy Framework');
    expect(results[0].description).toEqual('A comprehensive framework for AI strategy');
    expect(results[0].content_type).toEqual('framework');
    expect(results[0].target_archetype).toEqual('leaders');
    expect(results[0].target_dimension).toEqual('strategy');
    expect(results[0].content_url).toEqual('https://example.com/framework');
    expect(results[0].id).toBeDefined();
    expect(results[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter resources by archetype', async () => {
    // Create test resources with different archetypes
    await db.insert(resourcesTable).values([
      {
        title: 'Leaders Case Study',
        description: 'Case study for leaders',
        content_type: 'case_study',
        target_archetype: 'leaders',
        target_dimension: 'strategy',
        content_url: null
      },
      {
        title: 'Progressors Guide',
        description: 'Guide for progressors',
        content_type: 'best_practice',
        target_archetype: 'progressors',
        target_dimension: 'talent',
        content_url: null
      },
      {
        title: 'General Resource',
        description: 'Resource for all archetypes',
        content_type: 'insight',
        target_archetype: null,
        target_dimension: null,
        content_url: null
      }
    ]).execute();

    const results = await getResources('leaders');

    expect(results).toHaveLength(1);
    expect(results[0].title).toEqual('Leaders Case Study');
    expect(results[0].target_archetype).toEqual('leaders');
  });

  it('should filter resources by dimension', async () => {
    // Create test resources with different dimensions
    await db.insert(resourcesTable).values([
      {
        title: 'Strategy Resource',
        description: 'Resource about strategy',
        content_type: 'framework',
        target_archetype: 'leaders',
        target_dimension: 'strategy',
        content_url: null
      },
      {
        title: 'Technology Resource',
        description: 'Resource about technology',
        content_type: 'best_practice',
        target_archetype: 'progressors',
        target_dimension: 'technology',
        content_url: null
      },
      {
        title: 'Data Resource',
        description: 'Resource about data',
        content_type: 'case_study',
        target_archetype: 'emergents',
        target_dimension: 'data',
        content_url: null
      }
    ]).execute();

    const results = await getResources(undefined, 'data');

    expect(results).toHaveLength(1);
    expect(results[0].title).toEqual('Data Resource');
    expect(results[0].target_dimension).toEqual('data');
  });

  it('should filter resources by both archetype and dimension', async () => {
    // Create test resources with various combinations
    await db.insert(resourcesTable).values([
      {
        title: 'Leaders Strategy Resource',
        description: 'Strategy resource for leaders',
        content_type: 'framework',
        target_archetype: 'leaders',
        target_dimension: 'strategy',
        content_url: null
      },
      {
        title: 'Leaders Data Resource',
        description: 'Data resource for leaders',
        content_type: 'best_practice',
        target_archetype: 'leaders',
        target_dimension: 'data',
        content_url: null
      },
      {
        title: 'Progressors Strategy Resource',
        description: 'Strategy resource for progressors',
        content_type: 'case_study',
        target_archetype: 'progressors',
        target_dimension: 'strategy',
        content_url: null
      }
    ]).execute();

    const results = await getResources('leaders', 'strategy');

    expect(results).toHaveLength(1);
    expect(results[0].title).toEqual('Leaders Strategy Resource');
    expect(results[0].target_archetype).toEqual('leaders');
    expect(results[0].target_dimension).toEqual('strategy');
  });

  it('should return empty array when no resources match filters', async () => {
    // Create test resource
    await db.insert(resourcesTable).values({
      title: 'Test Resource',
      description: 'A test resource',
      content_type: 'insight',
      target_archetype: 'leaders',
      target_dimension: 'strategy',
      content_url: null
    }).execute();

    const results = await getResources('laggards', 'ai_trust');

    expect(results).toHaveLength(0);
  });

  it('should handle resources with null archetype and dimension', async () => {
    // Create resources with null values
    await db.insert(resourcesTable).values([
      {
        title: 'Resource with Null Archetype',
        description: 'Resource without specific archetype',
        content_type: 'insight',
        target_archetype: null,
        target_dimension: 'strategy',
        content_url: null
      },
      {
        title: 'Resource with Null Dimension',
        description: 'Resource without specific dimension',
        content_type: 'best_practice',
        target_archetype: 'leaders',
        target_dimension: null,
        content_url: null
      },
      {
        title: 'Resource with Both Null',
        description: 'General resource',
        content_type: 'framework',
        target_archetype: null,
        target_dimension: null,
        content_url: null
      }
    ]).execute();

    // Should only return resources that match the exact archetype filter
    const resultsByArchetype = await getResources('leaders');
    expect(resultsByArchetype).toHaveLength(1);
    expect(resultsByArchetype[0].title).toEqual('Resource with Null Dimension');

    // Should only return resources that match the exact dimension filter
    const resultsByDimension = await getResources(undefined, 'strategy');
    expect(resultsByDimension).toHaveLength(1);
    expect(resultsByDimension[0].title).toEqual('Resource with Null Archetype');
  });
});
