import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./auth-routers";
import { chatbotRouter } from "./chatbot-routers";
import { vehicleRouter } from "./vehicle-routers";
import { driverRouter } from "./driver-routers";
import { tripRouter } from "./trip-routers";
import { expenseRouter } from "./expense-routers";
import { reviewRouter } from "./review-routers";
import { reportRouter } from "./report-routers";
import { blogRouter } from "./blog-routers";
import { weatherRouter } from "./weather-routers";
import { orcamentoRouter } from "./orcamento-routers";
import { contatoRouter } from "./contato-routers";
import { roteirizadorRouter } from "./roteirizador-routers";
import { checklistRouter } from "./checklist-routers";
import { manutencaoRouter } from "./manutencao-routers";
import { templatesRouter } from "./templates-routers";
import { funcionarioRouter } from "./funcionario-routers";
import { folhaRouter } from "./folha-routers";
import { pontoRouter } from "./ponto-routers";
import { feriasRouter } from "./ferias-routers";
import { lancamentosRHRouter } from "./lancamentos-rh-routers";
import { alertasRouter } from "./alertas-routers";
import { financeiroRouter } from "./financeiro-routers";
import { importRouter } from "./import-routers";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: authRouter,
  chatbot: chatbotRouter,
  vehicle: vehicleRouter,
  driver: driverRouter,
  trip: tripRouter,
  expense: expenseRouter,
  review: reviewRouter,
  report: reportRouter,
  blog: blogRouter,
  weather: weatherRouter,
  orcamento: orcamentoRouter,
  contato: contatoRouter,
  roteirizador: roteirizadorRouter,
  checklist: checklistRouter,
  manutencao: manutencaoRouter,
  templates: templatesRouter,
  funcionario: funcionarioRouter,
  folha: folhaRouter,
  ponto: pontoRouter,
  ferias: feriasRouter,
  lancamentosRH: lancamentosRHRouter,
  alertas: alertasRouter,
  financeiro: financeiroRouter,
  import: importRouter,
});

// TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),

export type AppRouter = typeof appRouter;
