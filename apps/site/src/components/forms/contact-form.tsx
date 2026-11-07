"use client";

import { zodResolver } from "@repo/ui/lib/hookform-resolvers-zod";
import { ArrowRight, Loader2 } from "@repo/ui/icons";
import { startTransition, useOptimistic, useState } from "react";
import { useForm } from "@repo/ui/lib/react-hook-form";
import { toast } from "@repo/ui/components/sonner";
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
import { submitContactForm } from "@/app/actions/contact";
import { contactFormSchema, type ContactForm } from "@/models/contact";
import { type ContactFormProps, type ContactSubmitResult } from "@repo/validation/contact";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Mail, MessageCircle } from "@repo/ui/icons";

const defaultValues: ContactForm = {
  name: "",
  email: "",
  phone: "",
  childAge: "",
  club: "",
  message: "",
  contactMethod: "email",
};

export function ContactForm(props: ContactFormProps) {
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  const [result, setResult] = useState<ContactSubmitResult | null>(null);
  const [submitResult, addOptimistic] = useOptimistic<
    ContactSubmitResult | null,
    ContactSubmitResult
  >(result, (_current, optimistic) => optimistic);

  const isSubmitting = form.formState.isSubmitting;
  const contactMethod = form.watch("contactMethod");

  const router = useRouter();

  const onSubmit = async (data: ContactForm) => {
    const optimisticResult: ContactSubmitResult = {
      success: true,
      message: props.successMessage,
      payload: data,
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
          for (const [field, messages] of Object.entries(serverResult.details)) {
            const msg = Array.isArray(messages) ? messages[0] : messages;
            if (msg) form.setError(field as keyof ContactForm, { message: msg });
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
      const message = error instanceof Error ? error.message : props.errorMessage;
      const err: ContactSubmitResult = {
        success: false,
        message,
        error: message,
      };
      setResult(err);
      toast.error(props.errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        aria-busy={isSubmitting}
      >
        <FormField
          control={form.control}
          name="contactMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email" className="gap-2">
                      <Mail className="size-4" />
                      {props.methodEmailLabel}
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="gap-2">
                      <MessageCircle className="size-4" />
                      {props.methodWhatsappLabel}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{props.nameLabel}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={props.namePlaceholder}
                    className="bg-background"
                    disabled={isSubmitting}
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
                    type="email"
                    placeholder={props.emailPlaceholder}
                    className="bg-background"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{props.phoneLabel}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder={props.phonePlaceholder}
                    className="bg-background"
                    disabled={isSubmitting}
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
                    placeholder={props.agePlaceholder}
                    className="bg-background"
                    disabled={isSubmitting}
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
                  placeholder={props.clubPlaceholder}
                  className="bg-background"
                  disabled={isSubmitting}
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
                  rows={4}
                  placeholder={props.messagePlaceholder}
                  className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm disabled:opacity-50"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitResult?.success && (
          <p className="text-sm text-green-600 dark:text-green-400" role="status">
            {submitResult.message}
          </p>
        )}

        <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              {props.submittingButton}
              <Loader2 className="size-4 animate-spin" />
            </>
          ) : (
            <>
              {contactMethod === "whatsapp" ? (
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
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
