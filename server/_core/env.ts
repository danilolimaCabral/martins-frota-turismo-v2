export const ENV = {
  appId: process.env.VITE_APP_ID ?? "martins-frota-turismo",
  cookieSecret: process.env.JWT_SECRET ?? "default-jwt-secret-change-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
