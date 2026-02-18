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
  username: z.string().optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content must be less than 2000 characters"),
  webhookUrl: z.string().min(1, "Webhook is required"),
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<DiscordFormValues>;
}

export const DiscordDialog = ({
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
      username: defaultValues.username || "",
    },
  });

  // Reset form value when dialog opens with new default values
  useEffect(() => {
    if (open) {
      form.reset({
        variablesName: defaultValues.variablesName || "",
        content: defaultValues.content || "",
        webhookUrl: defaultValues.webhookUrl || "",
        username: defaultValues.username || "",
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
          <DialogTitle> Discord </DialogTitle>
          <DialogDescription>Configure setting for Discord</DialogDescription>
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
                      placeholder="https://discord.com/api/webhooks/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Get this from Discord : Channel Settings → Integrations →
                    Webhooks
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

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Bot username (Optional) </FormLabel>
                  <FormControl>
                    <Input placeholder="Workflow Bot" {...field} />
                  </FormControl>
                  <FormDescription>
                    Override the webhook's default username
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
