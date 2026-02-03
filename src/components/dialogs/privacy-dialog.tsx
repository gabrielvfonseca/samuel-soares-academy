import type { JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BRAND_NAME, CONTACT_INFO } from "@/globals/constants";

interface PrivacyDialogProps {
  privacyOpen: boolean;
  setPrivacyOpen: (open: boolean) => void;
  triggerLabel?: string;
}

export function PrivacyDialog({
  privacyOpen,
  setPrivacyOpen,
  triggerLabel = "Privacidade",
}: PrivacyDialogProps): JSX.Element {
  return (
    <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-background/60 hover:text-background transition-colors">
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Politica de Privacidade</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p className="text-foreground font-medium">Última atualização: Fevereiro 2026</p>

            <section>
              <h3 className="text-foreground font-medium mb-2">1. Introdução</h3>
              <p>
                A {BRAND_NAME} ("nós", "nosso" ou "Academia") está comprometida em proteger a
                privacidade dos nossos alunos, pais e utilizadores do nosso website. Esta Política
                de Privacidade explica como recolhemos, utilizamos, armazenamos e protegemos as suas
                informações pessoais.
              </p>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">2. Informações que Recolhemos</h3>
              <p>Recolhemos os seguintes tipos de informações:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Nome completo dos pais/encarregados de educação e das crianças</li>
                <li>Endereço de email e número de telefone</li>
                <li>Morada de residência</li>
                <li>Data de nascimento das crianças</li>
                <li>Informações médicas relevantes para a prática desportiva</li>
                <li>Fotografias e vídeos durante as atividades (com consentimento)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">
                3. Como Utilizamos as Informações
              </h3>
              <p>As informações recolhidas são utilizadas para:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Gestão das inscrições e participação nas atividades</li>
                <li>Comunicação com pais sobre horários, eventos e atualizações</li>
                <li>Garantir a segurança e bem-estar das crianças</li>
                <li>Processamento de pagamentos e faturação</li>
                <li>Cumprimento de obrigações legais e regulamentares</li>
                <li>Melhoria dos nossos serviços e programas</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">4. Partilha de Informações</h3>
              <p>
                Não vendemos, alugamos ou partilhamos informações pessoais com terceiros para fins
                de marketing. Podemos partilhar informações com:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Seguradoras (para cobertura de seguro desportivo)</li>
                <li>Federações desportivas (para inscrições em competições)</li>
                <li>Autoridades competentes (quando legalmente exigido)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">5. Proteção de Dados de Menores</h3>
              <p>
                Damos especial atenção à proteção dos dados das crianças. Recolhemos apenas as
                informações estritamente necessárias e sempre com o consentimento dos pais ou
                encarregados de educação. Imagens das crianças só são publicadas com autorização
                expressa.
              </p>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">6. Segurança dos Dados</h3>
              <p>
                Implementamos medidas técnicas e organizacionais adequadas para proteger as
                informações pessoais contra acesso não autorizado, alteração, divulgação ou
                destruição. Os dados são armazenados em sistemas seguros com acesso restrito.
              </p>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">7. Os Seus Direitos</h3>
              <p>Ao abrigo do RGPD, tem direito a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Aceder aos seus dados pessoais</li>
                <li>Retificar dados incorretos ou incompletos</li>
                <li>Solicitar a eliminação dos seus dados</li>
                <li>Opor-se ao tratamento dos seus dados</li>
                <li>Portabilidade dos dados</li>
                <li>Retirar o consentimento a qualquer momento</li>
                <li>
                  Apresentar queixa à autoridade de controlo (CNPD – Comissão Nacional de Proteção
                  de Dados)
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">8. Retenção de Dados</h3>
              <p>
                Mantemos os dados pessoais apenas durante o período necessário para cumprir os fins
                para os quais foram recolhidos, ou conforme exigido por lei. Para efeitos de
                faturação e obrigações fiscais, os dados podem ser mantidos por um período de 10
                anos.
              </p>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">9. Contacto</h3>
              <p>
                Para questões relacionadas com privacidade ou para exercer os seus direitos,
                contacte-nos através de:
              </p>
              <p className="mt-2">
                Email: {CONTACT_INFO.email}
                <br />
                Telefone: {CONTACT_INFO.phone}
                <br />
                Morada: {CONTACT_INFO.address}
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
