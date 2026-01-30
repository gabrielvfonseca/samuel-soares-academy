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
            <p className="text-foreground font-medium">Ultima atualizacao: Janeiro 2024</p>

            <section>
              <h3 className="text-foreground font-medium mb-2">1. Introducao</h3>
              <p>
                A {BRAND_NAME} ("nos", "nosso" ou "Academia") esta comprometida em proteger a
                privacidade dos nossos alunos, pais e utilizadores do nosso website. Esta Politica
                de Privacidade explica como recolhemos, utilizamos, armazenamos e protegemos as suas
                informacoes pessoais.
              </p>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">2. Informacoes que Recolhemos</h3>
              <p>Recolhemos os seguintes tipos de informacoes:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Nome completo dos pais/encarregados de educacao e das criancas</li>
                <li>Endereco de email e numero de telefone</li>
                <li>Morada de residencia</li>
                <li>Data de nascimento das criancas</li>
                <li>Informacoes medicas relevantes para a pratica desportiva</li>
                <li>Fotografias e videos durante as atividades (com consentimento)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">
                3. Como Utilizamos as Informacoes
              </h3>
              <p>As informacoes recolhidas sao utilizadas para:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Gestao das inscricoes e participacao nas atividades</li>
                <li>Comunicacao com pais sobre horarios, eventos e atualizacoes</li>
                <li>Garantir a seguranca e bem-estar das criancas</li>
                <li>Processamento de pagamentos e faturacao</li>
                <li>Cumprimento de obrigacoes legais e regulamentares</li>
                <li>Melhoria dos nossos servicos e programas</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">4. Partilha de Informacoes</h3>
              <p>
                Nao vendemos, alugamos ou partilhamos informacoes pessoais com terceiros para fins
                de marketing. Podemos partilhar informacoes com:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Seguradoras (para cobertura de seguro desportivo)</li>
                <li>Federacoes desportivas (para inscricoes em competicoes)</li>
                <li>Autoridades competentes (quando legalmente exigido)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">5. Protecao de Dados de Menores</h3>
              <p>
                Damos especial atencao a protecao dos dados das criancas. Recolhemos apenas as
                informacoes estritamente necessarias e sempre com o consentimento dos pais ou
                encarregados de educacao. Imagens das criancas so sao publicadas com autorizacao
                expressa.
              </p>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">6. Seguranca dos Dados</h3>
              <p>
                Implementamos medidas tecnicas e organizacionais adequadas para proteger as
                informacoes pessoais contra acesso nao autorizado, alteracao, divulgacao ou
                destruicao. Os dados sao armazenados em sistemas seguros com acesso restrito.
              </p>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">7. Os Seus Direitos</h3>
              <p>Ao abrigo do RGPD, tem direito a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Aceder aos seus dados pessoais</li>
                <li>Retificar dados incorretos ou incompletos</li>
                <li>Solicitar a eliminacao dos seus dados</li>
                <li>Opor-se ao tratamento dos seus dados</li>
                <li>Portabilidade dos dados</li>
                <li>Retirar o consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">8. Retencao de Dados</h3>
              <p>
                Mantemos os dados pessoais apenas durante o periodo necessario para cumprir os fins
                para os quais foram recolhidos, ou conforme exigido por lei. Apos a cessacao da
                relacao com a Academia, os dados serao eliminados ou anonimizados no prazo de 5
                anos.
              </p>
            </section>

            <section>
              <h3 className="text-foreground font-medium mb-2">9. Contacto</h3>
              <p>
                Para questoes relacionadas com privacidade ou para exercer os seus direitos,
                contacte-nos atraves de:
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
