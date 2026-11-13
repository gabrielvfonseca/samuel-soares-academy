export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17";
  };
  public: {
    Tables: {
      alunos: {
        Row: {
          contacto_ee: string | null;
          created_at: string;
          data_inscricao: string | null;
          data_nascimento: string | null;
          email_ee: string | null;
          escalao: string | null;
          id: string;
          modalidade_inscricao: string | null;
          nome: string;
          nome_ee: string | null;
          notas_tecnicas: string | null;
          observacoes: string | null;
          tipo_atleta: string;
          turma_id: string | null;
          turma_ids: string[];
          updated_at: string;
        };
        Insert: {
          contacto_ee?: string | null;
          created_at?: string;
          data_inscricao?: string | null;
          data_nascimento?: string | null;
          email_ee?: string | null;
          escalao?: string | null;
          id?: string;
          modalidade_inscricao?: string | null;
          nome: string;
          nome_ee?: string | null;
          notas_tecnicas?: string | null;
          observacoes?: string | null;
          tipo_atleta?: string;
          turma_id?: string | null;
          turma_ids?: string[];
          updated_at?: string;
        };
        Update: {
          contacto_ee?: string | null;
          created_at?: string;
          data_inscricao?: string | null;
          data_nascimento?: string | null;
          email_ee?: string | null;
          escalao?: string | null;
          id?: string;
          modalidade_inscricao?: string | null;
          nome?: string;
          nome_ee?: string | null;
          notas_tecnicas?: string | null;
          observacoes?: string | null;
          tipo_atleta?: string;
          turma_id?: string | null;
          turma_ids?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alunos_turma_id_fkey";
            columns: ["turma_id"];
            isOneToOne: false;
            referencedRelation: "turmas";
            referencedColumns: ["id"];
          },
        ];
      };
      campos: {
        Row: {
          ativo: boolean;
          created_at: string;
          id: string;
          morada: string | null;
          nome: string;
          notas: string | null;
          updated_at: string;
        };
        Insert: {
          ativo?: boolean;
          created_at?: string;
          id?: string;
          morada?: string | null;
          nome: string;
          notas?: string | null;
          updated_at?: string;
        };
        Update: {
          ativo?: boolean;
          created_at?: string;
          id?: string;
          morada?: string | null;
          nome?: string;
          notas?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      clube_sessoes: {
        Row: {
          clube_id: string;
          created_at: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          clube_id: string;
          created_at?: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          clube_id?: string;
          created_at?: string;
          dia_semana?: number;
          hora_fim?: string;
          hora_inicio?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clube_sessoes_clube_id_fkey";
            columns: ["clube_id"];
            isOneToOne: false;
            referencedRelation: "clubes";
            referencedColumns: ["id"];
          },
        ];
      };
      clubes: {
        Row: {
          ativo: boolean;
          campo_id: string | null;
          contacto: string | null;
          created_at: string;
          dia_semana: number | null;
          email: string | null;
          hora_fim: string | null;
          hora_inicio: string | null;
          id: string;
          nif: string | null;
          nome: string;
          notas: string | null;
          treinador_id: string | null;
          updated_at: string;
          valor_mensal: number;
        };
        Insert: {
          ativo?: boolean;
          campo_id?: string | null;
          contacto?: string | null;
          created_at?: string;
          dia_semana?: number | null;
          email?: string | null;
          hora_fim?: string | null;
          hora_inicio?: string | null;
          id?: string;
          nif?: string | null;
          nome: string;
          notas?: string | null;
          treinador_id?: string | null;
          updated_at?: string;
          valor_mensal?: number;
        };
        Update: {
          ativo?: boolean;
          campo_id?: string | null;
          contacto?: string | null;
          created_at?: string;
          dia_semana?: number | null;
          email?: string | null;
          hora_fim?: string | null;
          hora_inicio?: string | null;
          id?: string;
          nif?: string | null;
          nome?: string;
          notas?: string | null;
          treinador_id?: string | null;
          updated_at?: string;
          valor_mensal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "clubes_campo_id_fkey";
            columns: ["campo_id"];
            isOneToOne: false;
            referencedRelation: "campos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clubes_treinador_id_fkey";
            columns: ["treinador_id"];
            isOneToOne: false;
            referencedRelation: "treinadores";
            referencedColumns: ["id"];
          },
        ];
      };
      configuracoes_notificacoes: {
        Row: {
          canal_preferencial: string;
          chave_api_resend: string | null;
          chave_api_whatsapp: string | null;
          created_at: string;
          email_remetente: string | null;
          fuso_horario: string;
          hora_envio_diario: string;
          id: string;
          ultimo_envio_data: string | null;
          updated_at: string;
          whatsapp_phone_id: string | null;
        };
        Insert: {
          canal_preferencial?: string;
          chave_api_resend?: string | null;
          chave_api_whatsapp?: string | null;
          created_at?: string;
          email_remetente?: string | null;
          fuso_horario?: string;
          hora_envio_diario?: string;
          id?: string;
          ultimo_envio_data?: string | null;
          updated_at?: string;
          whatsapp_phone_id?: string | null;
        };
        Update: {
          canal_preferencial?: string;
          chave_api_resend?: string | null;
          chave_api_whatsapp?: string | null;
          created_at?: string;
          email_remetente?: string | null;
          fuso_horario?: string;
          hora_envio_diario?: string;
          id?: string;
          ultimo_envio_data?: string | null;
          updated_at?: string;
          whatsapp_phone_id?: string | null;
        };
        Relationships: [];
      };
      cron_config: {
        Row: {
          endpoint: string;
          id: boolean;
          secret: string;
        };
        Insert: {
          endpoint: string;
          id?: boolean;
          secret: string;
        };
        Update: {
          endpoint?: string;
          id?: boolean;
          secret?: string;
        };
        Relationships: [];
      };
      disponibilidades: {
        Row: {
          created_at: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id: string;
          notas: string | null;
          treinador_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id?: string;
          notas?: string | null;
          treinador_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          dia_semana?: number;
          hora_fim?: string;
          hora_inicio?: string;
          id?: string;
          notas?: string | null;
          treinador_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "disponibilidades_treinador_id_fkey";
            columns: ["treinador_id"];
            isOneToOne: false;
            referencedRelation: "treinadores";
            referencedColumns: ["id"];
          },
        ];
      };
      disponibilidades_campos: {
        Row: {
          campo_id: string;
          created_at: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id: string;
          notas: string | null;
          updated_at: string;
        };
        Insert: {
          campo_id: string;
          created_at?: string;
          dia_semana: number;
          hora_fim: string;
          hora_inicio: string;
          id?: string;
          notas?: string | null;
          updated_at?: string;
        };
        Update: {
          campo_id?: string;
          created_at?: string;
          dia_semana?: number;
          hora_fim?: string;
          hora_inicio?: string;
          id?: string;
          notas?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "disponibilidades_campos_campo_id_fkey";
            columns: ["campo_id"];
            isOneToOne: false;
            referencedRelation: "campos";
            referencedColumns: ["id"];
          },
        ];
      };
      historico_lembretes: {
        Row: {
          canal: string;
          data_envio: string;
          detalhe: string | null;
          estado_envio: string;
          id: string;
          treinador_id: string | null;
          treino_id: string | null;
        };
        Insert: {
          canal: string;
          data_envio?: string;
          detalhe?: string | null;
          estado_envio: string;
          id?: string;
          treinador_id?: string | null;
          treino_id?: string | null;
        };
        Update: {
          canal?: string;
          data_envio?: string;
          detalhe?: string | null;
          estado_envio?: string;
          id?: string;
          treinador_id?: string | null;
          treino_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "historico_lembretes_treinador_id_fkey";
            columns: ["treinador_id"];
            isOneToOne: false;
            referencedRelation: "treinadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "historico_lembretes_treino_id_fkey";
            columns: ["treino_id"];
            isOneToOne: false;
            referencedRelation: "treinos";
            referencedColumns: ["id"];
          },
        ];
      };
      lembretes_pessoais: {
        Row: {
          created_at: string;
          email: string;
          enviado: boolean;
          enviado_em: string | null;
          erro: string | null;
          id: string;
          quando: string;
          texto: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          enviado?: boolean;
          enviado_em?: string | null;
          erro?: string | null;
          id?: string;
          quando: string;
          texto: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          enviado?: boolean;
          enviado_em?: string | null;
          erro?: string | null;
          id?: string;
          quando?: string;
          texto?: string;
        };
        Relationships: [];
      };
      mensalidades: {
        Row: {
          aluno_id: string | null;
          clube_id: string | null;
          created_at: string;
          estado_pagamento: string;
          fatura: string | null;
          id: string;
          mes_referencia: string;
          nif: string | null;
          notas: string | null;
          updated_at: string;
          valor: number | null;
        };
        Insert: {
          aluno_id?: string | null;
          clube_id?: string | null;
          created_at?: string;
          estado_pagamento?: string;
          fatura?: string | null;
          id?: string;
          mes_referencia: string;
          nif?: string | null;
          notas?: string | null;
          updated_at?: string;
          valor?: number | null;
        };
        Update: {
          aluno_id?: string | null;
          clube_id?: string | null;
          created_at?: string;
          estado_pagamento?: string;
          fatura?: string | null;
          id?: string;
          mes_referencia?: string;
          nif?: string | null;
          notas?: string | null;
          updated_at?: string;
          valor?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "mensalidades_aluno_id_fkey";
            columns: ["aluno_id"];
            isOneToOne: false;
            referencedRelation: "alunos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mensalidades_clube_id_fkey";
            columns: ["clube_id"];
            isOneToOne: false;
            referencedRelation: "clubes";
            referencedColumns: ["id"];
          },
        ];
      };
      movimentos: {
        Row: {
          automatico: boolean;
          categoria: string;
          created_at: string;
          data: string;
          descricao: string | null;
          id: string;
          mensalidade_id: string | null;
          tipo: string;
          treinador_id: string | null;
          treino_id: string | null;
          updated_at: string;
          valor: number;
        };
        Insert: {
          automatico?: boolean;
          categoria?: string;
          created_at?: string;
          data?: string;
          descricao?: string | null;
          id?: string;
          mensalidade_id?: string | null;
          tipo: string;
          treinador_id?: string | null;
          treino_id?: string | null;
          updated_at?: string;
          valor?: number;
        };
        Update: {
          automatico?: boolean;
          categoria?: string;
          created_at?: string;
          data?: string;
          descricao?: string | null;
          id?: string;
          mensalidade_id?: string | null;
          tipo?: string;
          treinador_id?: string | null;
          treino_id?: string | null;
          updated_at?: string;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "movimentos_mensalidade_id_fkey";
            columns: ["mensalidade_id"];
            isOneToOne: false;
            referencedRelation: "mensalidades";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimentos_treinador_id_fkey";
            columns: ["treinador_id"];
            isOneToOne: false;
            referencedRelation: "treinadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "movimentos_treino_id_fkey";
            columns: ["treino_id"];
            isOneToOne: false;
            referencedRelation: "treinos";
            referencedColumns: ["id"];
          },
        ];
      };
      treinadores: {
        Row: {
          ativo: boolean;
          created_at: string;
          data_nascimento: string | null;
          email: string;
          id: string;
          morada: string | null;
          nif: string | null;
          nome: string;
          observacoes: string | null;
          telefone_whatsapp: string | null;
          updated_at: string;
          valor_hora_grupo: number;
          valor_hora_individual: number;
        };
        Insert: {
          ativo?: boolean;
          created_at?: string;
          data_nascimento?: string | null;
          email: string;
          id?: string;
          morada?: string | null;
          nif?: string | null;
          nome: string;
          observacoes?: string | null;
          telefone_whatsapp?: string | null;
          updated_at?: string;
          valor_hora_grupo?: number;
          valor_hora_individual?: number;
        };
        Update: {
          ativo?: boolean;
          created_at?: string;
          data_nascimento?: string | null;
          email?: string;
          id?: string;
          morada?: string | null;
          nif?: string | null;
          nome?: string;
          observacoes?: string | null;
          telefone_whatsapp?: string | null;
          updated_at?: string;
          valor_hora_grupo?: number;
          valor_hora_individual?: number;
        };
        Relationships: [];
      };
      treinos: {
        Row: {
          aluno_id: string | null;
          campo_local: string | null;
          clube_id: string | null;
          created_at: string;
          data_hora_fim: string;
          data_hora_inicio: string;
          estado: string;
          estado_pagamento: string;
          fatura: string | null;
          id: string;
          nif: string | null;
          notas: string | null;
          serie_id: string | null;
          tipo: string;
          treinador_id: string | null;
          turma_id: string | null;
          updated_at: string;
        };
        Insert: {
          aluno_id?: string | null;
          campo_local?: string | null;
          clube_id?: string | null;
          created_at?: string;
          data_hora_fim: string;
          data_hora_inicio: string;
          estado?: string;
          estado_pagamento?: string;
          fatura?: string | null;
          id?: string;
          nif?: string | null;
          notas?: string | null;
          serie_id?: string | null;
          tipo?: string;
          treinador_id?: string | null;
          turma_id?: string | null;
          updated_at?: string;
        };
        Update: {
          aluno_id?: string | null;
          campo_local?: string | null;
          clube_id?: string | null;
          created_at?: string;
          data_hora_fim?: string;
          data_hora_inicio?: string;
          estado?: string;
          estado_pagamento?: string;
          fatura?: string | null;
          id?: string;
          nif?: string | null;
          notas?: string | null;
          serie_id?: string | null;
          tipo?: string;
          treinador_id?: string | null;
          turma_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treinos_aluno_id_fkey";
            columns: ["aluno_id"];
            isOneToOne: false;
            referencedRelation: "alunos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "treinos_clube_id_fkey";
            columns: ["clube_id"];
            isOneToOne: false;
            referencedRelation: "clubes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "treinos_treinador_id_fkey";
            columns: ["treinador_id"];
            isOneToOne: false;
            referencedRelation: "treinadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "treinos_turma_id_fkey";
            columns: ["turma_id"];
            isOneToOne: false;
            referencedRelation: "turmas";
            referencedColumns: ["id"];
          },
        ];
      };
      turmas: {
        Row: {
          ativo: boolean;
          campo_id: string | null;
          created_at: string;
          dia_semana: number | null;
          escalao: string | null;
          hora_fim: string | null;
          hora_inicio: string | null;
          id: string;
          nome: string;
          notas: string | null;
          treinador_id: string | null;
          updated_at: string;
        };
        Insert: {
          ativo?: boolean;
          campo_id?: string | null;
          created_at?: string;
          dia_semana?: number | null;
          escalao?: string | null;
          hora_fim?: string | null;
          hora_inicio?: string | null;
          id?: string;
          nome: string;
          notas?: string | null;
          treinador_id?: string | null;
          updated_at?: string;
        };
        Update: {
          ativo?: boolean;
          campo_id?: string | null;
          created_at?: string;
          dia_semana?: number | null;
          escalao?: string | null;
          hora_fim?: string | null;
          hora_inicio?: string | null;
          id?: string;
          nome?: string;
          notas?: string | null;
          treinador_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "turmas_campo_id_fkey";
            columns: ["campo_id"];
            isOneToOne: false;
            referencedRelation: "campos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "turmas_treinador_id_fkey";
            columns: ["treinador_id"];
            isOneToOne: false;
            referencedRelation: "treinadores";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      disparar_lembretes_diarios: { Args: never; Returns: undefined };
      disparar_lembretes_pessoais: { Args: never; Returns: undefined };
      disparar_resumo_faturas: { Args: never; Returns: undefined };
      disparar_resumo_mensalidades: { Args: never; Returns: undefined };
      disparar_resumo_ordenados: { Args: never; Returns: undefined };
      e_dia_de_envio_mensal: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
