import { useAppTheme, type AppTheme } from "@/contexts/AppThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Check } from "lucide-react";
import { useLocation } from "wouter";

export default function ThemeSelector() {
  const { theme, setTheme } = useAppTheme();
  const [, setLocation] = useLocation();

  const themes: Array<{
    id: AppTheme;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    preview: string;
  }> = [
    {
      id: "light",
      name: "Tema Claro",
      description: "Interface clara com sidebar azul gradiente - Profissional e moderno",
      icon: Sun,
      preview: "bg-gradient-to-br from-blue-50 to-slate-100",
    },
    {
      id: "dark",
      name: "Tema Escuro",
      description: "Interface escura com sidebar cinza - Confortável para noite",
      icon: Moon,
      preview: "bg-gradient-to-br from-slate-900 to-slate-800",
    },
  ];

  const handleThemeSelect = (selectedTheme: AppTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Escolha seu Tema</h1>
          <p className="text-slate-600">Selecione o estilo visual que você prefere para a aplicação</p>
        </div>

        {/* Theme Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;

            return (
              <Card
                key={t.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleThemeSelect(t.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-blue-600" />
                      <div>
                        <CardTitle>{t.name}</CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="bg-blue-500 text-white p-2 rounded-full">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Preview */}
                  <div className={`h-32 rounded-lg ${t.preview} border border-slate-200 overflow-hidden`}>
                    <div className="h-full flex flex-col">
                      {/* Sidebar Preview */}
                      <div className="flex h-full">
                        <div
                          className={`w-20 ${
                            t.id === "light"
                              ? "bg-gradient-to-b from-blue-600 to-blue-700"
                              : "bg-slate-700"
                          }`}
                        />
                        {/* Content Preview */}
                        <div className="flex-1 p-3 space-y-2">
                          <div
                            className={`h-2 rounded ${
                              t.id === "light" ? "bg-slate-300" : "bg-slate-600"
                            }`}
                          />
                          <div
                            className={`h-2 rounded w-3/4 ${
                              t.id === "light" ? "bg-slate-300" : "bg-slate-600"
                            }`}
                          />
                          <div
                            className={`h-2 rounded w-1/2 ${
                              t.id === "light" ? "bg-slate-300" : "bg-slate-600"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/admin")}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => setLocation("/admin")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continuar com {theme === "light" ? "Tema Claro" : "Tema Escuro"}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-12 text-center text-sm text-slate-600">
          <p>Você pode alterar o tema a qualquer momento nas configurações</p>
        </div>
      </div>
    </div>
  );
}
