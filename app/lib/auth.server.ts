import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const SALT_ROUNDS = 10;

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<{ hashedPassword: string; salt: string }> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { hashedPassword, salt };
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create user
export async function createUser(
  db: PrismaClient,
  email: string,
  username: string,
  password: string
) {
  const { hashedPassword, salt } = await hashPassword(password);

  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      username,
      hashedPassword,
      salt,
    },
  });

  return { id: user.id, email: user.email, username: user.username };
}

// Authenticate user by email and password
export async function authenticateUser(
  db: PrismaClient,
  email: string,
  password: string
) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      username: true,
      hashedPassword: true,
    },
  });

  if (!user || !user.hashedPassword) {
    return null;
  }

  const isValid = await verifyPassword(password, user.hashedPassword);
  if (!isValid) {
    return null;
  }

  return { id: user.id, email: user.email, username: user.username };
}

// Get user by ID
export async function getUserById(db: PrismaClient, id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
    },
  });
}

// Check if email exists
export async function emailExists(db: PrismaClient, email: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return !!user;
}

// Check if username exists
export async function usernameExists(db: PrismaClient, username: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return !!user;
}
