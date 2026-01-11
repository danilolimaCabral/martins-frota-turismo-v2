/**
 * OAuth callback handler (DESABILITADO - usando autenticação local)
 * TODO: Remover completamente após implementar autenticação local
 */

import { Router } from "express";

export const oauthRouter = Router();

// OAuth desabilitado - usando autenticação local
oauthRouter.get("/callback", (req, res) => {
  res.status(404).json({ error: "OAuth disabled - using local authentication" });
});
