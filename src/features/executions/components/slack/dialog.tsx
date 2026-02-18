"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  variablesName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and can only contain letters, numbers, and underscores.",
    }),
  content: z.string().min(1, "Content is required"),
  webhookUrl: z.string().min(1, "Webhook is required"),
});

export type SlackFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<SlackFormValues>;
}

export const SlackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variablesName: defaultValues.variablesName || "",
      content: defaultValues.content || "",
      webhookUrl: defaultValues.webhookUrl || "",
    },
  });

  // Reset form value when dialog opens with new default values
  useEffect(() => {
    if (open) {
      form.reset({
        variablesName: defaultValues.variablesName || "",
        content: defaultValues.content || "",
        webhookUrl: defaultValues.webhookUrl || "",
      });
    }
  }, [open, defaultValues, form]);

  const watchVariablesName = form.watch("variablesName") || "VariableName";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Slack </DialogTitle>
          <DialogDescription>Configure setting for Slack</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 mt-4"
          >
            <FormField
              control={form.control}
              name="variablesName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="VariableName" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the result in other nodes:{""}
                    {`{{${watchVariablesName}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Webhook URL </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://slack.com/api/webhooks/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Get this from Slack : Workspace Settings → Workflow →
                    Webhooks
                  </FormDescription>
                  <FormDescription>
                    Make sure the "key" is "content"
                  </FormDescription>
                  <FormDescription>
                    <ol className="list-decimal pl-6 leading-relaxed">
                      <li>
                        Go to <strong>Slack API</strong> → click{" "}
                        <strong>Create New App</strong> → choose{" "}
                        <strong>From scratch</strong>.
                      </li>

                      <li>
                        Enter your <strong>App Name</strong> and select your{" "}
                        <strong>Workspace</strong>, then click{" "}
                        <strong>Create</strong>.
                      </li>

                      <li>
                        In the sidebar, open <strong>Features</strong> →{" "}
                        <strong>Incoming Webhooks</strong>.
                      </li>

                      <li>
                        Turn <strong>Activate Incoming Webhooks</strong> to{" "}
                        <strong>ON</strong>.
                      </li>

                      <li>
                        Click <strong>Add New Webhook to Workspace</strong>.
                      </li>

                      <li>
                        Select the <strong>Channel</strong> where messages
                        should be posted, then click <strong>Allow</strong>.
                      </li>

                      <li>
                        Copy the generated <strong>Webhook URL</strong> and use
                        it in your <strong>Application Workflow</strong>.
                      </li>
                    </ol>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Summary: {{aiResponse}}"
                      className="min-h-20 font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The message to send. Uer{"{{variables}}"} for simple values
                    or {"{{json variable}}"} to stringify JSON objects.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
