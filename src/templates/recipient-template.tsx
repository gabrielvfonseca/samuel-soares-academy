import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { BRAND_NAME, CONTACT_INFO, SITE_URL } from "@/globals/constants";

interface RecipientTemplateProps {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly childAge: string;
  readonly message: string;
}

export const RecipientTemplate = ({
  name,
  email,
  phone,
  childAge,
  message,
}: RecipientTemplateProps) => (
  <Html>
    <Head>
      <Font fontFamily="Inter" fallbackFontFamily="Arial" fontWeight={400} fontStyle="normal" />
    </Head>
    <Preview>Nova mensagem de contacto de {name}</Preview>
    <Tailwind>
      <Body className="bg-white font-sans text-zinc-900">
        <Container className="mx-auto py-12 px-4">
          <Section className="mb-8">
            <Text className="text-sm font-bold tracking-widest uppercase text-zinc-500 mb-2">
              {BRAND_NAME}
            </Text>
            <Text className="text-3xl font-semibold tracking-tight text-zinc-900 mt-0">
              Nova Mensagem de Contacto
            </Text>
          </Section>

          <Section className="rounded-xl border border-zinc-200 p-8 bg-zinc-50/50">
            <Text className="text-lg font-medium text-zinc-900 mb-4 mt-0">
              Detalhes do Interessado
            </Text>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Nome</Text>
                  <Text className="text-sm font-medium m-0">{name}</Text>
                </div>
                <div>
                  <Text className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Email</Text>
                  <Text className="text-sm font-medium m-0">
                    <Link href={`mailto:${email}`} className="text-zinc-600 underline">
                      {email}
                    </Link>
                  </Text>
                </div>
              </div>

              <Hr className="border-zinc-200 my-4" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                    Telefone
                  </Text>
                  <Text className="text-sm font-medium m-0">{phone}</Text>
                </div>
                <div>
                  <Text className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                    Idade da Criança
                  </Text>
                  <Text className="text-sm font-medium m-0">{childAge}</Text>
                </div>
              </div>

              <Hr className="border-zinc-200 my-4" />

              <div>
                <Text className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
                  Mensagem
                </Text>
                <Text className="text-sm text-zinc-700 leading-relaxed italic m-0">
                  "{message}"
                </Text>
              </div>
            </div>
          </Section>

          <Section className="mt-8 text-center">
            <Text className="text-xs text-zinc-500">
              Enviado via formulário de contacto em{" "}
              <Link href={SITE_URL} className="text-zinc-900 font-medium underline">
                {DOMAIN}
              </Link>
            </Text>
          </Section>

          <Hr className="border-zinc-200 my-8" />

          <Section className="text-zinc-500 text-xs">
            <Text className="m-0">
              © {new Date().getFullYear()} {BRAND_NAME}. Todos os direitos reservados.
            </Text>
            <Text className="mt-2 m-0">{CONTACT_INFO.address}</Text>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

const DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

RecipientTemplate.PreviewProps = {
  name: "Rafael Silva",
  email: "rafael.silva@example.com",
  phone: "+351 912 345 678",
  childAge: "8 anos",
  message:
    "Gostaria de saber mais sobre os horários dos treinos para o escalão sub-10. O meu filho está muito motivado!",
} as RecipientTemplateProps;

export default RecipientTemplate;
