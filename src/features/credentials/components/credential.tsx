"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CredentialType } from "@/generated/prisma/client";
import {
  useCreateCredential,
  useUpdateCredential,
  useSuspenseCredential,
} from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  type: z.enum(CredentialType),
});

type FormValues = z.infer<typeof formSchema>;

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    value: string;
    type: CredentialType;
  } | null;
}

const credentialTypeOptions = [
  { value: CredentialType.OPENAI, label: "OpenAI", logo: "/openai.svg" },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/anthropic.svg",
  },
  { value: CredentialType.GEMINI, label: "Gemini", logo: "/gemini.svg" },
  { value: CredentialType.GROQ, label: "Groq", logo: "/groq.svg" },
];

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();

  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();

  const isEditing = Boolean(initialData?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      value: initialData?.value ?? "",
      type: initialData?.type ?? CredentialType.OPENAI,
    },
  });

  const isLoading = useMemo(
    () => createCredential.isPending || updateCredential.isPending,
    [createCredential.isPending, updateCredential.isPending],
  );

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && initialData?.id) {
        await updateCredential.mutateAsync({
          id: initialData.id,
          ...values,
        });
        router.push(`/credentials/${initialData.id}`);
      } else {
        const data = await createCredential.mutateAsync(values);
        router.push(`/credentials/${data.id}`);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      {modal}

      <Card className="shadow-none">
        <CardHeader>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/credentials">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <CardTitle>
            {isEditing ? "Edit Credential" : "Create Credential"}
          </CardTitle>

          <CardDescription>
            {isEditing
              ? "Update your existing credential"
              : "Add a new credential to use in your workflows"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
              {/* NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My OpenAI Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* TYPE */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={16}
                                height={16}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* VALUE */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="sk-..."
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      API key for the selected provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ACTIONS */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/credentials")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isLoading}>
                  {isEditing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const credential = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credential.data} />;
};
