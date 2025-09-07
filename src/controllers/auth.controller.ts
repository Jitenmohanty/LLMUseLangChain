import { Request, Response } from "express";
import { AuthService } from "../services/authService";

export default class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;
      const user = await AuthService.createUser(email, username, password);
      res.json({ id: user.id, email: user.email, username: user.username, created_at: user.created_at });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.authenticate(email, password);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const token = AuthService.createTokenForUser(user);
      res.json({ access_token: token, token_type: "bearer" });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  static async profile(req: Request, res: Response) {
    try {
      const userId = req.user?.id   // 👈 matches middleware
      if (!userId) return res.status(401).json({ error: "Unauthorized" })

      const user = await AuthService.getProfile(userId)
      res.json(user)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  }


}
