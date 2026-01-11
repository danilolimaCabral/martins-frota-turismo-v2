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
});

// TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),

export type AppRouter = typeof appRouter;
