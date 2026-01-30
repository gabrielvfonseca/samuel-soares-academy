"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

interface ContactFormProps {
  title: string;
  description: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  ageLabel: string;
  agePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitButton: string;
  submittingButton: string;
  successMessage: string;
  errorMessage: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  childAge: string;
  message: string;
}

export function ContactForm(props: ContactFormProps) {
    const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    childAge: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Algo correu mal.");
      }

      toast.success(props.successMessage);
      setFormData({ name: "", email: "", phone: "", childAge: "", message: "" });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(props.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-muted-foreground mb-2">
                    {props.nameLabel}
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={props.namePlaceholder}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-muted-foreground mb-2">
                    {props.emailLabel}
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={props.emailPlaceholder}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm text-muted-foreground mb-2">
                    {props.phoneLabel}
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={props.phonePlaceholder}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label htmlFor="childAge" className="block text-sm text-muted-foreground mb-2">
                    {props.ageLabel}
                  </label>
                  <Input
                    id="childAge"
                    name="childAge"
                    type="text"
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                    value={formData.childAge}
                    onChange={handleChange}
                    placeholder={props.agePlaceholder}
                    className="bg-background"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-muted-foreground mb-2">
                  {props.messageLabel}
                </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    aria-required="true"
                    disabled={isSubmitting}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={props.messagePlaceholder}
                    className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm disabled:opacity-50"
                  />
              </div>

              <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    {props.submittingButton}
                    <Loader2 className="size-4 animate-spin" />
                  </>
                ) : (
                  <>
                    {props.submitButton}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
  );
}