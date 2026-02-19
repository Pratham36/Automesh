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
  content: z
    .string()
    .min(1, "Content is required")
    .max(4096, "Content must be less than 4096 characters"),
  botToken: z.string().min(1, "Bot token is required"),
  chatId: z.string().min(1, "Chat ID is required"),
});

export type TelegramFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<TelegramFormValues>;
}

export const TelegramDialog = ({
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
      botToken: defaultValues.botToken || "",
      chatId: defaultValues.chatId || "",
    },
  });

  // Reset form value when dialog opens with new default values
  useEffect(() => {
    if (open) {
      form.reset({
        variablesName: defaultValues.variablesName || "",
        content: defaultValues.content || "",
        botToken: defaultValues.botToken || "",
        chatId: defaultValues.chatId || "",
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
          <DialogTitle> Telegram </DialogTitle>
          <DialogDescription>Configure settings for Telegram</DialogDescription>
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
              name="botToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Bot Token </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Get this from BotFather on Telegram. Create a bot and copy its token.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Chat ID </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="-1001234567890 or @channelusername"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The chat ID where messages should be sent. Can be a private chat, group, or channel.
                  </FormDescription>
                  <FormDescription>
                    <ol className="list-decimal pl-6 leading-relaxed">
                      <li>
                        To get your chat ID, send a message to <strong>@userinfobot</strong> on Telegram.
                      </li>
                      <li>
                        For channels, use the channel username (e.g., @yourchannel) or the numeric ID.
                      </li>
                      <li>
                        For groups, use the numeric group ID (usually starts with -100).
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
                    The message to send. Use{"{{variables}}"} for simple values
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
