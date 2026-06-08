import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { jsonResponse, errorResponse } from './helpers';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json() as any;
    const { username, password } = body;

    const db = await getDb();
    const user = db.data?.users.find((u: any) => u.username === username);

    if (!user) {
      return jsonResponse({ message: 'User not found' }, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const { password: _, ...userWithoutPassword } = user;
      return jsonResponse({ message: 'Login successful', user: userWithoutPassword });
    } else {
      return jsonResponse({ message: 'Invalid credentials' }, 401);
    }
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}