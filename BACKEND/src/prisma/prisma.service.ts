import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client = new PrismaClient();

  get user() {
    return this.client.user;
  }

  get role() {
    return this.client.role;
  }

  get report() {
    return this.client.report;
  }

  get auditAccess() {
    return this.client.auditAccess;
  }

  get logActivity() {
    return this.client.logActivity;
  }

  get reportRole() {
    return this.client.reportRole;
  }

  get reportViewLog() {
    return this.client.reportViewLog;
  }

  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
