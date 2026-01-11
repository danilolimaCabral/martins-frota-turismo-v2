import { Request, Response } from 'express';
import { authenticateUserByUsername } from './auth';

export async function handleRestLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username e senha são obrigatórios'
      });
    }

    const result = await authenticateUserByUsername(username, password);

    if (!result) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    return res.json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (error: any) {
    console.error('Erro no login REST:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
}
