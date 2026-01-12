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
import { AdminAbastecimento } from "./pages/AdminAbastecimento";
import { Rastreamento } from "./pages/Rastreamento";
import { Monitoramento } from "./pages/Monitoramento";
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
import { AdminManutencao } from "./pages/AdminManutencao";
import { AdminChecklist } from "./pages/AdminChecklist";
import { AdminAtendimento } from "./pages/AdminAtendimento";
import { AdminMenu } from "./components/AdminMenu";
import { AdminDashboard } from "./pages/AdminDashboard";
import AdminAnaliseRotatividade from "./pages/AdminAnaliseRotatividade";
import AdminAvisosDocumentos from "./pages/AdminAvisosDocumentos";
import AdminBackupRestore from "./pages/AdminBackupRestore";
import { AdminCNAB } from "./pages/AdminCNAB";
import AdminCNAB240 from "./pages/AdminCNAB240";
import AdminCalendarioAvancado from "./pages/AdminCalendarioAvancado";
import AdminChatbotIA from "./pages/AdminChatbotIA";
import AdminConciliacao from "./pages/AdminConciliacao";
import AdminConfiguracoesGerais from "./pages/AdminConfiguracoesGerais";
import { DashboardPersonalizado } from "./pages/DashboardPersonalizado";
import AdminControleFerias from "./pages/AdminControleFerias";
import AdminDRE from "./pages/AdminDRE";
import AdminDetalhesEvento from "./pages/AdminDetalhesEvento";
import AdminDocumentosRH from "./pages/AdminDocumentosRH";
import AdminExportacaoGPS from "./pages/AdminExportacaoGPS";
import AdminFluxoCaixa from "./pages/AdminFluxoCaixa";
import AdminFolhaPagamentoAvancada from "./pages/AdminFolhaPagamentoAvancada";
import AdminGestaoTickets from "./pages/AdminGestaoTickets";
import AdminHistoricoRotas from "./pages/AdminHistoricoRotas";
import AdminIntegracaoInterna from "./pages/AdminIntegracaoInterna";
import AdminIntegracoes from "./pages/AdminIntegracoes";
import AdminMetodosPagamento from "./pages/AdminMetodosPagamento";
import AdminNPS from "./pages/AdminNPS";
import AdminNotificacoes from "./pages/AdminNotificacoes";
import AdminOrcamentosCompleto from "./pages/AdminOrcamentosCompleto";
import AdminOtimizacaoAvancada from "./pages/AdminOtimizacaoAvancada";
import AdminRastreamento from "./pages/AdminRastreamento";
import AdminRelatorioFinanceiro from "./pages/AdminRelatorioFinanceiro";
import AdminRelatoriosAgenda from "./pages/AdminRelatoriosAgenda";
import AdminRelatoriosRH from "./pages/AdminRelatoriosRH";
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
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardPersonalizado />
        </ProtectedRoute>
      </Route>
      <Route path="/funcionario" component={Funcionario} />
        <Route path="/admin">
          <ProtectedRoute>
            <AdminDashboard />
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
        <Route path="/admin/abastecimento">
          <ProtectedRoute>
            <AdminAbastecimento />
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
        <Route path="/admin/cnab240">
          <ProtectedRoute>
            <AdminCNAB240 />
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
        <Route path="/admin/manutencao">
          <ProtectedRoute>
            <AdminManutencao />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/checklist">
          <ProtectedRoute>
            <AdminChecklist />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/atendimento">
          <ProtectedRoute>
            <AdminAtendimento />
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
        <Route path="/admin/analiserotatividade">
          <ProtectedRoute>
            <AdminAnaliseRotatividade />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/avisosdocumentos">
          <ProtectedRoute>
            <AdminAvisosDocumentos />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/backuprestore">
          <ProtectedRoute>
            <AdminBackupRestore />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/cnab">
          <ProtectedRoute>
            <AdminCNAB />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/calendarioavancado">
          <ProtectedRoute>
            <AdminCalendarioAvancado />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/chatbotia">
          <ProtectedRoute>
            <AdminChatbotIA />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/conciliacao">
          <ProtectedRoute>
            <AdminConciliacao />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/configuracoesgerais">
          <ProtectedRoute>
            <AdminConfiguracoesGerais />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/controleferias">
          <ProtectedRoute>
            <AdminControleFerias />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/dre">
          <ProtectedRoute>
            <AdminDRE />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/detalhesevento">
          <ProtectedRoute>
            <AdminDetalhesEvento />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/documentosrh">
          <ProtectedRoute>
            <AdminDocumentosRH />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/exportacaogps">
          <ProtectedRoute>
            <AdminExportacaoGPS />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/fluxocaixa">
          <ProtectedRoute>
            <AdminFluxoCaixa />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/folhapagamentoavancada">
          <ProtectedRoute>
            <AdminFolhaPagamentoAvancada />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/gestaotickets">
          <ProtectedRoute>
            <AdminGestaoTickets />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/historicorotas">
          <ProtectedRoute>
            <AdminHistoricoRotas />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/integracaointerna">
          <ProtectedRoute>
            <AdminIntegracaoInterna />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/integracoes">
          <ProtectedRoute>
            <AdminIntegracoes />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/metodospagamento">
          <ProtectedRoute>
            <AdminMetodosPagamento />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/nps">
          <ProtectedRoute>
            <AdminNPS />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/notificacoes">
          <ProtectedRoute>
            <AdminNotificacoes />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/orcamentoscompleto">
          <ProtectedRoute>
            <AdminOrcamentosCompleto />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/otimizacaoavancada">
          <ProtectedRoute>
            <AdminOtimizacaoAvancada />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/rastreamento">
          <ProtectedRoute>
            <AdminRastreamento />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/relatoriofinanceiro">
          <ProtectedRoute>
            <AdminRelatorioFinanceiro />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/relatoriosagenda">
          <ProtectedRoute>
            <AdminRelatoriosAgenda />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/relatoriosrh">
          <ProtectedRoute>
            <AdminRelatoriosRH />
          </ProtectedRoute>
        </Route>
        <Route path="/rastreamento" component={Rastreamento} />
      <Route path="/monitoramento" component={Monitoramento} />
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
