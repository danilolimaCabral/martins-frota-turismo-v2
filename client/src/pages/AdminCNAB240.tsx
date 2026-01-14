import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Download, FileText, Loader2 , ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormData {
  folhaId: number;
  banco: "001" | "237" | "104";
  agencia: string;
  conta: string;
  contaDigito: string;
  empresa: string;
  cnpj: string;
}

export default function AdminCNAB240() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<FormData>({
    folhaId: 0,
    banco: "001",
    agencia: "",
    conta: "",
    contaDigito: "",
    empresa: "MARTINS VIAGENS E TURISMO",
    cnpj: "",
  });

  const [gerandoArquivo, setGerandoArquivo] = useState(false);
  const [arquivoGerado, setArquivoGerado] = useState<{
    nomeArquivo: string;
    conteudo: string;
    totalPagamentos: number;
    valorTotal: number;
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Query para listar folhas de pagamento
  const { data: folhas, isLoading: carregandoFolhas } = trpc.folha.list.useQuery();

  // Mutation para gerar CNAB240
  const gerarCNAB = trpc.cnab.gerarCNAB240.useMutation({
    onSuccess: (resultado) => {
      setArquivoGerado(resultado);
      setSucesso(true);
      setErro(null);
      setGerandoArquivo(false);

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSucesso(false), 5000);
    },
    onError: (erro) => {
      setErro(erro.message || "Erro ao gerar arquivo CNAB240");
      setGerandoArquivo(false);
    },
  });

  const handleGerarCNAB = async () => {
    // Validações
    if (!formData.folhaId) {
      setErro("Selecione uma folha de pagamento");
      return;
    }

    if (!formData.agencia || !formData.conta || !formData.contaDigito || !formData.cnpj) {
      setErro("Preencha todos os dados bancários");
      return;
    }

    if (formData.cnpj.length < 14) {
      setErro("CNPJ inválido");
      return;
    }

    setGerandoArquivo(true);
    setErro(null);

    gerarCNAB.mutate(formData);
  };

  const handleDownload = () => {
    if (!arquivoGerado) return;

    // Criar blob com conteúdo do arquivo
    const blob = new Blob([arquivoGerado.conteudo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Criar link de download
    const link = document.createElement("a");
    link.href = url;
    link.download = arquivoGerado.nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar URL
    URL.revokeObjectURL(url);
  };

  const handleCopiarConteudo = () => {
    if (!arquivoGerado) return;

    navigator.clipboard.writeText(arquivoGerado.conteudo);
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Botão Voltar */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-slate-900">Gerador CNAB240</h1>
          </div>
          <p className="text-slate-600">Gere e baixe arquivos CNAB240 para transferências de folha de pagamento</p>
        </div>

        {/* Alertas */}
        {erro && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {sucesso && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {arquivoGerado ? "Arquivo gerado com sucesso!" : "Operação realizada com sucesso!"}
            </AlertDescription>
          </Alert>
        )}

        {/* Formulário */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle>Dados da Folha de Pagamento</CardTitle>
            <CardDescription>Selecione a folha e configure os dados bancários</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Seleção de Folha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="folha">Folha de Pagamento</Label>
                  <Select
                    value={String(formData.folhaId)}
                    onValueChange={(value) => setFormData({ ...formData, folhaId: parseInt(value) })}
                  >
                    <SelectTrigger id="folha" disabled={carregandoFolhas}>
                      <SelectValue placeholder="Selecione uma folha..." />
                    </SelectTrigger>
                    <SelectContent>
                      {carregandoFolhas ? (
                        <SelectItem value="0" disabled>
                          Carregando...
                        </SelectItem>
                      ) : folhas && folhas.length > 0 ? (
                        folhas.map((folha: any) => (
                          <SelectItem key={folha.id} value={String(folha.id)}>
                            {`${folha.mesReferencia}/${folha.anoReferencia} - ${folha.status}`}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="0" disabled>
                          Nenhuma folha disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banco">Banco</Label>
                  <Select value={formData.banco} onValueChange={(value: any) => setFormData({ ...formData, banco: value })}>
                    <SelectTrigger id="banco">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="001">001 - Banco do Brasil</SelectItem>
                      <SelectItem value="237">237 - Bradesco</SelectItem>
                      <SelectItem value="104">104 - Caixa Econômica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dados Bancários */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    placeholder="0001"
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conta">Conta</Label>
                  <Input
                    id="conta"
                    placeholder="123456"
                    value={formData.conta}
                    onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                    maxLength={12}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digito">Dígito</Label>
                  <Input
                    id="digito"
                    placeholder="0"
                    value={formData.contaDigito}
                    onChange={(e) => setFormData({ ...formData, contaDigito: e.target.value })}
                    maxLength={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="12345678000190"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    maxLength={14}
                  />
                </div>
              </div>

              {/* Empresa */}
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  maxLength={30}
                />
              </div>

              {/* Botão Gerar */}
              <Button
                onClick={handleGerarCNAB}
                disabled={gerandoArquivo || !formData.folhaId}
                size="lg"
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {gerandoArquivo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando arquivo...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar CNAB240
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {arquivoGerado && (
          <Card className="shadow-lg border-green-200 bg-green-50">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <CardTitle className="text-green-900">Arquivo Gerado com Sucesso!</CardTitle>
              <CardDescription className="text-green-700">
                {arquivoGerado.nomeArquivo}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-slate-600 mb-1">Total de Pagamentos</p>
                    <p className="text-2xl font-bold text-green-700">{arquivoGerado.totalPagamentos}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-slate-600 mb-1">Valor Total</p>
                    <p className="text-2xl font-bold text-green-700">
                      R$ {arquivoGerado.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Preview do Arquivo */}
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-48 overflow-y-auto">
                  <pre>{arquivoGerado.conteudo.split("\r\n").slice(0, 10).join("\n")}...</pre>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Arquivo
                  </Button>

                  <Button
                    onClick={handleCopiarConteudo}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Copiar Conteúdo
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg" className="flex-1">
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Completo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-96 overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Arquivo CNAB240 Completo</DialogTitle>
                      </DialogHeader>
                      <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                        <pre>{arquivoGerado.conteudo}</pre>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Dica:</strong> O arquivo CNAB240 está pronto para ser enviado ao seu banco. 
                    Você pode baixá-lo ou copiar o conteúdo para colar diretamente no sistema bancário.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações Gerais */}
        {!arquivoGerado && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle>Sobre CNAB240</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 text-sm text-slate-700">
                <p>
                  <strong>CNAB240</strong> é o padrão de arquivo utilizado para transferências bancárias de folha de pagamento.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold">Características:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Formato: 240 caracteres por linha</li>
                    <li>Estrutura: Header + Lotes + Trailers</li>
                    <li>Suporta múltiplos bancos (BB, Bradesco, Caixa)</li>
                    <li>Compatível com sistemas bancários</li>
                  </ul>
                </div>
                <p>
                  <strong>Próximas etapas:</strong> Após gerar o arquivo, envie-o através do sistema de transferências do seu banco.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
