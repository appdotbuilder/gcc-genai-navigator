
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/utils/trpc';
import type { Resource } from '../../../server/src/schema';

interface ResourceHubProps {
  archetype?: string;
}

export function ResourceHub({ archetype }: ResourceHubProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<string>(archetype || 'all');
  const [selectedDimension, setSelectedDimension] = useState<string>('all');

  const archetypes = [
    { value: 'all', label: 'All Archetypes' },
    { value: 'leaders', label: 'Leaders' },
    { value: 'progressors', label: 'Progressors' },
    { value: 'emergents', label: 'Emergents' },
    { value: 'laggards', label: 'Laggards' }
  ];

  const dimensions = [
    { value: 'all', label: 'All Dimensions' },
    { value: 'strategy', label: 'Strategy Alignment' },
    { value: 'talent', label: 'Talent & Capabilities' },
    { value: 'operating_model', label: 'Operating Model' },
    { value: 'technology', label: 'Technology Infrastructure' },
    { value: 'data', label: 'Data Readiness' },
    { value: 'adoption_scaling', label: 'Adoption & Scaling' },
    { value: 'ai_trust', label: 'AI Trust & Governance' }
  ];

  const loadResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const archetypeParam = selectedArchetype === 'all' ? undefined : selectedArchetype;
      const dimensionParam = selectedDimension === 'all' ? undefined : selectedDimension;
      
      // Call the API but don't use the response since it's a placeholder
      await trpc.getResources.query({
        archetype: archetypeParam,
        dimension: dimensionParam
      });
      
      // Since the handler is a placeholder, we'll provide sample resources
      const sampleResources: Resource[] = [
        {
          id: 1,
          title: 'GenAI Strategy Framework for GCCs',
          description: 'Comprehensive framework for developing and implementing GenAI strategy in Global Capability Centers, including strategic alignment, roadmap development, and success metrics.',
          content_type: 'framework',
          target_archetype: 'emergents',
          target_dimension: 'strategy',
          content_url: '/resources/genai-strategy-framework.pdf',
          created_at: new Date()
        },
        {
          id: 2,
          title: 'Leading GCC GenAI Transformation Case Study',
          description: 'Detailed case study of a Fortune 500 company\'s GCC that achieved 40% productivity improvement through strategic GenAI implementation across finance and operations.',
          content_type: 'case_study',
          target_archetype: 'leaders',
          target_dimension: 'adoption_scaling',
          content_url: '/resources/leading-gcc-case-study.pdf',
          created_at: new Date()
        },
        {
          id: 3,
          title: 'GenAI Talent Development Best Practices',
          description: 'Best practices for building GenAI capabilities in your workforce, including upskilling programs, competency frameworks, and change management strategies.',
          content_type: 'best_practice',
          target_archetype: null,
          target_dimension: 'talent',
          content_url: '/resources/talent-development-guide.pdf',
          created_at: new Date()
        },
        {
          id: 4,
          title: 'AI Ethics and Governance Implementation Guide',
          description: 'Practical guide for implementing AI ethics frameworks, governance structures, and risk management processes for responsible GenAI deployment.',
          content_type: 'framework',
          target_archetype: 'progressors',
          target_dimension: 'ai_trust',
          content_url: '/resources/ai-ethics-guide.pdf',
          created_at: new Date()
        },
        {
          id: 5,
          title: 'Data Foundation for GenAI Success',
          description: 'Technical insights on building robust data foundations to support GenAI initiatives, including data quality, governance, and infrastructure requirements.',
          content_type: 'insight',
          target_archetype: null,
          target_dimension: 'data',
          content_url: '/resources/data-foundation-insights.pdf',
          created_at: new Date()
        },
        {
          id: 6,
          title: 'GenAI ROI Measurement Framework',
          description: 'Framework for measuring and demonstrating the return on investment of GenAI initiatives, including key metrics, measurement approaches, and reporting templates.',
          content_type: 'framework',
          target_archetype: 'emergents',
          target_dimension: 'ai_trust',
          content_url: '/resources/roi-measurement-framework.pdf',
          created_at: new Date()
        }
      ];
      
      setResources(sampleResources);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedArchetype, selectedDimension]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const getContentTypeInfo = (contentType: string) => {
    switch (contentType) {
      case 'case_study':
        return { label: 'Case Study', color: 'text-green-400 border-green-400', icon: '📊' };
      case 'best_practice':
        return { label: 'Best Practice', color: 'text-blue-400 border-blue-400', icon: '✨' };
      case 'insight':
        return { label: 'Insight', color: 'text-purple-400 border-purple-400', icon: '💡' };
      case 'framework':
        return { label: 'Framework', color: 'text-orange-400 border-orange-400', icon: '🏗️' };
      default:
        return { label: 'Resource', color: 'text-gray-400 border-gray-400', icon: '📄' };
    }
  };

  const getArchetypeColor = (archetype: string | null) => {
    switch (archetype) {
      case 'leaders': return 'text-green-400 border-green-400';
      case 'progressors': return 'text-blue-400 border-blue-400';
      case 'emergents': return 'text-yellow-400 border-yellow-400';
      case 'laggards': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-serif text-blue-400 mb-4">
          GenAI Resource Hub
        </h2>
        <p className="text-gray-300 leading-relaxed">
          Curated library of insights, case studies, and best practices from leading GCCs 
          to accelerate your GenAI transformation journey.
        </p>
      </div>

      {/* Filters */}
      <Card className="neo-kyoto-card">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400 font-serif">
            Resource Filters
          </CardTitle>
          <CardDescription className="text-gray-300">
            Filter resources by archetype and dimension to find the most relevant content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">GCC Archetype</label>
              <Select value={selectedArchetype} onValueChange={setSelectedArchetype}>
                <SelectTrigger className="neo-kyoto-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-gray-600">
                  {archetypes.map((archetype) => (
                    <SelectItem key={archetype.value} value={archetype.value} className="text-gray-100">
                      {archetype.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Maturity Dimension</label>
              <Select value={selectedDimension} onValueChange={setSelectedDimension}>
                <SelectTrigger className="neo-kyoto-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-gray-600">
                  {dimensions.map((dimension) => (
                    <SelectItem key={dimension.value} value={dimension.value} className="text-gray-100">
                      {dimension.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {isLoading ? (
        <Card className="neo-kyoto-card">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Loading resources...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {resources.length === 0 ? (
            <Card className="neo-kyoto-card">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">
                  No resources found for the selected filters. Try adjusting your selection.
                </p>
              </CardContent>
            </Card>
          ) : (
            resources.map((resource: Resource) => {
              const contentTypeInfo = getContentTypeInfo(resource.content_type);
              return (
                <Card key={resource.id} className="neo-kyoto-card hover:border-blue-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{contentTypeInfo.icon}</span>
                          <Badge variant="outline" className={contentTypeInfo.color}>
                            {contentTypeInfo.label}
                          </Badge>
                          {resource.target_archetype && (
                            <Badge variant="outline" className={getArchetypeColor(resource.target_archetype)}>
                              {resource.target_archetype}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl text-blue-400 font-serif">
                          {resource.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 leading-relaxed mb-4">
                      {resource.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {resource.target_dimension && (
                          <span className="text-sm text-gray-400">
                            Focus: {dimensions.find(d => d.value === resource.target_dimension)?.label}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {resource.created_at.toLocaleDateString()}
                        </span>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-blue-400 text-blue-400 hover:bg-blue-950"
                        onClick={() => {
                          // In a real implementation, this would download or open the resource
                          console.log('Opening resource:', resource.content_url);
                        }}
                      >
                        Access Resource
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Featured Resources */}
      <Card className="neo-kyoto-card border-blue-400">
        <CardHeader className="bg-blue-950/20">
          <CardTitle className="text-xl text-blue-400 font-serif">
            🌟 Featured: GenAI Value Potential Matrix
          </CardTitle>
          <CardDescription className="text-gray-300">
            Comprehensive mapping of GenAI opportunities across business functions and use cases.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-400">High-Impact Functions</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Finance & Accounting (35% efficiency gain)</li>
                <li>• Customer Service (50% response time reduction)</li>
                <li>• Software Development (40% code generation)</li>
                <li>• HR Operations (30% process automation)</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-yellow-400">Common Challenges</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Data quality and accessibility</li>
                <li>• Change management resistance</li>
                <li>• Skills gap and training needs</li>
                <li>• Integration with legacy systems</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-400">Success Factors</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Executive sponsorship and vision</li>
                <li>• Phased implementation approach</li>
                <li>• Continuous learning culture</li>
                <li>• Robust governance framework</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
