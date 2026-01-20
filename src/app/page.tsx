"use client"

import { requireAuth } from "@/lib/auth-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Page = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const testAi = useMutation(trpc.testAI.mutationOptions({
    onSuccess : () => {
      toast.success("AI Job Queued");
    },
    // onError : () => {
    //   toast.error("Something went wrong");
    // }
  }));

  const create = useMutation(trpc.createWorkflow.mutationOptions({
    onSuccess : () =>{
      queryClient.invalidateQueries(trpc.getWorkflows.queryOptions())
    }
  }))
  
   return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      Protected server component
      <div>
        {JSON.stringify(data,null , 2)}
      </div>
      <Button disabled={testAi.isPending} onClick={()=>testAi.mutate()}>
        testAi
      </Button>
      <Button disabled={create.isPending} onClick={() => create.mutate()}>
        Create WorkFlow
      </Button>
      
    </div>
  ); 
}

export default Page;