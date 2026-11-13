import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";

interface ContactConfirmationEmailProps {
  data: {
    name: string;
    email: string;
    phone: string;
    childAge: string;
    club?: string;
    message: string;
  };
  detailsLabel: string;
  message: string;
  name: string;
  title: string;
}

export const ContactConfirmationEmail = ({
  title,
  message,
  detailsLabel,
  data,
}: ContactConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>{title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{title}</Heading>
        <Text style={text}>{message}</Text>
        <Section style={section}>
          <Text style={detailsHeader}>{detailsLabel}</Text>
          <Text style={detailsText}>
            <strong>Nome:</strong> {data.name}
          </Text>
          <Text style={detailsText}>
            <strong>Email:</strong> {data.email}
          </Text>
          <Text style={detailsText}>
            <strong>Telefone:</strong> {data.phone}
          </Text>
          <Text style={detailsText}>
            <strong>Idade do Atleta:</strong> {data.childAge}
          </Text>
          {data.club && (
            <Text style={detailsText}>
              <strong>Clube:</strong> {data.club}
            </Text>
          )}
          <Text style={detailsText}>
            <strong>Mensagem:</strong> {data.message}
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Academia Samuel Soares - Defende o teu futuro!
        </Text>
      </Container>
    </Body>
  </Html>
);

// biome-ignore lint/complexity/noRedundantDefaultExport: react-email preview requires a default export
export default ContactConfirmationEmail;

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  marginBottom: "64px",
  padding: "20px 0 48px",
};

const h1: React.CSSProperties = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0",
  textAlign: "center",
};

const text: React.CSSProperties = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
  textAlign: "center",
};

const section: React.CSSProperties = {
  padding: "20px 40px",
};

const detailsHeader: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const detailsText: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  margin: "5px 0",
};

const hr: React.CSSProperties = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer: React.CSSProperties = {
  color: "#8898aa",
  fontSize: "12px",
  textAlign: "center",
};
