/** Layout comum dos emails: tabelas + cores seguras para todos os clientes de email. */
export function envelopeEmail(titulo: string, conteudo: string) {
  return `<!DOCTYPE html>
<html lang="pt">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:0;background-color:#f4f6f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;border:1px solid #dde5e1;border-radius:12px;">
            <tr>
              <td style="background-color:#14201b;border-radius:12px 12px 0 0;padding:20px 24px;">
                <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;color:#4ade80;">${titulo}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1c2a24;line-height:1.6;">
                ${conteudo}
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7d75;">
                Enviado automaticamente pela plataforma da Samuel Soares Academy.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export const estiloTabela =
  "width:100%;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1c2a24;";
export const estiloTh =
  "text-align:left;padding:8px;border-bottom:2px solid #dde5e1;color:#3c4f47;";
export const estiloTd = "padding:8px;border-bottom:1px solid #eef2f0;";
