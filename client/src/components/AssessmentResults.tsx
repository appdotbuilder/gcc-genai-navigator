
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AssessmentResults as AssessmentResultsType } from '../../../server/src/schema';

interface AssessmentResultsProps {
  results: AssessmentResultsType;
}

export function AssessmentResults({ results }: AssessmentResultsProps) {
  const { assessment, responses, recommendations, business_queries } = results;

  const getArchetypeInfo = (archetype: string | null) => {
    switch (archetype) {
      case 'leaders':
        return {
          label: 'Leaders',
          description: 'Advanced GenAI adoption with strategic integration',
          color: 'text-green-400 border-green-400',
          bgColor: 'archetype-leaders'
        };
      case 'progressors':
        return {
          label: 'Progressors',
          description: 'Solid foundation with growing GenAI capabilities',
          color: 'text-blue-400 border-blue-400',
          bgColor: 'archetype-progressors'
        };
      case 'emergents':
        return {
          label: 'Emergents',
          description: 'Early-stage GenAI journey with high potential',
          color: 'text-yellow-400 border-yellow-400',
          bgColor: 'archetype-emergents'
        };
      case 'laggards':
        return {
          label: 'Laggards',
          description: 'Beginning GenAI transformation with foundational needs',
          color: 'text-red-400 border-red-400',
          bgColor: 'archetype-laggards'
        };
      default:
        return {
          label: 'Not Classified',
          description: 'Assessment pending classification',
          color: 'text-gray-400 border-gray-400',
          bgColor: ''
        };
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 4.0) return 'score-excellent';
    if (score >= 3.0) return 'score-good';
    if (score >= 2.0) return 'score-average';
    return 'score-poor';
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return 'Not Assessed';
    if (score >= 4.0) return 'Excellent';
    if (score >= 3.0) return 'Good';
    if (score >= 2.0) return 'Fair';
    return 'Needs Improvement';
  };

  const dimensions = [
    { key: 'strategy_score', label: 'Strategy Alignment', score: assessment.strategy_score },
    { key: 'talent_score', label: 'Talent & Capabilities', score: assessment.talent_score },
    { key: 'operating_model_score', label: 'Operating Model', score: assessment.operating_model_score },
    { key: 'technology_score', label: 'Technology Infrastructure', score: assessment.technology_score },
    { key: 'data_score', label: 'Data Readiness', score: assessment.data_score },
    { key: 'adoption_scaling_score', label: 'Adoption & Scaling', score: assessment.adoption_scaling_score },
    { key: 'ai_trust_score', label: 'AI Trust & Governance', score: assessment.ai_trust_score }
  ];

  const archetypeInfo = getArchetypeInfo(assessment.archetype);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header with Overall Results */}
      <div className="text-center">
        <h2 className="text-3xl font-serif text-blue-400 mb-4">
          GenAI Maturity Assessment Results
        </h2>
        <p className="text-gray-300 mb-6">
          Comprehensive analysis of {assessment.gcc_name}'s GenAI transformation readiness
        </p>
      </div>

      {/* Overall Maturity & Archetype */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="neo-kyoto-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif text-blue-400">
              Overall Maturity Score
            </CardTitle>
            <div className="text-6xl font-bold text-blue-400 my-4">
              {assessment.overall_maturity_score?.toFixed(1) || 'N/A'}
            </div>
            <CardDescription className="text-gray-300">
              Out of 5.0 maximum score
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assessment.overall_maturity_score && (
              <Progress 
                value={(assessment.overall_maturity_score / 5) * 100} 
                className="w-full h-3"
              />
            )}
          </CardContent>
        </Card>

        <Card className={`neo-kyoto-card ${archetypeInfo.bgColor}`}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif text-blue-400">
              GCC Archetype
            </CardTitle>
            <Badge variant="outline" className={`text-2xl px-4 py-2 ${archetypeInfo.color}`}>
              {archetypeInfo.label}
            </Badge>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 leading-relaxed">
              {archetypeInfo.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dimensional Analysis */}
      <Card className="neo-kyoto-card">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400 font-serif">
            Dimensional Maturity Analysis
          </CardTitle>
          <CardDescription className="text-gray-300">
            Detailed breakdown across seven critical GenAI dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {dimensions.map((dimension) => (
              <div key={dimension.key} className="flex items-center justify-between p-4 border border-gray-700 bg-zinc-800/30">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-200">{dimension.label}</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {getScoreLabel(dimension.score)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32">
                    <Progress 
                      value={dimension.score ? (dimension.score / 5) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                  <div className={`text-xl font-bold w-12 text-right ${getScoreColor(dimension.score)}`}>
                    {dimension.score?.toFixed(1) || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-800 border border-gray-700">
          <TabsTrigger value="metrics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Key Metrics
          </TabsTrigger>
          <TabsTrigger value="responses" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Assessment Responses
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="queries" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Business Queries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="mt-8">
          <Card className="neo-kyoto-card">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400 font-serif">
                Operational Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-700 bg-zinc-800/30">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {assessment.annual_productivity_upliftment}%
                  </div>
                  <p className="text-gray-300">Annual Productivity Upliftment</p>
                </div>
                <div className="text-center p-6 border border-gray-700 bg-zinc-800/30">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {assessment.attrition_rate}%
                  </div>
                  <p className="text-gray-300">Attrition Rate</p>
                </div>
                <div className="text-center p-6 border border-gray-700 bg-zinc-800/30">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {assessment.genai_use_cases_developed}
                  </div>
                  <p className="text-gray-300">GenAI Use Cases Developed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responses" className="mt-8">
          <Card className="neo-kyoto-card">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400 font-serif">
                Assessment Responses Summary
              </CardTitle>
              <CardDescription className="text-gray-300">
                {responses.length} responses recorded across all dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No responses recorded. This may indicate the assessment is still in progress.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2 text-sm text-gray-400 text-center">
                    <span>Strongly Disagree (1)</span>
                    <span>Disagree (2)</span>
                    <span>Neutral (3)</span>
                    <span>Agree (4)</span>
                    <span>Strongly Agree (5)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const count = responses.filter(r => r.response_value === value).length;
                      const percentage = (count / responses.length) * 100;
                      return (
                        <div key={value} className="text-center">
                          <div className="h-24 bg-zinc-800 border border-gray-700 flex items-end justify-center">
                            <div 
                              className="w-full bg-blue-600 flex items-end justify-center text-white text-sm font-bold"
                              style={{ height: `${percentage}%` }}
                            >
                              {count > 0 && count}
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{percentage.toFixed(0)}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-8">
          <Card className="neo-kyoto-card">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400 font-serif">
                Strategic Recommendations
              </CardTitle>
              <CardDescription className="text-gray-300">
                {recommendations.length} personalized recommendations generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No recommendations generated yet. Generate recommendations to see strategic guidance.
                </p>
              ) : (
                <div className="space-y-4">
                  {recommendations.slice(0, 5).map((rec) => (
                    <div key={rec.id} className="p-4 border border-gray-700 bg-zinc-800/30">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-blue-400">{rec.title}</h4>
                        {rec.is_critical_imperative && (
                          <Badge variant="destructive" className="text-xs">CRITICAL</Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{rec.description}</p>
                    </div>
                  ))}
                  {recommendations.length > 5 && (
                    <p className="text-center text-gray-400 text-sm">
                      And {recommendations.length - 5} more recommendations...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="mt-8">
          <Card className="neo-kyoto-card">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400 font-serif">
                Business Queries
              </CardTitle>
              <CardDescription className="text-gray-300">
                {business_queries.length} business challenges submitted for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {business_queries.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No business queries submitted yet. Use the Business Query module to input specific challenges.
                </p>
              ) : (
                <div className="space-y-4">
                  {business_queries.map((query) => (
                    <div key={query.id} className="p-4 border border-gray-700 bg-zinc-800/30">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          {query.target_function}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {query.created_at.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300">{query.query_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
