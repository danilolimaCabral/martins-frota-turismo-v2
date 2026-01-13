import nodemailer from 'nodemailer';

/**
 * Configuração de email
 * Usar variáveis de ambiente para credenciais reais
 */
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para outros
  auth: {
    user: process.env.EMAIL_USER || 'seu-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'sua-senha-app',
  },
};

// Criar transporter
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Template HTML para holerite
 */
function gerarTemplateHolerite(dados: any): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Holerite - ${dados.periodo.mes}/${dados.periodo.ano}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 2px solid #ff6b00;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .company-info {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        .employee-info {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .info-label {
          font-weight: bold;
          color: #333;
        }
        .info-value {
          color: #666;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          background-color: #ff6b00;
          color: white;
          padding: 10px;
          font-weight: bold;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }
        .item-row:last-child {
          border-bottom: none;
        }
        .item-label {
          color: #333;
        }
        .item-value {
          color: #666;
          font-weight: bold;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-top: 2px solid #ff6b00;
          border-bottom: 2px solid #ff6b00;
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
        }
        .total-label {
          color: #333;
        }
        .total-value {
          color: #ff6b00;
        }
        .liquido-row {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          background-color: #e8f5e9;
          border-radius: 4px;
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
        }
        .liquido-label {
          color: #2e7d32;
        }
        .liquido-value {
          color: #2e7d32;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-name">${dados.empresa.razaoSocial}</div>
          <div class="company-info">
            CNPJ: ${dados.empresa.cnpj} | ${dados.empresa.endereco}, ${dados.empresa.cidade} - ${dados.empresa.uf}
          </div>
        </div>

        <div class="employee-info">
          <div class="info-row">
            <span class="info-label">Funcionário:</span>
            <span class="info-value">${dados.funcionario.nome}</span>
          </div>
          <div class="info-row">
            <span class="info-label">CPF:</span>
            <span class="info-value">${dados.funcionario.cpf}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Cargo:</span>
            <span class="info-value">${dados.funcionario.cargo}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Período:</span>
            <span class="info-value">${dados.periodo.mes}/${dados.periodo.ano}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">PROVENTOS</div>
          <div class="item-row">
            <span class="item-label">Salário Base</span>
            <span class="item-value">R$ ${(dados.proventos.salarioBase || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          ${dados.proventos.horasExtras50 > 0 ? `
          <div class="item-row">
            <span class="item-label">Horas Extras 50%</span>
            <span class="item-value">R$ ${dados.proventos.horasExtras50.toFixed(2).replace('.', ',')}</span>
          </div>
          ` : ''}
          ${dados.proventos.horasExtras100 > 0 ? `
          <div class="item-row">
            <span class="item-label">Horas Extras 100%</span>
            <span class="item-value">R$ ${dados.proventos.horasExtras100.toFixed(2).replace('.', ',')}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span class="total-label">TOTAL DE PROVENTOS</span>
            <span class="total-value">R$ ${(dados.proventos.total || 0).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">DESCONTOS</div>
          <div class="item-row">
            <span class="item-label">INSS</span>
            <span class="item-value">R$ ${(dados.descontos.inss || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="item-row">
            <span class="item-label">IRRF</span>
            <span class="item-value">R$ ${(dados.descontos.irrf || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          ${dados.descontos.valeTransporte > 0 ? `
          <div class="item-row">
            <span class="item-label">Vale Transporte</span>
            <span class="item-value">R$ ${dados.descontos.valeTransporte.toFixed(2).replace('.', ',')}</span>
          </div>
          ` : ''}
          ${dados.descontos.valeAlimentacao > 0 ? `
          <div class="item-row">
            <span class="item-label">Vale Alimentação</span>
            <span class="item-value">R$ ${dados.descontos.valeAlimentacao.toFixed(2).replace('.', ',')}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span class="total-label">TOTAL DE DESCONTOS</span>
            <span class="total-value">R$ ${(dados.descontos.total || 0).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        <div class="liquido-row">
          <span class="liquido-label">LÍQUIDO A RECEBER</span>
          <span class="liquido-value">R$ ${(dados.liquido || 0).toFixed(2).replace('.', ',')}</span>
        </div>

        <div class="footer">
          <p>Este é um documento gerado automaticamente pelo sistema de folha de pagamento.</p>
          <p>Em caso de dúvidas, entre em contato com o departamento de RH.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Enviar holerite por email
 */
export async function enviarHolerite(
  emailDestino: string,
  nomeDestino: string,
  dados: any
): Promise<{ success: boolean; message: string }> {
  try {
    const htmlContent = gerarTemplateHolerite(dados);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@martinsturismo.com.br',
      to: emailDestino,
      subject: `Holerite - ${nomeDestino} - ${dados.periodo.mes}/${dados.periodo.ano}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email enviado:', info.response);

    return {
      success: true,
      message: `Holerite enviado com sucesso para ${emailDestino}`,
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return {
      success: false,
      message: `Erro ao enviar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    };
  }
}

/**
 * Enviar múltiplos holerites em lote
 */
export async function enviarHoleritesEmLote(
  holerites: Array<{
    email: string;
    nome: string;
    dados: any;
  }>
): Promise<{ sucesso: number; erro: number; mensagens: string[] }> {
  const resultado = {
    sucesso: 0,
    erro: 0,
    mensagens: [] as string[],
  };

  for (const holerite of holerites) {
    const resultado_email = await enviarHolerite(holerite.email, holerite.nome, holerite.dados);

    if (resultado_email.success) {
      resultado.sucesso++;
    } else {
      resultado.erro++;
    }

    resultado.mensagens.push(resultado_email.message);
  }

  return resultado;
}

/**
 * Testar conexão SMTP
 */
export async function testarConexaoSMTP(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Conexão SMTP verificada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao verificar conexão SMTP:', error);
    return false;
  }
}
