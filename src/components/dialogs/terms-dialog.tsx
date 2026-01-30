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

interface TermsDialogProps {
    termsOpen: boolean;
    setTermsOpen: (open: boolean) => void;
    triggerLabel?: string;
}

export function TermsDialog({ termsOpen, setTermsOpen, triggerLabel = "Termos" }: TermsDialogProps): JSX.Element {
    return (
        <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
            <DialogTrigger asChild>
            <button className="text-sm text-background/60 hover:text-background transition-colors">
                {triggerLabel}
            </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh]">
            <DialogHeader>
                <DialogTitle className="text-xl font-medium">Termos e Condicoes</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                <p className="text-foreground font-medium">Ultima atualizacao: Janeiro 2024</p>

                <section>
                    <h3 className="text-foreground font-medium mb-2">1. Disposicoes Gerais</h3>
                    <p>
                    Os presentes Termos e Condicoes regulam a relacao entre a {BRAND_NAME} e os
                    seus utilizadores, incluindo alunos, pais e encarregados de educacao. Ao
                    inscrever o seu filho na nossa Academia, aceita integralmente estes termos.
                    </p>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">2. Inscricao e Admissao</h3>
                    <ul className="list-disc pl-5 space-y-1">
                    <li>A inscricao esta sujeita a disponibilidade de vagas</li>
                    <li>E obrigatoria a apresentacao de atestado medico valido</li>
                    <li>
                        A ficha de inscricao deve ser preenchida na integra e com veracidade
                    </li>
                    <li>
                        A Academia reserva-se o direito de recusar inscricoes sem justificacao
                    </li>
                    <li>A aula experimental e gratuita e nao vinculativa</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">3. Pagamentos</h3>
                    <ul className="list-disc pl-5 space-y-1">
                    <li>A mensalidade deve ser paga ate ao dia 8 de cada mes</li>
                    <li>
                        Aceitamos pagamento por debito direto, transferencia bancaria ou MB Way
                    </li>
                    <li>
                        O atraso superior a 15 dias implica suspensao da participacao nos treinos
                    </li>
                    <li>A joia de inscricao nao e reembolsavel</li>
                    <li>O seguro desportivo esta incluido na mensalidade</li>
                    <li>
                        Descontos para irmaos: 10% na segunda inscricao, 15% a partir da terceira
                    </li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">
                    4. Cancelamento e Reembolsos
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                    <li>O cancelamento deve ser comunicado com 30 dias de antecedencia</li>
                    <li>Nao ha reembolso de mensalidades ja pagas</li>
                    <li>Em caso de lesao comprovada, a mensalidade pode ser suspensa</li>
                    <li>A Academia pode cancelar o contrato por comportamento inadequado</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">
                    5. Frequencia e Pontualidade
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                    <li>Os alunos devem chegar 10 minutos antes do inicio do treino</li>
                    <li>Faltas devem ser comunicadas com antecedencia sempre que possivel</li>
                    <li>
                        Mais de 3 faltas consecutivas sem justificacao pode resultar em perda de
                        vaga
                    </li>
                    <li>A pontualidade e fundamental para o bom funcionamento dos treinos</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">
                    6. Comportamento e Disciplina
                    </h3>
                    <p>Esperamos que todos os alunos:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Respeitem os treinadores, colegas e funcionarios</li>
                    <li>Cumpram as regras da Academia e do desporto</li>
                    <li>Zelem pelo equipamento e instalacoes</li>
                    <li>Demonstrem fair-play em todas as situacoes</li>
                    <li>Nao utilizem linguagem ou comportamento ofensivo</li>
                    </ul>
                    <p className="mt-2">
                    O incumprimento destas regras pode resultar em advertencia, suspensao
                    temporaria ou expulsao definitiva, sem direito a reembolso.
                    </p>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">7. Equipamento</h3>
                    <ul className="list-disc pl-5 space-y-1">
                    <li>O uso de caneleiras e obrigatorio em todos os treinos</li>
                    <li>Chuteiras ou sapatilhas adequadas sao obrigatorias</li>
                    <li>O equipamento oficial da Academia pode ser adquirido na secretaria</li>
                    <li>Os alunos sao responsaveis pelos seus pertences pessoais</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">8. Responsabilidade</h3>
                    <ul className="list-disc pl-5 space-y-1">
                    <li>A Academia possui seguro de acidentes pessoais para todos os alunos</li>
                    <li>Os pais devem informar sobre condicoes medicas relevantes</li>
                    <li>
                        A Academia nao se responsabiliza por objetos de valor perdidos ou roubados
                    </li>
                    <li>Os pais sao responsaveis pelo transporte dos alunos</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">
                    9. Recolha e Entrega de Alunos
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                    <li>
                        Os alunos so podem sair das instalacoes acompanhados por pessoa autorizada
                    </li>
                    <li>
                        Alteracoes na lista de pessoas autorizadas devem ser comunicadas por
                        escrito
                    </li>
                    <li>
                        Alunos com idade superior a 12 anos podem sair sozinhos mediante
                        autorizacao escrita
                    </li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">10. Direitos de Imagem</h3>
                    <p>
                    A Academia podera captar imagens e videos durante as atividades para fins de
                    divulgacao institucional, redes sociais e material promocional. Esta
                    autorizacao pode ser revogada a qualquer momento mediante comunicacao
                    escrita.
                    </p>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">
                    11. Alteracoes aos Termos
                    </h3>
                    <p>
                    A Academia reserva-se o direito de alterar estes Termos e Condicoes a
                    qualquer momento. As alteracoes serao comunicadas com 30 dias de
                    antecedencia e entram em vigor no inicio da epoca desportiva seguinte.
                    </p>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">12. Lei Aplicavel</h3>
                    <p>
                    Estes Termos e Condicoes sao regidos pela lei portuguesa. Qualquer litigio
                    sera submetido aos tribunais da comarca do Porto.
                    </p>
                </section>

                <section>
                    <h3 className="text-foreground font-medium mb-2">13. Contacto</h3>
                    <p>Para esclarecimentos adicionais, contacte-nos atraves de:</p>
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