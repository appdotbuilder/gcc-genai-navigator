
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/utils/trpc';
import type { Recommendation } from '../../../server/src/schema';

interface RecommendationsModuleProps {
  assessmentId: number;
}

export function RecommendationsModule({ assessmentId }: RecommendationsModuleProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All Recommendations', description: 'Complete strategic roadmap' },
    { key: 'strategic_alignment', label: 'Strategic Alignment', description: 'Business strategy integration' },
    { key: 'talent_capability_building', label: 'Talent & Capability Building', description: 'Human capital development' },
    { key: 'innovation_value_creation', label: 'Innovation & Value Creation', description: 'Revenue and innovation drivers' },
    { key: 'operating_model_technology', label: 'Operating Model & Technology', description: 'Infrastructure and processes' },
    { key: 'risk_resilience', label: 'Risk & Resilience', description: 'Governance and risk management' },
    { key: 'impact_measurement_governance', label: 'Impact Measurement & Governance', description: 'Performance tracking and compliance' }
  ];

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      await trpc.generateRecommendations.mutate({ assessmentId });
      // In a real implementation, we would fetch the generated recommendations
      // For now, we'll show placeholder recommendations
      const placeholderRecommendations: Recommendation[] = [
        {
          id: 1,
          assessment_id: assessmentId,
          category: 'strategic_alignment',
          title: 'Establish GenAI Center of Excellence',
          description: 'Create a dedicated GenAI COE to drive strategic initiatives and coordinate transformation efforts across all business units.',
          priority_level: 5,
          is_critical_imperative: true,
          expected_impact: 'Improved governance and accelerated adoption across functions',
          implementation_timeline: '30-60 days',
          created_at: new Date()
        },
        {
          id: 2,
          assessment_id: assessmentId,
          category: 'talent_capability_building',
          title: 'Launch GenAI Upskilling Program',
          description: 'Implement comprehensive training programs to build GenAI capabilities across all levels of the organization.',
          priority_level: 4,
          is_critical_imperative: true,
          expected_impact: '25% improvement in GenAI adoption readiness',
          implementation_timeline: '60-90 days',
          created_at: new Date()
        },
        {
          id: 3,
          assessment_id: assessmentId,
          category: 'innovation_value_creation',
          title: 'Develop High-Impact Use Case Portfolio',
          description: 'Identify and prioritize GenAI use cases with highest ROI potential for immediate implementation.',
          priority_level: 5,
          is_critical_imperative: true,
          expected_impact: '$2M+ annual cost savings potential',
          implementation_timeline: '30-45 days',
          created_at: new Date()
        },
        {
          id: 4,
          assessment_id: assessmentId,
          category: 'operating_model_technology',
          title: 'Establish Data Foundation',
          description: 'Implement robust data governance and quality frameworks to support GenAI initiatives.',
          priority_level: 4,
          is_critical_imperative: false,
          expected_impact: 'Enhanced data quality and GenAI model performance',
          implementation_timeline: '90 days',
          created_at: new Date()
        },
        {
          id: 5,
          assessment_id: assessmentId,
          category: 'risk_resilience',
          title: 'Deploy AI Ethics Framework',
          description: 'Establish comprehensive AI ethics and governance policies to ensure responsible GenAI deployment.',
          priority_level: 3,
          is_critical_imperative: false,
          expected_impact: 'Reduced compliance risk and improved stakeholder trust',
          implementation_timeline: '45-60 days',
          created_at: new Date()
        },
        {
          id: 6,
          assessment_id: assessmentId,
          category: 'impact_measurement_governance',
          title: 'Implement GenAI Performance Metrics',
          description: 'Design and deploy comprehensive metrics framework to track GenAI impact and ROI.',
          priority_level: 3,
          is_critical_imperative: false,
          expected_impact: 'Improved visibility into GenAI business value',
          implementation_timeline: '30-45 days',
          created_at: new Date()
        }
      ];
      setRecommendations(placeholderRecommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const getFilteredRecommendations = () => {
    if (selectedCategory === 'all') return recommendations;
    return recommendations.filter((rec: Recommendation) => rec.category === selectedCategory);
  };

  const getCriticalImperatives = () => {
    return recommendations.filter((rec: Recommendation) => rec.is_critical_imperative);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'text-red-400 border-red-400';
      case 4: return 'text-orange-400 border-orange-400';
      case 3: return 'text-yellow-400 border-yellow-400';
      case 2: return 'text-blue-400 border-blue-400';
      case 1: return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      case 1: return 'Optional';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="neo-kyoto-card">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto animate-pulse"></div>
              <h3 className="text-xl font-serif text-blue-400">Generating Personalized Recommendations</h3>
              <p className="text-gray-400">
                Analyzing your assessment results to create tailored strategic recommendations...
              </p>
              <Progress value={75} className="w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-serif text-blue-400 mb-4">
          Personalized Recommendation Engine
        </h2>
        <p className="text-gray-300 leading-relaxed">
          Strategic recommendations tailored to your GenAI maturity profile and business objectives.
        </p>
      </div>

      {/* Critical Imperatives Section */}
      {getCriticalImperatives().length > 0 && (
        <Card className="neo-kyoto-card border-red-400">
          <CardHeader className="bg-red-950/20">
            <CardTitle className="text-2xl text-red-400 font-serif">
              🚀 6 Critical Imperatives for Next 90 Days
            </CardTitle>
            <CardDescription className="text-gray-300">
              High-priority actions to unlock transformative GenAI potential in your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              {getCriticalImperatives().slice(0, 6).map((rec: Recommendation, index) => (
                <div key={rec.id} className="flex items-start space-x-4 p-4 bg-red-950/10 border border-red-900">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-red-400 mb-2">{rec.title}</h4>
                    <p className="text-gray-300 mb-3">{rec.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">Timeline: {rec.implementation_timeline}</span>
                      {rec.expected_impact && (
                        <span className="text-green-400">Impact: {rec.expected_impact}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations by Category */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-7 bg-zinc-800 border border-gray-700">
          {categories.map((category) => (
            <TabsTrigger
              key={category.key}
              value={category.key}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.key} value={category.key} className="mt-8">
            <Card className="neo-kyoto-card">
              <CardHeader>
                <CardTitle className="text-xl text-blue-400 font-serif">
                  {category.label}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getFilteredRecommendations().map((rec: Recommendation) => (
                    <div key={rec.id} className="p-6 border border-gray-700 bg-zinc-800/50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-blue-400">{rec.title}</h3>
                          {rec.is_critical_imperative && (
                            <Badge variant="destructive" className="text-xs">
                              CRITICAL
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className={getPriorityColor(rec.priority_level)}>
                          {getPriorityLabel(rec.priority_level)} Priority
                        </Badge>
                      </div>
                      
                      <p className="text-gray-300 leading-relaxed mb-4">{rec.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {rec.expected_impact && (
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-gray-400">Expected Impact</span>
                            <p className="text-green-400">{rec.expected_impact}</p>
                          </div>
                        )}
                        {rec.implementation_timeline && (
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-gray-400">Implementation Timeline</span>
                            <p className="text-blue-400">{rec.implementation_timeline}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action Plan Summary */}
      <Card className="neo-kyoto-card">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400 font-serif">
            90-Day Action Plan Summary
          </CardTitle>
          <CardDescription className="text-gray-300">
            Prioritized roadmap for immediate GenAI transformation initiatives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-400">Phase 1: Foundation (Days 1-30)</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Establish GenAI COE
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Define use case portfolio
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Performance metrics framework
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-yellow-400">Phase 2: Implementation (Days 31-60)</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  Launch upskilling programs
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  Deploy AI ethics framework
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  Begin pilot implementations
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-400">Phase 3: Scaling (Days 61-90)</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Data foundation enhancement
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Scale successful pilots
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Measure and optimize impact
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
