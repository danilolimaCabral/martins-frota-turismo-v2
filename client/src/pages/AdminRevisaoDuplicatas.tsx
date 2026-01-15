import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Merge2, Split, Eye } from "lucide-react";
import { toast } from "sonner";

interface Duplicate {
  id: string;
  original: string;
  duplicate: string;
  similarity: number;
  confidence: "high" | "medium" | "low";
  status: "pending" | "merged" | "split" | "ignored";
}

interface ReviewAction {
  duplicateId: string;
  action: "merge" | "split" | "ignore";
  reason?: string;
}

export default function AdminRevisaoDuplicatas() {
  const [duplicates, setDuplicates] = useState<Duplicate[]>([
    {
      id: "1",
      original: "Rua das Flores, 123, Curitiba",
      duplicate: "Rua das Flores 123 Curitiba",
      similarity: 0.98,
      confidence: "high",
      status: "pending",
    },
    {
      id: "2",
      original: "Avenida Paulista, 1000, São Paulo",
      duplicate: "Av. Paulista 1000 São Paulo",
      similarity: 0.95,
      confidence: "high",
      status: "pending",
    },
    {
      id: "3",
      original: "Rua Independência, 456, Belo Horizonte",
      duplicate: "Rua Independencia 456 BH",
      similarity: 0.88,
      confidence: "medium",
      status: "pending",
    },
  ]);

  const [selectedDuplicate, setSelectedDuplicate] = useState<Duplicate | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"merge" | "split" | "ignore" | null>(null);
  const [reason, setReason] = useState("");

  const handleReview = (duplicate: Duplicate, action: "merge" | "split" | "ignore") => {
    setSelectedDuplicate(duplicate);
    setSelectedAction(action);
    setShowDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedDuplicate || !selectedAction) return;

    try {
      // Simular chamada tRPC
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedDuplicates = duplicates.map((dup) =>
        dup.id === selectedDuplicate.id
          ? { ...dup, status: selectedAction === "merge" ? "merged" : selectedAction === "split" ? "split" : "ignored" }
          : dup
      );

      setDuplicates(updatedDuplicates);
      setShowDialog(false);

      const actionLabel =
        selectedAction === "merge" ? "Mesclado" : selectedAction === "split" ? "Separado" : "Ignorado";
      toast.success(`Duplicata ${actionLabel.toLowerCase()} com sucesso!`);
    } catch (error) {
      toast.error("Erro ao processar ação");
    }
  };

  const pendingCount = duplicates.filter((d) => d.status === "pending").length;
  const mergedCount = duplicates.filter((d) => d.status === "merged").length;
  const ignoredCount = duplicates.filter((d) => d.status === "ignored").length;

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-500">Alta Confiança</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Média Confiança</Badge>;
      case "low":
        return <Badge className="bg-gray-500">Baixa Confiança</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "merged":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "ignored":
        return <XCircle className="w-5 h-5 text-gray-500" />;
      case "split":
        return <Split className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Revisão de Duplicatas</h1>
          <p className="text-muted-foreground">
            Gerencie endereços duplicados detectados durante importação de dados
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total</div>
            <div className="text-2xl font-bold">{duplicates.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Mescladas</div>
            <div className="text-2xl font-bold text-green-500">{mergedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Ignoradas</div>
            <div className="text-2xl font-bold text-gray-500">{ignoredCount}</div>
          </Card>
        </div>

        {/* Lista de Duplicatas */}
        <div className="space-y-4">
          {duplicates.map((duplicate) => (
            <Card key={duplicate.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon(duplicate.status)}
                    {getConfidenceBadge(duplicate.confidence)}
                    <span className="text-sm text-muted-foreground">
                      Similaridade: {(duplicate.similarity * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Original</div>
                      <div className="font-mono text-sm">{duplicate.original}</div>
                    </div>

                    <div className="flex justify-center">
                      <div className="text-muted-foreground">↓</div>
                    </div>

                    <div className="bg-muted p-3 rounded">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Duplicata</div>
                      <div className="font-mono text-sm">{duplicate.duplicate}</div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                {duplicate.status === "pending" && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleReview(duplicate, "merge")}
                      className="gap-2"
                    >
                      <Merge2 className="w-4 h-4" />
                      Mesclar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(duplicate, "split")}
                      className="gap-2"
                    >
                      <Split className="w-4 h-4" />
                      Separar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReview(duplicate, "ignore")}
                    >
                      Ignorar
                    </Button>
                  </div>
                )}

                {duplicate.status !== "pending" && (
                  <div className="ml-4">
                    <Badge variant="outline">
                      {duplicate.status === "merged"
                        ? "Mesclada"
                        : duplicate.status === "split"
                          ? "Separada"
                          : "Ignorada"}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {duplicates.length === 0 && (
          <Card className="p-8 text-center">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma duplicata para revisar</p>
          </Card>
        )}
      </div>

      {/* Dialog de Confirmação */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction === "merge"
                ? "Confirmar Mesclagem"
                : selectedAction === "split"
                  ? "Confirmar Separação"
                  : "Confirmar Ignorar"}
            </DialogTitle>
            <DialogDescription>
              {selectedAction === "merge"
                ? "Os endereços serão mesclados em um único registro"
                : selectedAction === "split"
                  ? "Os endereços serão mantidos separados"
                  : "Esta duplicata será ignorada"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDuplicate && (
              <>
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium mb-1">Original</div>
                  <div className="font-mono text-sm">{selectedDuplicate.original}</div>
                </div>

                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium mb-1">Duplicata</div>
                  <div className="font-mono text-sm">{selectedDuplicate.duplicate}</div>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium">Motivo (opcional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique por que está tomando esta ação..."
                className="w-full mt-2 p-2 border rounded text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmAction}>
                Confirmar {selectedAction === "merge" ? "Mesclagem" : selectedAction === "split" ? "Separação" : "Ignorar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
