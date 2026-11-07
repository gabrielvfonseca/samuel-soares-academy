"use client";

import { Button } from "@repo/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { toast } from "@repo/ui/components/sonner";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ArrowRight, Loader2, Mail, MessageCircle } from "@repo/ui/icons";
import { zodResolver } from "@repo/ui/lib/hookform-resolvers-zod";
import { useForm } from "@repo/ui/lib/react-hook-form";
import type {
  ContactFormProps,
  ContactSubmitResult,
} from "@repo/validation/contact";
import { startTransition, useOptimistic, useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import {
  type ContactForm as ContactFormValues,
  contactFormSchema,
} from "@/models/contact";

const defaultValues: ContactFormValues = {
  childAge: "",
  club: "",
  contactMethod: "email",
  email: "",
  message: "",
  name: "",
  phone: "",
};

export function ContactForm(props: ContactFormProps) {
  const form = useForm<ContactFormValues>({
    defaultValues,
    resolver: zodResolver(contactFormSchema),
  });

  const [result, setResult] = useState<ContactSubmitResult | null>(null);
  const [submitResult, addOptimistic] = useOptimistic<
    ContactSubmitResult | null,
    ContactSubmitResult
  >(result, (_current, optimistic) => optimistic);

  const isSubmitting = form.formState.isSubmitting;
  const contactMethod = form.watch("contactMethod");

  const onSubmit = async (data: ContactFormValues) => {
    const optimisticResult: ContactSubmitResult = {
      message: props.successMessage,
      payload: data,
      success: true,
      whatsappUrl: "",
    };
    startTransition(() => {
      addOptimistic(optimisticResult);
    });

    try {
      const serverResult = await submitContactForm(data, props.lang);

      if (!serverResult.success) {
        setResult(serverResult);
        if (serverResult.details) {
          for (const [field, messages] of Object.entries(
            serverResult.details
          )) {
            const msg = Array.isArray(messages) ? messages[0] : messages;
            if (msg) {
              form.setError(field as keyof ContactFormValues, { message: msg });
            }
          }
        }
        toast.error(serverResult.error);
        return;
      }

      setResult(serverResult);
      toast.success(props.successMessage);
      form.reset(defaultValues);

      if (serverResult.whatsappUrl) {
        window.open(serverResult.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : props.errorMessage;
      const err: ContactSubmitResult = {
        error: message,
        message,
        success: false,
      };
      setResult(err);
      toast.error(props.errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form
        aria-busy={isSubmitting}
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="contactMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <Tabs
                  className="w-full"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger className="gap-2" value="email">
                      <Mail className="size-4" />
                      {props.methodEmailLabel}
                    </TabsTrigger>
                    <TabsTrigger className="gap-2" value="whatsapp">
                      <MessageCircle className="size-4" />
                      {props.methodWhatsappLabel}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{props.nameLabel}</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    disabled={isSubmitting}
                    placeholder={props.namePlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{props.emailLabel}</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    disabled={isSubmitting}
                    placeholder={props.emailPlaceholder}
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{props.phoneLabel}</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    disabled={isSubmitting}
                    placeholder={props.phonePlaceholder}
                    type="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="childAge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{props.ageLabel}</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background"
                    disabled={isSubmitting}
                    placeholder={props.agePlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="club"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{props.clubLabel}</FormLabel>
              <FormControl>
                <Input
                  className="bg-background"
                  disabled={isSubmitting}
                  placeholder={props.clubPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{props.messageLabel}</FormLabel>
              <FormControl>
                <textarea
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-md border px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:opacity-50 md:text-sm"
                  disabled={isSubmitting}
                  placeholder={props.messagePlaceholder}
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitResult?.success && (
          <p
            className="text-sm text-green-600 dark:text-green-400"
            role="status"
          >
            {submitResult.message}
          </p>
        )}

        <Button
          className="gap-2"
          disabled={isSubmitting}
          size="lg"
          type="submit"
        >
          {isSubmitting ? (
            <>
              {props.submittingButton}
              <Loader2 className="size-4 animate-spin" />
            </>
          ) : contactMethod === "whatsapp" ? (
            <>
              {props.submitWhatsappButton}
              <MessageCircle className="size-4" />
            </>
          ) : (
            <>
              {props.submitEmailButton}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
