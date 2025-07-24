import { PrismaClient } from "@prisma/client";
import { UsersRepository } from "../ports/usersRepository";
import { User, ValidatedUser } from "@dddforum/shared/src/api/users";

export class ProductionUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const maybeUser = await this.prisma.user.findFirst({ where: { email } });
      if (!maybeUser) return null;
      return maybeUser;
    } catch (err) {
      throw new Error("Database exception");
    }
  }

  async save(userData: ValidatedUser) {
    return await this.prisma.$transaction(async () => {
      const user = await this.prisma.user.create({ data: userData });
      await this.prisma.member.create({
        data: { userId: user.id },
      });
      return user;
    });
  }

  async update(
    id: number,
    props: Partial<ValidatedUser>,
  ): Promise<User | null> {
    const prismaUser = await this.prisma.user.update({
      where: { id },
      data: props,
    });
    return prismaUser;
  }

  async delete(email: string): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) return;
    await this.prisma.$transaction([
      this.prisma.member.delete({
        where: {
          userId: user.id,
        },
      }),
      this.prisma.user.delete({ where: { email } }),
    ]);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const maybeUser = await this.prisma.user.findFirst({
        where: { email },
      });
      if (!maybeUser) return null;
      return maybeUser;
    } catch (err) {
      throw new Error("Database exception");
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const maybeUser = await this.prisma.user.findFirst({
        where: { username },
      });
      if (!maybeUser) return null;
      return maybeUser;
    } catch (err) {
      throw new Error("Database exception");
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const maybeUser = await this.prisma.user.findFirst({ where: { id } });
      if (!maybeUser) return null;
      return maybeUser;
    } catch (err) {
      throw new Error("Database exception");
    }
  }
}
