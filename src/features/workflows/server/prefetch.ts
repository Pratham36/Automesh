import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.workflows.getMany>;

// Prefetch all workflows data on the server

export const prefetchWorkflows = (params: Input) => {
  return prefetch(trpc.workflows.getMany.queryOptions(params));
};

// Prefetch a single workflow data on the server

export const prefetchWorkflow = (id: string) => {
  return prefetch(trpc.workflows.getOne.queryOptions({ id }));
};
