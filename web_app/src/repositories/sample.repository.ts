import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export const sampleRepository = {
  async findManyByUserId(userId: string) {
    return prisma.sample.findMany({
      where: {
        userId,
      },
      orderBy: {
        testDate: 'desc',
      },
    });
  },

  async create(data: Prisma.SampleUncheckedCreateInput) {
    return prisma.sample.create({
      data,
    });
  },

  async findManyByIds(ids: string[], userId: string) {
    return prisma.sample.findMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
  },

  async deleteMany(ids: string[], userId: string) {
    return prisma.sample.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
  },
};
