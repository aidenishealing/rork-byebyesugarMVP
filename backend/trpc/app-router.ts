import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import saveHabitRoute from "./routes/habits/save/route";
import getHabitsRoute from "./routes/habits/get/route";
import registerUserRoute from "./routes/users/register/route";
import loginUserRoute from "./routes/users/login/route";
import uploadBloodworkRoute from "./routes/bloodwork/upload/route";
import getBloodworkRoute from "./routes/bloodwork/get/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  habits: createTRPCRouter({
    save: saveHabitRoute,
    get: getHabitsRoute,
  }),
  users: createTRPCRouter({
    register: registerUserRoute,
    login: loginUserRoute,
  }),
  bloodwork: createTRPCRouter({
    upload: uploadBloodworkRoute,
    get: getBloodworkRoute,
  }),
});

export type AppRouter = typeof appRouter;