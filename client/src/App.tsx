
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssessmentModule } from '@/components/AssessmentModule';
import { BusinessQueryModule } from '@/components/BusinessQueryModule';
import { RecommendationsModule } from '@/components/RecommendationsModule';
import { ResourceHub } from '@/components/ResourceHub';
import { AssessmentResults } from '@/components/AssessmentResults';
import { trpc } from '@/utils/trpc';
import type { Assessment, AssessmentResults as AssessmentResultsType } from '../../server/src/schema';

function App() {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResultsType | null>(null);
  const [activeTab, setActiveTab] = useState('assessment');

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedAssessment = localStorage.getItem('gcc-assessment');
    const savedResults = localStorage.getItem('gcc-assessment-results');
    
    if (savedAssessment) {
      setCurrentAssessment(JSON.parse(savedAssessment));
    }
    if (savedResults) {
      setAssessmentResults(JSON.parse(savedResults));
    }
  }, []);

  const handleAssessmentCreated = useCallback((assessment: Assessment) => {
    setCurrentAssessment(assessment);
    localStorage.setItem('gcc-assessment', JSON.stringify(assessment));
  }, []);

  const handleAssessmentCompleted = useCallback(async (assessmentId: number) => {
    try {
      const results = await trpc.getAssessmentResults.query({ assessmentId });
      setAssessmentResults(results);
      localStorage.setItem('gcc-assessment-results', JSON.stringify(results));
      setActiveTab('results');
    } catch (error) {
      console.error('Failed to load assessment results:', error);
    }
  }, []);

  const resetAssessment = useCallback(() => {
    setCurrentAssessment(null);
    setAssessmentResults(null);
    localStorage.removeItem('gcc-assessment');
    localStorage.removeItem('gcc-assessment-results');
    setActiveTab('assessment');
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 font-mono">
      {/* Header */}
      <header className="border-b border-gray-700 bg-zinc-900">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-400 font-serif">
                GCC GenAI Transformation Navigator
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                GenAI Maturity Assessment & Strategic Transformation Platform
              </p>
            </div>
            {currentAssessment && (
              <div className="text-right">
                <p className="text-sm text-gray-300">{currentAssessment.gcc_name}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAssessment}
                  className="mt-2 border-gray-600 text-gray-300 hover:bg-zinc-800"
                >
                  Start New Assessment
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!currentAssessment ? (
          // Welcome screen with assessment creation
          <div className="max-w-4xl mx-auto">
            <Card className="bg-zinc-800 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-serif text-blue-400 mb-4">
                  Transform Your GCC with GenAI Intelligence
                </CardTitle>
                <CardDescription className="text-lg text-gray-300 leading-relaxed">
                  Navigate your organization's GenAI transformation journey with our comprehensive 
                  maturity assessment framework. Discover your current position across seven critical 
                  dimensions and unlock personalized strategic recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-400">Assessment Framework</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 mr-3"></span>
                        Strategy Alignment
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 mr-3"></span>
                        Talent & Capabilities
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 mr-3"></span>
                        Operating Model
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 mr-3"></span>
                        Technology Infrastructure
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 mr-3"></span>
                        Data Readiness
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 mr-3"></span>
                        Adoption & Scaling
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 mr-3"></span>
                        AI Trust & Governance
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-blue-400">Transformation Outcomes</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 mr-3"></span>
                        Archetype Classification
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 mr-3"></span>
                        Maturity Benchmarking
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 mr-3"></span>
                        Strategic Recommendations
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 mr-3"></span>
                        90-Day Action Plan
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 mr-3"></span>
                        Custom Business Solutions
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 mr-3"></span>
                        Resource Library Access
                      </li>
                    </ul>
                  </div>
                </div>
                <AssessmentModule onAssessmentCreated={handleAssessmentCreated} />
              </CardContent>
            </Card>
          </div>
        ) : (
          // Main navigation tabs after assessment creation
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-zinc-800 border border-gray-700">
              <TabsTrigger 
                value="assessment" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Assessment
              </TabsTrigger>
              <TabsTrigger 
                value="business-query" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Business Query
              </TabsTrigger>
              <TabsTrigger 
                value="recommendations" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Recommendations
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                disabled={!assessmentResults}
              >
                Results
              </TabsTrigger>
              <TabsTrigger 
                value="resources" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assessment" className="mt-8">
              <AssessmentModule 
                onAssessmentCreated={handleAssessmentCreated}
                onAssessmentCompleted={handleAssessmentCompleted}
                currentAssessment={currentAssessment}
              />
            </TabsContent>

            <TabsContent value="business-query" className="mt-8">
              <BusinessQueryModule assessmentId={currentAssessment.id} />
            </TabsContent>

            <TabsContent value="recommendations" className="mt-8">
              <RecommendationsModule assessmentId={currentAssessment.id} />
            </TabsContent>

            <TabsContent value="results" className="mt-8">
              {assessmentResults ? (
                <AssessmentResults results={assessmentResults} />
              ) : (
                <Card className="bg-zinc-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">
                      Complete your assessment to view comprehensive results and insights.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resources" className="mt-8">
              <ResourceHub archetype={assessmentResults?.assessment.archetype || undefined} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-zinc-900 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p className="text-sm">
              © 2024 GCC GenAI Transformation Navigator. Empowering intelligent transformation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
