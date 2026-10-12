import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { User, UserRole } from '@/types';

const SESSION_COOKIE_NAME = 'oplast_session';

export interface SessionPayload {
  userId: string;
  username: string;
  role: UserRole;
  name: string;
}

export function encodeSession(payload: SessionPayload): string {
  const jsonStr = JSON.stringify(payload);
  return Buffer.from(jsonStr).toString('base64');
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    const jsonStr = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(jsonStr) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const payload = decodeSession(sessionToken);
  if (!payload) return null;

  const db = getDb();
  const row = db.prepare('SELECT id, username, name, email, role, department, created_at FROM users WHERE id = ?').get(payload.userId) as {
    id: string;
    username: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    created_at: string;
  } | undefined;

  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    createdAt: row.created_at,
  };
}

export function verifyCredentials(username: string, password: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as {
    id: string;
    username: string;
    password_hash: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    created_at: string;
  } | undefined;

  if (!row) return null;

  const isValid = bcrypt.compareSync(password, row.password_hash);
  if (!isValid) return null;

  return {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    createdAt: row.created_at,
  };
}

export async function setSessionCookie(user: User): Promise<void> {
  const cookieStore = await cookies();
  const token = encodeSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  });

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  if (userRole === 'ADMIN') return true;
  return requiredRoles.includes(userRole);
}
