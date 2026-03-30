"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../generated/prisma/client");
let PrismaService = class PrismaService {
    constructor() {
        this.client = new client_1.PrismaClient();
    }
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
    async onModuleInit() {
        await this.client.$connect();
    }
    async onModuleDestroy() {
        await this.client.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map