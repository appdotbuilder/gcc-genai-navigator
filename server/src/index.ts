
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createAssessmentInputSchema, 
  submitAssessmentResponsesInputSchema,
  createBusinessQueryInputSchema
} from './schema';

// Import handlers
import { createAssessment } from './handlers/create_assessment';
import { getAssessmentQuestions } from './handlers/get_assessment_questions';
import { submitAssessmentResponses } from './handlers/submit_assessment_responses';
import { createBusinessQuery } from './handlers/create_business_query';
import { generateRecommendations } from './handlers/generate_recommendations';
import { getAssessmentResults } from './handlers/get_assessment_results';
import { getResources } from './handlers/get_resources';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Assessment management
  createAssessment: publicProcedure
    .input(createAssessmentInputSchema)
    .mutation(({ input }) => createAssessment(input)),

  getAssessmentQuestions: publicProcedure
    .query(() => getAssessmentQuestions()),

  submitAssessmentResponses: publicProcedure
    .input(submitAssessmentResponsesInputSchema)
    .mutation(({ input }) => submitAssessmentResponses(input)),

  getAssessmentResults: publicProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(({ input }) => getAssessmentResults(input.assessmentId)),

  // Business queries
  createBusinessQuery: publicProcedure
    .input(createBusinessQueryInputSchema)
    .mutation(({ input }) => createBusinessQuery(input)),

  // Recommendations
  generateRecommendations: publicProcedure
    .input(z.object({ assessmentId: z.number() }))
    .mutation(({ input }) => generateRecommendations(input.assessmentId)),

  // Resource hub
  getResources: publicProcedure
    .input(z.object({ 
      archetype: z.string().optional(), 
      dimension: z.string().optional() 
    }))
    .query(({ input }) => getResources(input.archetype, input.dimension)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
