import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Font,
  Button,
} from "@react-email/components";
import { BRAND_NAME, CONTACT_INFO, SITE_URL } from "@/globals/constants";

interface SenderTemplateProps {
  readonly name: string;
}

export const SenderTemplate = ({ name }: SenderTemplateProps) => (
  <Html>
    <Head>
      <Font
        fontFamily="Inter"
        fallbackFontFamily="Arial"
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>
    <Preview>Recebemos a sua mensagem, {name}!</Preview>
    <Tailwind>
      <Body className="bg-white font-sans text-zinc-900">
        <Container className="mx-auto py-12 px-4">
          <Section className="mb-12">
            <Text className="text-sm font-bold tracking-widest uppercase text-zinc-500 mb-2">
              {BRAND_NAME}
            </Text>
            <Text className="text-4xl font-semibold tracking-tight text-zinc-900 mt-0">
              Olá, {name}! 👋
            </Text>
            <Text className="text-lg text-zinc-600 leading-relaxed mt-4">
              Obrigado por entrar em contacto com a nossa academia. Recebemos a sua mensagem e a nossa equipa irá analisar o seu pedido o mais brevemente possível.
            </Text>
          </Section>

          <Section className="rounded-xl border-2 border-zinc-900 p-8 bg-zinc-900 text-white mb-8">
            <Text className="text-xl font-medium m-0">
              O que acontece agora?
            </Text>
            <Text className="text-zinc-400 mt-4 mb-6">
              Normalmente respondemos a todos os pedidos em menos de 24 horas úteis. Fique atento ao seu email e telefone.
            </Text>
            <Button
              href={SITE_URL}
              className="bg-white text-zinc-900 px-6 py-3 rounded-lg font-semibold text-sm"
            >
              Visitar Website
            </Button>
          </Section>

          <Section className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <Text className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Telefone</Text>
              <Text className="text-sm font-medium m-0">{CONTACT_INFO.phone}</Text>
            </div>
            <div>
              <Text className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Email</Text>
              <Text className="text-sm font-medium m-0">{CONTACT_INFO.email}</Text>
            </div>
          </Section>

          <Hr className="border-zinc-200 my-8" />

          <Section className="text-zinc-500 text-xs mt-8">
            <Text className="m-0 font-medium text-zinc-900">
              {BRAND_NAME}
            </Text>
            <Text className="mt-1 m-0">
              {CONTACT_INFO.address}
            </Text>
            <Text className="mt-4 m-0">
              Se não enviou esta mensagem, por favor ignore este email.
            </Text>
            <Text className="mt-4 m-0 italic">
              © {new Date().getFullYear()} {BRAND_NAME}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

SenderTemplate.PreviewProps = {
  name: "Rafael Silva",
} as SenderTemplateProps;

export default SenderTemplate;
