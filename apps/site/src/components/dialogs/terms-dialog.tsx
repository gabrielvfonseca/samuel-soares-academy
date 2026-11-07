import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import type { JSX } from "react";
import { BRAND_NAME, CONTACT_INFO } from "@/globals/constants";

interface TermsDialogProps {
  setTermsOpen: (open: boolean) => void;
  termsOpen: boolean;
  triggerLabel?: string;
}

export function TermsDialog({
  termsOpen,
  setTermsOpen,
  triggerLabel = "Termos",
}: TermsDialogProps): JSX.Element {
  return (
    <Dialog onOpenChange={setTermsOpen} open={termsOpen}>
      <DialogTrigger asChild>
        <button className="text-background/60 hover:text-background text-sm transition-colors">
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            Termos e Condicoes
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="text-muted-foreground space-y-6 text-sm leading-relaxed">
            <p className="text-foreground font-medium">
              Última atualização: Fevereiro 2026
            </p>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                1. Disposições Gerais
              </h3>
              <p>
                Os presentes Termos e Condições regulam a relação entre a{" "}
                {BRAND_NAME} e os seus utilizadores, incluindo alunos, pais e
                encarregados de educação. Ao inscrever o seu filho na nossa
                Academia, aceita integralmente estes termos.
              </p>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                2. Inscrição e Admissão
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>A inscrição está sujeita à disponibilidade de vagas</li>
                <li>É obrigatória a apresentação de atestado médico válido</li>
                <li>
                  A ficha de inscrição deve ser preenchida na íntegra e com
                  veracidade
                </li>
                <li>
                  A Academia reserva-se o direito de recusar inscrições sem
                  justificação
                </li>
                <li>A aula experimental é gratuita e não vinculativa</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                3. Pagamentos
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>A mensalidade deve ser paga até ao dia 8 de cada mês</li>
                <li>
                  Aceitamos pagamento por débito direto, transferência bancária
                  ou MB Way
                </li>
                <li>
                  O atraso superior a 15 dias implica suspensão da participação
                  nos treinos
                </li>
                <li>A joia de inscrição não é reembolsável</li>
                <li>O seguro desportivo está incluído na mensalidade</li>
                <li>
                  Descontos para irmãos: 10% na segunda inscrição, 15% a partir
                  da terceira
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                4. Cancelamento e Reembolsos
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  O cancelamento deve ser comunicado com 30 dias de antecedência
                </li>
                <li>Não há reembolso de mensalidades já pagas</li>
                <li>
                  Em caso de lesão comprovada, a mensalidade pode ser suspensa
                </li>
                <li>
                  A Academia pode cancelar o contrato por comportamento
                  inadequado
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                5. Frequência e Pontualidade
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Os alunos devem chegar 10 minutos antes do início do treino
                </li>
                <li>
                  Faltas devem ser comunicadas com antecedência sempre que
                  possível
                </li>
                <li>
                  Mais de 3 faltas consecutivas sem justificação pode resultar
                  em perda de vaga
                </li>
                <li>
                  A pontualidade é fundamental para o bom funcionamento dos
                  treinos
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                6. Comportamento e Disciplina
              </h3>
              <p>Esperamos que todos os alunos:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Respeitem os treinadores, colegas e funcionários</li>
                <li>Cumpram as regras da Academia e do desporto</li>
                <li>Zelem pelo equipamento e instalações</li>
                <li>Demonstrem fair-play em todas as situações</li>
                <li>Não utilizem linguagem ou comportamento ofensivo</li>
              </ul>
              <p className="mt-2">
                O incumprimento destas regras pode resultar em advertência,
                suspensão temporária ou expulsão definitiva, sem direito a
                reembolso.
              </p>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                7. Equipamento
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>O uso de caneleiras é obrigatório em todos os treinos</li>
                <li>Chuteiras ou sapatilhas adequadas são obrigatórias</li>
                <li>
                  O equipamento oficial da Academia pode ser adquirido na
                  secretaria
                </li>
                <li>
                  Os alunos são responsáveis pelos seus pertences pessoais
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                8. Responsabilidade
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  A Academia possui seguro de acidentes pessoais para todos os
                  alunos
                </li>
                <li>
                  Os pais devem informar sobre condições médicas relevantes
                </li>
                <li>
                  A Academia não se responsabiliza por objetos de valor perdidos
                  ou roubados
                </li>
                <li>Os pais são responsáveis pelo transporte dos alunos</li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                9. Recolha e Entrega de Alunos
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Os alunos só podem sair das instalações acompanhados por
                  pessoa autorizada
                </li>
                <li>
                  Alterações na lista de pessoas autorizadas devem ser
                  comunicadas por escrito
                </li>
                <li>
                  Alunos com idade superior a 12 anos podem sair sozinhos
                  mediante autorização escrita
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                10. Direitos de Imagem
              </h3>
              <p>
                A Academia poderá captar imagens e vídeos durante as atividades
                para fins de divulgação institucional, redes sociais e material
                promocional. Esta autorização pode ser revogada a qualquer
                momento mediante comunicação escrita.
              </p>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                11. Alterações aos Termos
              </h3>
              <p>
                A Academia reserva-se o direito de alterar estes Termos e
                Condições a qualquer momento. As alterações serão comunicadas
                com 30 dias de antecedência e entram em vigor no início da época
                desportiva seguinte.
              </p>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">
                12. Lei Aplicável
              </h3>
              <p>
                Estes Termos e Condições são regidos pela lei portuguesa.
                Qualquer litígio será submetido aos tribunais da comarca de
                Cascais.
              </p>
            </section>

            <section>
              <h3 className="text-foreground mb-2 font-medium">13. Contacto</h3>
              <p>Para esclarecimentos adicionais, contacte-nos através de:</p>
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
