import { Resend } from "resend";

/** Create a Resend client. Callers own env validation and pass the key in. */
export function createMailer(apiKey: string) {
  return new Resend(apiKey);
}

export type Mailer = ReturnType<typeof createMailer>;
