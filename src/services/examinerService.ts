import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const loginExaminer = async (userName: string, pass: string) => {
  const examiner = await prisma.examiner.findFirst({
    where: { userName },
  });

  if (!examiner) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(pass, examiner.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: examiner.id, userName: examiner.userName },
    process.env.JWT_SECRET || 'your_default_secret',
    {
      expiresIn: '10h',
    }
  );

  const { password, ...examinerWithoutPassword } = examiner;

  return { examiner: examinerWithoutPassword, token };
};

export const getExaminer = async (id: number) => {
  const examiner = await prisma.examiner.findUnique({
    where: { id },
  });
  if (!examiner) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...examinerWithoutPassword } = examiner;
  return examinerWithoutPassword;
};
