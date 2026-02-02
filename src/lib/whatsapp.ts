import { env } from "@/env";

interface WhatsAppMessage {
  to: string;
  template: string;
  language?: string;
  components?: WhatsAppComponent[];
}

interface WhatsAppComponent {
  type: "header" | "body" | "button";
  parameters: WhatsAppParameter[];
}

interface WhatsAppParameter {
  type: "text" | "image" | "document" | "video";
  text?: string;
  image?: { link: string };
}

interface WhatsAppTextMessage {
  to: string;
  message: string;
}

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";

export class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = env.WHATSAPP_ACCESS_TOKEN;
  }

  private async sendRequest(endpoint: string, body: object): Promise<WhatsAppResponse> {
    const response = await fetch(`${WHATSAPP_API_URL}/${this.phoneNumberId}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`WhatsApp API Error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Send a template message (pre-approved message templates)
   */
  async sendTemplate(options: WhatsAppMessage): Promise<WhatsAppResponse> {
    const body = {
      messaging_product: "whatsapp",
      to: this.formatPhoneNumber(options.to),
      type: "template",
      template: {
        name: options.template,
        language: {
          code: options.language || "pt_PT",
        },
        components: options.components || [],
      },
    };

    return this.sendRequest("messages", body);
  }

  /**
   * Send a text message (for replying within 24-hour window)
   */
  async sendTextMessage(options: WhatsAppTextMessage): Promise<WhatsAppResponse> {
    const body = {
      messaging_product: "whatsapp",
      to: this.formatPhoneNumber(options.to),
      type: "text",
      text: {
        preview_url: false,
        body: options.message,
      },
    };

    return this.sendRequest("messages", body);
  }

  /**
   * Format phone number to international format (remove spaces, ensure + prefix)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let formatted = phone.replace(/[^\d+]/g, "");

    // If it doesn't start with +, assume Portuguese number
    if (!formatted.startsWith("+")) {
      // If it starts with 00, replace with +
      if (formatted.startsWith("00")) {
        formatted = `+${formatted.slice(2)}`;
      }
      // If it starts with country code 351, add +
      else if (formatted.startsWith("351")) {
        formatted = `+${formatted}`;
      }
      // Otherwise, assume Portuguese number and add +351
      else {
        formatted = `+351${formatted}`;
      }
    }

    return formatted;
  }
}

export const whatsapp = new WhatsAppClient();
