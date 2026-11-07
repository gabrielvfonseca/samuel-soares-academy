import type { ContactForm } from "@/models/contact";

export const buildWhatsappMessage = (
  formData: ContactForm
): string => `*Nova Inscrição*

*Nome:* ${formData.name}
*Email:* ${formData.email}
*Telefone:* ${formData.phone}
*Idade do Atleta:* ${formData.childAge}
*Clube:* ${formData.club || "Não informado"}

*Mensagem:*
${formData.message}

----
Recebido via formulário de contacto - Samuel Soares Academy`;
