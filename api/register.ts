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

    if (!password) {
      return errorResponse('Password required', 400);
    }

    const db = await getDb();

    // Check if user already exists
    const existingUser = db.data?.users.find((u: any) => u.username === username);
    if (existingUser) {
      return errorResponse('User already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { ...body, password: hashedPassword, id: Date.now() };
    db.data!.users.push(newUser);
    await db.write();

    return jsonResponse({ message: 'User registered successfully' }, 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}