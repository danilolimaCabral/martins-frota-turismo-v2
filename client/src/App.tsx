import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Funcionario from "./pages/Funcionario";
import Admin from "./pages/Admin";
import AdminVeiculos from "./pages/AdminVeiculos";
import AdminMotoristas from "./pages/AdminMotoristas";
import AdminViagens from "./pages/AdminViagens";
import AdminDespesas from "./pages/AdminDespesas";
import Rastreamento from "./pages/Rastreamento";
import Sobre from "./pages/Sobre";
import Motorista from "./pages/Motorista";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/AdminBlog";
import AdminOrcamentos from "./pages/AdminOrcamentos";
import MotoristaChecklist from "./pages/MotoristaChecklist";
import AdminTemplates from "./pages/AdminTemplates";
import AdminFuncionarios from "./pages/AdminFuncionarios";
import AdminFolhaPagamento from "./pages/AdminFolhaPagamento";
import AdminLancamentosRH from "./pages/AdminLancamentosRH";
import AdminAlertas from "./pages/AdminAlertas";
import AdminFinanceiro from "./pages/AdminFinanceiro";
import AdminImportar from "./pages/AdminImportar";
import AdminAgenda from "./pages/AdminAgenda";
import AdminRoteirizacao from "./pages/AdminRoteirizacao";
import AdminPonto from "./pages/AdminPonto";
import AdminRelatorios from "./pages/AdminRelatorios";
import AdminFerias from "./pages/AdminFerias";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminPerfil from "./pages/AdminPerfil";
import AdminAuditoria from "./pages/AdminAuditoria";
import ChatbotMV from "./components/ChatbotMV";
import { ProtectedRoute } from "./components/ProtectedRoute";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/funcionario" component={Funcionario} />
        <Route path="/admin">
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/veiculos">
          <ProtectedRoute>
            <AdminVeiculos />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/motoristas">
          <ProtectedRoute>
            <AdminMotoristas />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/viagens">
          <ProtectedRoute>
            <AdminViagens />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/despesas">
          <ProtectedRoute>
            <AdminDespesas />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/funcionarios">
          <ProtectedRoute>
            <AdminFuncionarios />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/folha">
          <ProtectedRoute>
            <AdminFolhaPagamento />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/lancamentos-rh">
          <ProtectedRoute>
            <AdminLancamentosRH />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/alertas">
          <ProtectedRoute>
            <AdminAlertas />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/financeiro">
          <ProtectedRoute>
            <AdminFinanceiro />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/importar">
          <ProtectedRoute>
            <AdminImportar />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/agenda">
          <ProtectedRoute>
            <AdminAgenda />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/roteirizacao">
          <ProtectedRoute>
            <AdminRoteirizacao />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/relatorios">
          <ProtectedRoute>
            <AdminRelatorios />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/usuarios">
          <ProtectedRoute requireAdmin>
            <AdminUsuarios />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/perfil">
          <ProtectedRoute>
            <AdminPerfil />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/auditoria">
          <ProtectedRoute requireAdmin>
            <AdminAuditoria />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/ponto">
          <ProtectedRoute>
            <AdminPonto />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/ferias">
          <ProtectedRoute>
            <AdminFerias />
          </ProtectedRoute>
        </Route>
        <Route path="/rastreamento" component={Rastreamento} />
        <Route path="/sobre" component={Sobre} />
        <Route path="/motorista" component={Motorista} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/admin/blog">
          <ProtectedRoute requireAdmin>
            <AdminBlog />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/orcamentos">
          <ProtectedRoute requireAdmin>
            <AdminOrcamentos />
          </ProtectedRoute>
        </Route>
        <Route path="/motorista/checklist">
          <ProtectedRoute>
            <MotoristaChecklist />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/templates">
          <ProtectedRoute requireAdmin>
            <AdminTemplates />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        </Route>
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatbotMV />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
