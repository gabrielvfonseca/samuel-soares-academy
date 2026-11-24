import { describe, expect, it } from "vitest";
import {
  contactFormPropsSchema,
  contactInfoFallbacksSchema,
  contactSubmitResultSchema,
} from "./contact";
import { localeSchema } from "./locale";

describe("localeSchema", () => {
  it("accepts the supported locales", () => {
    expect(localeSchema.parse("pt")).toBe("pt");
    expect(localeSchema.parse("en")).toBe("en");
  });

  it("rejects unsupported locales", () => {
    expect(localeSchema.safeParse("fr").success).toBe(false);
    expect(localeSchema.safeParse("").success).toBe(false);
  });
});

describe("contactInfoFallbacksSchema", () => {
  it("accepts a complete fallback object", () => {
    const data = contactInfoFallbacksSchema.parse({
      address: "Rua X",
      email: "geral@samuelsoares.academy",
      facebook: "https://facebook.com/x",
      facebookHandle: "samuelsoares",
      instagram: "https://instagram.com/x",
      instagramHandle: "samuelsoares",
      phone: "+351900000000",
      schedule: "Mon-Fri 9h-21h",
    });
    expect(data.email).toBe("geral@samuelsoares.academy");
  });

  it("rejects a missing field", () => {
    const result = contactInfoFallbacksSchema.safeParse({
      address: "Rua X",
      // phone missing
    });
    expect(result.success).toBe(false);
  });
});

describe("contactFormPropsSchema", () => {
  const valid = {
    ageLabel: "Idade",
    agePlaceholder: "Ex: 12",
    clubLabel: "Clube",
    clubPlaceholder: "Nome do clube",
    description: "Envia a sua mensagem",
    emailLabel: "Email",
    emailPlaceholder: "voce@exemplo.com",
    errorMessage: "Algo correu mal",
    messageLabel: "Mensagem",
    messagePlaceholder: "Escreva a sua mensagem",
    methodEmailLabel: "Por email",
    methodWhatsappLabel: "Por WhatsApp",
    nameLabel: "Nome",
    namePlaceholder: "O seu nome",
    phoneLabel: "Telefone",
    phonePlaceholder: "+351 ...",
    submitButton: "Enviar",
    submitEmailButton: "Enviar por email",
    submittingButton: "A enviar...",
    submitWhatsappButton: "Enviar por WhatsApp",
    successMessage: "Mensagem enviada",
    title: "Contacte-nos",
  };

  it("accepts a complete form-props object (without lang)", () => {
    expect(contactFormPropsSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an optional valid lang", () => {
    expect(
      contactFormPropsSchema.safeParse({ ...valid, lang: "pt" }).success
    ).toBe(true);
  });

  it("rejects an invalid lang", () => {
    expect(
      contactFormPropsSchema.safeParse({ ...valid, lang: "fr" }).success
    ).toBe(false);
  });

  it("accepts an optional whatsappPhone", () => {
    expect(
      contactFormPropsSchema.safeParse({
        ...valid,
        whatsappPhone: "+351912345678",
      }).success
    ).toBe(true);
  });
});

describe("contactSubmitResultSchema", () => {
  it("accepts a successful result with a message", () => {
    const result = contactSubmitResultSchema.parse({
      message: "Mensagem enviada",
      success: true,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an error result", () => {
    const result = contactSubmitResultSchema.parse({
      error: "Falha de rede",
      message: "Erro",
      success: false,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Falha de rede");
  });

  it("accepts an optional whatsappUrl", () => {
    const result = contactSubmitResultSchema.parse({
      message: "OK",
      success: true,
      whatsappUrl: "https://wa.me/351912345678",
    });
    expect(result.whatsappUrl).toBe("https://wa.me/351912345678");
  });

  it("rejects a result missing the required message", () => {
    const result = contactSubmitResultSchema.safeParse({ success: true });
    expect(result.success).toBe(false);
  });
});
