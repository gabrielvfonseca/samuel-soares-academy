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
import * as React from "react";

interface ContactNotificationEmailProps {
  title: string;
  message: string;
  data: {
    name: string;
    email: string;
    phone: string;
    childAge: string;
    club?: string;
    message: string;
    contactMethod: string;
  };
}

export const ContactNotificationEmail = ({
  title,
  message,
  data,
}: ContactNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>{title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{title}</Heading>
        <Text style={text}>{message}</Text>
        <Section style={section}>
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
          <Text style={detailsText}>
            <strong>Método de Contacto Selecionado:</strong> {data.contactMethod}
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Website - Academia Samuel Soares</Text>
      </Container>
    </Body>
  </Html>
);

export default ContactNotificationEmail;

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1: React.CSSProperties = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center",
  margin: "30px 0",
};

const text: React.CSSProperties = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center",
  padding: "0 40px",
};

const section: React.CSSProperties = {
  padding: "20px 40px",
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
