
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/utils/trpc';
import type { 
  Assessment, 
  AssessmentQuestion, 
  CreateAssessmentInput,
  SubmitAssessmentResponsesInput 
} from '../../../server/src/schema';

interface AssessmentModuleProps {
  onAssessmentCreated: (assessment: Assessment) => void;
  onAssessmentCompleted?: (assessmentId: number) => void;
  currentAssessment?: Assessment | null;
}

export function AssessmentModule({ 
  onAssessmentCreated, 
  onAssessmentCompleted,
  currentAssessment 
}: AssessmentModuleProps) {
  const [step, setStep] = useState<'create' | 'questions'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [responses, setResponses] = useState<Record<number, number>>({});
  
  // Form state for assessment creation
  const [formData, setFormData] = useState<CreateAssessmentInput>({
    gcc_name: '',
    contact_email: '',
    annual_productivity_upliftment: 0,
    attrition_rate: 0,
    genai_use_cases_developed: 0
  });

  // Load questions when component mounts or when we have an assessment
  const loadQuestions = useCallback(async () => {
    try {
      const questionsData = await trpc.getAssessmentQuestions.query();
      setQuestions(questionsData);
      if (currentAssessment && questionsData.length > 0) {
        setStep('questions');
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  }, [currentAssessment]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // If we already have an assessment, show questions directly
  useEffect(() => {
    if (currentAssessment && questions.length > 0) {
      setStep('questions');
    }
  }, [currentAssessment, questions]);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const assessment = await trpc.createAssessment.mutate(formData);
      onAssessmentCreated(assessment);
      setStep('questions');
    } catch (error) {
      console.error('Failed to create assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponses = async () => {
    if (!currentAssessment) return;
    
    setIsLoading(true);
    try {
      const responseArray = Object.entries(responses).map(([questionId, value]) => ({
        question_id: parseInt(questionId),
        response_value: value
      }));

      const submitData: SubmitAssessmentResponsesInput = {
        assessment_id: currentAssessment.id,
        responses: responseArray
      };

      await trpc.submitAssessmentResponses.mutate(submitData);
      
      if (onAssessmentCompleted) {
        onAssessmentCompleted(currentAssessment.id);
      }
    } catch (error) {
      console.error('Failed to submit responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponseChange = (questionId: number, value: string) => {
    setResponses((prev: Record<number, number>) => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };

  const getCompletionPercentage = () => {
    if (questions.length === 0) return 0;
    return (Object.keys(responses).length / questions.length) * 100;
  };

  const getDimensionQuestions = (dimension: string) => {
    return questions.filter((q: AssessmentQuestion) => q.dimension === dimension);
  };

  const dimensions = [
    { key: 'strategy', label: 'Strategy Alignment', description: 'GenAI strategic alignment with business objectives' },
    { key: 'talent', label: 'Talent & Capabilities', description: 'Human resources and skill development' },
    { key: 'operating_model', label: 'Operating Model', description: 'Organizational structure and processes' },
    { key: 'technology', label: 'Technology Infrastructure', description: 'Technical foundations and capabilities' },
    { key: 'data', label: 'Data Readiness', description: 'Data quality, governance, and accessibility' },
    { key: 'adoption_scaling', label: 'Adoption & Scaling', description: 'Implementation and scale strategies' },
    { key: 'ai_trust', label: 'AI Trust & Governance', description: 'Ethics, compliance, and risk management' }
  ];

  if (step === 'create' && !currentAssessment) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="neo-kyoto-card">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-blue-400">
              Initialize Your GenAI Assessment
            </CardTitle>
            <CardDescription className="text-gray-300">
              Provide your organization's baseline metrics to begin the maturity evaluation process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAssessment} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gcc_name" className="text-gray-200">
                  GCC Organization Name
                </Label>
                <Input
                  id="gcc_name"
                  value={formData.gcc_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateAssessmentInput) => ({ ...prev, gcc_name: e.target.value }))
                  }
                  className="neo-kyoto-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-gray-200">
                  Contact Email
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateAssessmentInput) => ({ ...prev, contact_email: e.target.value }))
                  }
                  className="neo-kyoto-input"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productivity" className="text-gray-200">
                    Annual Productivity Upliftment (%)
                  </Label>
                  <Input
                    id="productivity"
                    type="number"
                    value={formData.annual_productivity_upliftment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateAssessmentInput) => ({ 
                        ...prev, 
                        annual_productivity_upliftment: parseFloat(e.target.value) || 0 
                      }))
                    }
                    className="neo-kyoto-input"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attrition" className="text-gray-200">
                    Attrition Rate (%)
                  </Label>
                  <Input
                    id="attrition"
                    type="number"
                    value={formData.attrition_rate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateAssessmentInput) => ({ 
                        ...prev, 
                        attrition_rate: parseFloat(e.target.value) || 0 
                      }))
                    }
                    className="neo-kyoto-input"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="use_cases" className="text-gray-200">
                    GenAI Use Cases Developed
                  </Label>
                  <Input
                    id="use_cases"
                    type="number"
                    value={formData.genai_use_cases_developed}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateAssessmentInput) => ({ 
                        ...prev, 
                        genai_use_cases_developed: parseInt(e.target.value) || 0 
                      }))
                    }
                    className="neo-kyoto-input"
                    min="0"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full neo-kyoto-button"
              >
                {isLoading ? 'Initializing Assessment...' : 'Begin GenAI Maturity Assessment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-serif text-blue-400">
            GenAI Maturity Assessment
          </h2>
          <div className="text-right">
            <p className="text-sm text-gray-400">
              Progress: {Object.keys(responses).length} of {questions.length} questions
            </p>
            <Progress 
              value={getCompletionPercentage()} 
              className="w-48 mt-1"
            />
          </div>
        </div>
        <p className="text-gray-300">
          Rate each statement on a scale of 1-5, where 1 = Strongly Disagree and 5 = Strongly Agree
        </p>
      </div>

      {questions.length === 0 ? (
        <Card className="neo-kyoto-card">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">
              Assessment questions are being prepared. This feature uses placeholder data in the current implementation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {dimensions.map((dimension) => {
            const dimensionQuestions = getDimensionQuestions(dimension.key);
            if (dimensionQuestions.length === 0) return null;

            return (
              <Card key={dimension.key} className="neo-kyoto-card">
                <CardHeader className="dimension-card">
                  <CardTitle className="text-xl text-blue-400 font-serif">
                    {dimension.label}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {dimension.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {dimensionQuestions.map((question: AssessmentQuestion) => (
                    <div key={question.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                      <Label className="text-gray-200 leading-relaxed block mb-3">
                        {question.question_text}
                      </Label>
                      <RadioGroup
                        value={responses[question.id]?.toString() || ''}
                        onValueChange={(value: string) => handleResponseChange(question.id, value)}
                      >
                        <div className="flex space-x-8">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <div key={value} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={value.toString()} 
                                id={`${question.id}-${value}`}
                                className="border-gray-600 text-blue-400"
                              />
                              <Label 
                                htmlFor={`${question.id}-${value}`}
                                className="text-gray-300 cursor-pointer"
                              >
                                {value}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Strongly Disagree</span>
                          <span>Strongly Agree</span>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-center pt-8">
            <Button
              onClick={handleSubmitResponses}
              disabled={isLoading || Object.keys(responses).length !== questions.length}
              className="neo-kyoto-button px-8 py-3 text-lg"
            >
              {isLoading ? 'Processing Assessment...' : 'Complete Assessment & Generate Results'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
