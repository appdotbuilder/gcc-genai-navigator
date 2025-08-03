
import { db } from '../db';
import { assessmentsTable, recommendationsTable } from '../db/schema';
import { type Recommendation } from '../schema';
import { eq } from 'drizzle-orm';

interface RecommendationTemplate {
  category: 'strategic_alignment' | 'talent_capability_building' | 'innovation_value_creation' | 'operating_model_technology' | 'risk_resilience' | 'impact_measurement_governance';
  title: string;
  description: string;
  priority_level: number;
  is_critical_imperative: boolean;
  expected_impact: string;
  implementation_timeline: string;
}

// Recommendation templates based on archetype and maturity scores
const getRecommendationTemplates = (
  archetype: string | null,
  scores: {
    strategy_score: number | null;
    talent_score: number | null;
    operating_model_score: number | null;
    technology_score: number | null;
    data_score: number | null;
    adoption_scaling_score: number | null;
    ai_trust_score: number | null;
  }
): RecommendationTemplate[] => {
  const recommendations: RecommendationTemplate[] = [];
  
  // Strategic Alignment recommendations
  if (!scores.strategy_score || scores.strategy_score < 3.0) {
    recommendations.push({
      category: 'strategic_alignment',
      title: 'Develop GenAI Strategic Roadmap',
      description: 'Create a comprehensive GenAI strategy aligned with business objectives and establish clear governance frameworks.',
      priority_level: archetype === 'laggards' ? 5 : 4,
      is_critical_imperative: true,
      expected_impact: 'Improved strategic focus and resource allocation for GenAI initiatives',
      implementation_timeline: '30-60 days'
    });
  }

  // Talent & Capability Building
  if (!scores.talent_score || scores.talent_score < 3.0) {
    recommendations.push({
      category: 'talent_capability_building',
      title: 'Implement GenAI Upskilling Program',
      description: 'Launch comprehensive training programs to build GenAI capabilities across all business functions.',
      priority_level: 5,
      is_critical_imperative: true,
      expected_impact: 'Enhanced workforce readiness and reduced skill gaps in GenAI adoption',
      implementation_timeline: '60-90 days'
    });
  }

  // Innovation & Value Creation
  if (!scores.adoption_scaling_score || scores.adoption_scaling_score < 3.0) {
    recommendations.push({
      category: 'innovation_value_creation',
      title: 'Establish GenAI Center of Excellence',
      description: 'Create a dedicated center to drive innovation, standardize practices, and scale successful GenAI use cases.',
      priority_level: 4,
      is_critical_imperative: archetype !== 'leaders',
      expected_impact: 'Accelerated innovation and systematic scaling of GenAI solutions',
      implementation_timeline: '30-90 days'
    });
  }

  // Operating Model & Technology
  if (!scores.technology_score || scores.technology_score < 3.0 || !scores.operating_model_score || scores.operating_model_score < 3.0) {
    recommendations.push({
      category: 'operating_model_technology',
      title: 'Modernize GenAI Infrastructure',
      description: 'Upgrade technology infrastructure and establish robust operating models to support GenAI workloads.',
      priority_level: 4,
      is_critical_imperative: scores.technology_score !== null && scores.technology_score < 2.0,
      expected_impact: 'Improved performance, scalability, and reliability of GenAI applications',
      implementation_timeline: '60-90 days'
    });
  }

  // Risk & Resilience
  if (!scores.ai_trust_score || scores.ai_trust_score < 3.5) {
    recommendations.push({
      category: 'risk_resilience',
      title: 'Implement AI Ethics and Risk Framework',
      description: 'Establish comprehensive AI governance, ethics guidelines, and risk management practices for responsible GenAI deployment.',
      priority_level: 5,
      is_critical_imperative: true,
      expected_impact: 'Reduced compliance risks and enhanced stakeholder trust in GenAI initiatives',
      implementation_timeline: '30-60 days'
    });
  }

  // Impact Measurement & Governance
  recommendations.push({
    category: 'impact_measurement_governance',
    title: 'Establish GenAI Performance Metrics',
    description: 'Define and implement comprehensive KPIs and measurement frameworks to track GenAI impact and ROI.',
    priority_level: 3,
    is_critical_imperative: false,
    expected_impact: 'Better visibility into GenAI value creation and data-driven decision making',
    implementation_timeline: '30-60 days'
  });

  // Add archetype-specific recommendations
  if (archetype === 'laggards') {
    recommendations.push({
      category: 'strategic_alignment',
      title: 'GenAI Readiness Assessment',
      description: 'Conduct comprehensive organizational readiness assessment before large-scale GenAI implementation.',
      priority_level: 5,
      is_critical_imperative: true,
      expected_impact: 'Clear understanding of organizational gaps and priority areas for GenAI adoption',
      implementation_timeline: '30 days'
    });
  }

  if (archetype === 'leaders') {
    recommendations.push({
      category: 'innovation_value_creation',
      title: 'Advanced GenAI Research Initiatives',
      description: 'Invest in cutting-edge GenAI research and development to maintain competitive advantage.',
      priority_level: 2,
      is_critical_imperative: false,
      expected_impact: 'Sustained innovation leadership and competitive differentiation',
      implementation_timeline: '90+ days'
    });
  }

  return recommendations;
};

export async function generateRecommendations(assessmentId: number): Promise<Recommendation[]> {
  try {
    // Get assessment data
    const assessments = await db.select()
      .from(assessmentsTable)
      .where(eq(assessmentsTable.id, assessmentId))
      .execute();

    if (assessments.length === 0) {
      throw new Error(`Assessment with id ${assessmentId} not found`);
    }

    const assessment = assessments[0];

    // Convert numeric scores to numbers
    const scores = {
      strategy_score: assessment.strategy_score ? parseFloat(assessment.strategy_score) : null,
      talent_score: assessment.talent_score ? parseFloat(assessment.talent_score) : null,
      operating_model_score: assessment.operating_model_score ? parseFloat(assessment.operating_model_score) : null,
      technology_score: assessment.technology_score ? parseFloat(assessment.technology_score) : null,
      data_score: assessment.data_score ? parseFloat(assessment.data_score) : null,
      adoption_scaling_score: assessment.adoption_scaling_score ? parseFloat(assessment.adoption_scaling_score) : null,
      ai_trust_score: assessment.ai_trust_score ? parseFloat(assessment.ai_trust_score) : null,
    };

    // Generate recommendation templates
    const templates = getRecommendationTemplates(assessment.archetype, scores);

    // Create recommendations in database
    const createdRecommendations: Recommendation[] = [];

    for (const template of templates) {
      const result = await db.insert(recommendationsTable)
        .values({
          assessment_id: assessmentId,
          category: template.category,
          title: template.title,
          description: template.description,
          priority_level: template.priority_level,
          is_critical_imperative: template.is_critical_imperative,
          expected_impact: template.expected_impact,
          implementation_timeline: template.implementation_timeline
        })
        .returning()
        .execute();

      createdRecommendations.push(result[0]);
    }

    return createdRecommendations;
  } catch (error) {
    console.error('Recommendation generation failed:', error);
    throw error;
  }
}
