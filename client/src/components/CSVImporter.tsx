import { useState, useRef } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";

interface Endereco {
  nomeUsuario: string;
  endereco: string;
}

interface CSVImporterProps {
  onImport: (enderecos: Endereco[]) => void;
  onError?: (error: string) => void;
}

export function CSVImporter({ onImport, onError }: CSVImporterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validar tipo de arquivo
    if (!file.name.endsWith(".csv") && file.type !== "text/csv" && file.type !== "text/plain") {
      const errorMsg = "Por favor, selecione um arquivo CSV válido";
      setError(errorMsg);
      onError?.(errorMsg);
      setIsLoading(false);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const enderecos: Endereco[] = [];

          // Mapear colunas possíveis
          results.data.forEach((row: any, idx: number) => {
            // Procurar por colunas com nomes comuns
            const nomeKeys = ["nome", "nome_usuario", "nomeUsuario", "usuario", "name", "client"];
            const enderecoKeys = ["endereco", "endereço", "address", "rua", "street", "local"];

            let nomeUsuario = "";
            let endereco = "";

            // Encontrar nome do usuário
            for (const key of nomeKeys) {
              if (row[key]) {
                nomeUsuario = String(row[key]).trim();
                break;
              }
            }

            // Encontrar endereço
            for (const key of enderecoKeys) {
              if (row[key]) {
                endereco = String(row[key]).trim();
                break;
              }
            }

            // Se não encontrou endereço, tenta usar a primeira coluna
            if (!endereco && Object.keys(row).length > 0) {
              const firstKey = Object.keys(row)[0];
              endereco = String(row[firstKey]).trim();
            }

            if (endereco) {
              enderecos.push({
                nomeUsuario: nomeUsuario || `Endereço ${idx + 1}`,
                endereco,
              });
            }
          });

          if (enderecos.length === 0) {
            const errorMsg = "Nenhum endereço válido encontrado no arquivo. Verifique o formato do CSV.";
            setError(errorMsg);
            onError?.(errorMsg);
          } else {
            const successMsg = `${enderecos.length} endereço(s) importado(s) com sucesso!`;
            setSuccess(successMsg);
            onImport(enderecos);
          }
        } catch (err) {
          const errorMsg = `Erro ao processar arquivo: ${err instanceof Error ? err.message : "Erro desconhecido"}`;
          setError(errorMsg);
          onError?.(errorMsg);
        } finally {
          setIsLoading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      error: (error) => {
        const errorMsg = `Erro ao ler arquivo: ${error.message}`;
        setError(errorMsg);
        onError?.(errorMsg);
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="csv-file">Importar Endereços via CSV</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Formato esperado: colunas "nome" e "endereco" (ou similares)
        </p>
        <div className="flex gap-2">
          <Input
            id="csv-file"
            type="file"
            accept=".csv,.txt"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isLoading ? "Processando..." : "Selecionar"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="bg-muted p-3 rounded-lg text-sm">
        <p className="font-medium mb-2">Exemplo de formato CSV:</p>
        <pre className="text-xs overflow-x-auto">
{`nome,endereco
João Silva,Rua A 123
Maria Santos,Av. B 456
Pedro Costa,Rua C 789`}
        </pre>
      </div>
    </div>
  );
}
