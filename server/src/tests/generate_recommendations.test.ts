
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assessmentsTable, recommendationsTable } from '../db/schema';
import { generateRecommendations } from '../handlers/generate_recommendations';
import { eq } from 'drizzle-orm';

// Test assessment data
const createTestAssessment = async (overrides: Partial<any> = {}) => {
  const result = await db.insert(assessmentsTable)
    .values({
      gcc_name: 'Test GCC',
      contact_email: 'test@example.com',
      annual_productivity_upliftment: '15.5',
      attrition_rate: '8.2',
      genai_use_cases_developed: 5,
      strategy_score: '2.5',
      talent_score: '2.0',
      operating_model_score: '3.0',
      technology_score: '1.8',
      data_score: '2.8',
      adoption_scaling_score: '2.2',
      ai_trust_score: '2.0',
      archetype: 'emergents',
      ...overrides
    })
    .returning()
    .execute();

  return result[0];
};

describe('generateRecommendations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should generate recommendations for assessment', async () => {
    const assessment = await createTestAssessment();
    
    const recommendations = await generateRecommendations(assessment.id);

    expect(recommendations.length).toBeGreaterThan(0);
    
    // Verify all recommendations have required fields
    recommendations.forEach(rec => {
      expect(rec.id).toBeDefined();
      expect(rec.assessment_id).toEqual(assessment.id);
      expect(rec.category).toBeDefined();
      expect(rec.title).toBeDefined();
      expect(rec.description).toBeDefined();
      expect(rec.priority_level).toBeGreaterThanOrEqual(1);
      expect(rec.priority_level).toBeLessThanOrEqual(5);
      expect(typeof rec.is_critical_imperative).toBe('boolean');
      expect(rec.created_at).toBeInstanceOf(Date);
    });
  });

  it('should save recommendations to database', async () => {
    const assessment = await createTestAssessment();
    
    await generateRecommendations(assessment.id);

    const savedRecommendations = await db.select()
      .from(recommendationsTable)
      .where(eq(recommendationsTable.assessment_id, assessment.id))
      .execute();

    expect(savedRecommendations.length).toBeGreaterThan(0);
    
    // Verify database structure
    savedRecommendations.forEach(rec => {
      expect(rec.assessment_id).toEqual(assessment.id);
      expect(['strategic_alignment', 'talent_capability_building', 'innovation_value_creation', 
               'operating_model_technology', 'risk_resilience', 'impact_measurement_governance'])
        .toContain(rec.category);
    });
  });

  it('should generate critical imperatives for low scores', async () => {
    const assessment = await createTestAssessment({
      strategy_score: '1.5',
      talent_score: '1.0',
      ai_trust_score: '2.0',
      archetype: 'laggards'
    });
    
    const recommendations = await generateRecommendations(assessment.id);

    const criticalImperatives = recommendations.filter(r => r.is_critical_imperative);
    expect(criticalImperatives.length).toBeGreaterThanOrEqual(3);

    // Verify high priority for critical items
    criticalImperatives.forEach(rec => {
      expect(rec.priority_level).toBeGreaterThanOrEqual(4);
    });
  });

  it('should generate archetype-specific recommendations', async () => {
    const laggardAssessment = await createTestAssessment({
      archetype: 'laggards',
      strategy_score: '1.0'
    });
    
    const recommendations = await generateRecommendations(laggardAssessment.id);

    // Should include readiness assessment for laggards
    const readinessRec = recommendations.find(r => r.title.includes('Readiness Assessment'));
    expect(readinessRec).toBeDefined();
    expect(readinessRec?.is_critical_imperative).toBe(true);
  });

  it('should generate different recommendations for leaders archetype', async () => {
    const leaderAssessment = await createTestAssessment({
      archetype: 'leaders',
      strategy_score: '4.5',
      talent_score: '4.0',
      technology_score: '4.2'
    });
    
    const recommendations = await generateRecommendations(leaderAssessment.id);

    // Should include advanced research for leaders
    const researchRec = recommendations.find(r => r.title.includes('Advanced GenAI Research'));
    expect(researchRec).toBeDefined();
    expect(researchRec?.priority_level).toBeLessThanOrEqual(3); // Lower priority for advanced items
  });

  it('should handle assessment with null scores', async () => {
    const assessment = await createTestAssessment({
      strategy_score: null,
      talent_score: null,
      operating_model_score: null,
      technology_score: null,
      data_score: null,
      adoption_scaling_score: null,
      ai_trust_score: null,
      archetype: null
    });
    
    const recommendations = await generateRecommendations(assessment.id);

    expect(recommendations.length).toBeGreaterThan(0);
    
    // Should generate recommendations for missing scores (treated as low)
    const strategicRec = recommendations.find(r => r.category === 'strategic_alignment');
    expect(strategicRec).toBeDefined();
  });

  it('should throw error for non-existent assessment', async () => {
    await expect(generateRecommendations(99999))
      .rejects.toThrow(/Assessment with id 99999 not found/i);
  });

  it('should cover all recommendation categories', async () => {
    const assessment = await createTestAssessment({
      strategy_score: '1.5',
      talent_score: '1.5',
      operating_model_score: '1.5',
      technology_score: '1.5',
      ai_trust_score: '1.5',
      adoption_scaling_score: '1.5'
    });
    
    const recommendations = await generateRecommendations(assessment.id);

    const categories = recommendations.map(r => r.category);
    const uniqueCategories = [...new Set(categories)];
    
    // Should have multiple categories represented
    expect(uniqueCategories.length).toBeGreaterThanOrEqual(4);
    
    // Should include key categories
    expect(categories).toContain('strategic_alignment');
    expect(categories).toContain('talent_capability_building');
    expect(categories).toContain('risk_resilience');
  });
});
