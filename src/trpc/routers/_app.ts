import { inngest } from '@/inngest/client';
import { createTRPCRouter, protectedProcedure } from '../init';
import prisma from '@/lib/db';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { TRPCError } from '@trpc/server';

export const appRouter = createTRPCRouter({
  testAI: protectedProcedure.mutation(async() =>{
    // throw new TRPCError({
    //   code : "BAD_REQUEST",message : "Something went wrong"
    // })

    await inngest.send({
      name:"execute/ai",
    });
    return {success : true, message : "Job queued"}
  }),

  getWorkflows: protectedProcedure
    .query(( { ctx } ) => {
      return prisma.workflow.findMany();
    }),
    createWorkflow : protectedProcedure.mutation(async ()=>{
      await inngest.send({
        name:"test/hello.world",
        data:{
          email:"Automesh@example.com"
        },
      });
      return prisma.workflow.create({
        data :{
          name : "test-Workflow"
        }

      })
    })
});
// export type definition of API
export type AppRouter = typeof appRouter;

