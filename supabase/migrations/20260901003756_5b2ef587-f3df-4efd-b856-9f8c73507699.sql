ALTER TABLE public.treinos
  ADD COLUMN estado_pagamento text NOT NULL DEFAULT 'A aguardar pagamento',
  ADD COLUMN fatura text;

ALTER TABLE public.treinos
  ADD CONSTRAINT treinos_estado_pagamento_check CHECK (estado_pagamento IN ('A aguardar pagamento','Pago'));

ALTER TABLE public.treinos
  ADD CONSTRAINT treinos_fatura_check CHECK (fatura IS NULL OR fatura IN ('Com fatura','Sem fatura'));