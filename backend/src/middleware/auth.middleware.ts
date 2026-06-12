import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../modules/auth/auth.service';
import { userRepository } from '../repositories/user.repository';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authorization header missing or malformed' });
      return;
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      plan: user.plan,
    };

    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid token';
    res.status(401).json({ success: false, error: message });
  }
}
