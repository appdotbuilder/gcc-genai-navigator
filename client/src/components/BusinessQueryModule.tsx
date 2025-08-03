
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import type { BusinessQuery, CreateBusinessQueryInput } from '../../../server/src/schema';

interface BusinessQueryModuleProps {
  assessmentId: number;
}

type BusinessFunction = 'finance' | 'hr' | 'operations' | 'technology' | 'marketing' | 'customer_service' | 'procurement' | 'risk_management';

export function BusinessQueryModule({ assessmentId }: BusinessQueryModuleProps) {
  const [queries, setQueries] = useState<BusinessQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateBusinessQueryInput>({
    assessment_id: assessmentId,
    query_text: '',
    target_function: 'operations'
  });

  const businessFunctions = [
    { value: 'finance' as BusinessFunction, label: 'Finance', description: 'Cost optimization, financial planning, reporting' },
    { value: 'hr' as BusinessFunction, label: 'Human Resources', description: 'Talent management, recruitment, employee experience' },
    { value: 'operations' as BusinessFunction, label: 'Operations', description: 'Process efficiency, automation, quality management' },
    { value: 'technology' as BusinessFunction, label: 'Technology', description: 'IT infrastructure, software development, digital transformation' },
    { value: 'marketing' as BusinessFunction, label: 'Marketing', description: 'Customer acquisition, brand management, digital marketing' },
    { value: 'customer_service' as BusinessFunction, label: 'Customer Service', description: 'Support optimization, customer experience, retention' },
    { value: 'procurement' as BusinessFunction, label: 'Procurement', description: 'Supply chain, vendor management, cost savings' },
    { value: 'risk_management' as BusinessFunction, label: 'Risk Management', description: 'Compliance, security, governance, risk mitigation' }
  ];

  const sampleQueries = [
    { function: 'finance' as BusinessFunction, query: 'How can we reduce operational costs by 15% while maintaining service quality?' },
    { function: 'hr' as BusinessFunction, query: 'What strategies can help us reduce attrition rate and improve employee engagement?' },
    { function: 'operations' as BusinessFunction, query: 'How can we automate repetitive processes to increase productivity?' },
    { function: 'technology' as BusinessFunction, query: 'What GenAI tools can accelerate our software development lifecycle?' },
    { function: 'customer_service' as BusinessFunction, query: 'How can we improve customer satisfaction scores through GenAI?' }
  ];

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newQuery = await trpc.createBusinessQuery.mutate(formData);
      setQueries((prev: BusinessQuery[]) => [...prev, newQuery]);
      setFormData((prev: CreateBusinessQueryInput) => ({
        ...prev,
        query_text: ''
      }));
    } catch (error) {
      console.error('Failed to submit business query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleQuery = useCallback((query: string, targetFunction: BusinessFunction) => {
    setFormData((prev: CreateBusinessQueryInput) => ({
      ...prev,
      query_text: query,
      target_function: targetFunction
    }));
  }, []);

  const getFunctionDetails = (functionKey: string) => {
    return businessFunctions.find(f => f.value === functionKey);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-serif text-blue-400 mb-4">
          Business Query & Diagnostic Module
        </h2>
        <p className="text-gray-300 leading-relaxed">
          Input specific business challenges and receive targeted GenAI-driven solutions 
          mapped to your functional requirements and transformation goals.
        </p>
      </div>

      {/* Query Submission Form */}
      <Card className="neo-kyoto-card">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400 font-serif">
            Submit Business Challenge
          </CardTitle>
          <CardDescription className="text-gray-300">
            Describe your specific business challenge and select the primary function it impacts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitQuery} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target_function" className="text-gray-200">
                Primary Business Function
              </Label>
              <Select
                value={formData.target_function || 'operations'}
                onValueChange={(value: string) =>
                  setFormData((prev: CreateBusinessQueryInput) => ({ ...prev, target_function: value as BusinessFunction }))
                }
              >
                <SelectTrigger className="neo-kyoto-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-gray-600">
                  {businessFunctions.map((func) => (
                    <SelectItem key={func.value} value={func.value} className="text-gray-100">
                      <div>
                        <div className="font-medium">{func.label}</div>
                        <div className="text-sm text-gray-400">{func.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="query_text" className="text-gray-200">
                Business Challenge Description
              </Label>
              <Textarea
                id="query_text"
                value={formData.query_text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateBusinessQueryInput) => ({ ...prev, query_text: e.target.value }))
                }
                className="neo-kyoto-input min-h-[120px]"
                placeholder="Describe your specific business challenge or opportunity..."
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full neo-kyoto-button"
            >
              {isLoading ? 'Analyzing Challenge...' : 'Submit Business Query'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sample Queries */}
      <Card className="neo-kyoto-card">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400 font-serif">
            Sample Business Challenges
          </CardTitle>
          <CardDescription className="text-gray-300">
            Click on any sample query to populate the form and customize as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {sampleQueries.map((sample, index) => {
              const functionDetails = getFunctionDetails(sample.function);
              return (
                <div
                  key={index}
                  className="p-4 border border-gray-700 hover:border-blue-500 cursor-pointer transition-colors bg-zinc-800/50"
                  onClick={() => handleSampleQuery(sample.query, sample.function)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2 text-blue-400 border-blue-400">
                        {functionDetails?.label}
                      </Badge>
                      <p className="text-gray-300">{sample.query}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-950">
                      Use Template
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submitted Queries */}
      {queries.length > 0 && (
        <Card className="neo-kyoto-card">
          <CardHeader>
            <CardTitle className="text-xl text-blue-400 font-serif">
              Your Business Queries
            </CardTitle>
            <CardDescription className="text-gray-300">
              Track your submitted business challenges and their diagnostic status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queries.map((query: BusinessQuery) => {
                const functionDetails = getFunctionDetails(query.target_function);
                return (
                  <div key={query.id} className="p-4 border border-gray-700 bg-zinc-800/50">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {functionDetails?.label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {query.created_at.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{query.query_text}</p>
                    <div className="mt-3 flex items-center text-sm text-yellow-400">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      Diagnostic analysis in progress
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* GenAI Value Potential Overview */}
      <Card className="neo-kyoto-card">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400 font-serif">
            GenAI Value Potential by Function
          </CardTitle>
          <CardDescription className="text-gray-300">
            Understand the transformation opportunities across different business functions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {businessFunctions.map((func) => (
              <div key={func.value} className="p-4 border border-gray-700 bg-zinc-800/30">
                <h4 className="font-semibold text-blue-400 mb-2">{func.label}</h4>
                <p className="text-sm text-gray-300 mb-3">{func.description}</p>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Automation Potential:</span>
                    <span className="text-green-400">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Implementation Complexity:</span>
                    <span className="text-yellow-400">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI Timeline:</span>
                    <span className="text-blue-400">6-12 months</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
