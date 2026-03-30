"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registerAccess(record) {
        return this.prisma.auditAccess.create({
            data: {
                usuarioId: record.usuarioId,
                ipAddress: record.ipAddress,
                userAgent: record.userAgent,
            },
        });
    }
    async findAll() {
        const [accesos, visualizaciones] = await Promise.all([
            this.prisma.auditAccess.findMany({
                select: {
                    id: true,
                    fechaHora: true,
                    usuario: { select: { nombreCompleto: true, email: true } },
                },
            }),
            this.prisma.reportViewLog.findMany({
                select: {
                    id: true,
                    fechaHora: true,
                    duracion: true,
                    reporte: { select: { titulo: true } },
                    usuario: { select: { nombreCompleto: true, email: true } },
                },
            }),
        ]);
        const entriesAcceso = accesos.map((a) => ({
            id: `acceso-${a.id}`,
            tipo: 'ACCESO',
            fechaHora: a.fechaHora,
            usuario: a.usuario,
        }));
        const entriesVista = visualizaciones
            .filter((v) => v.reporte != null)
            .map((v) => ({
            id: `vista-${v.id}`,
            tipo: 'VISUALIZACION',
            fechaHora: v.fechaHora,
            usuario: v.usuario,
            reporte: { titulo: v.reporte.titulo },
            duracion: v.duracion,
        }));
        return [...entriesAcceso, ...entriesVista].sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
    }
    async registerReportView(usuarioId, dto) {
        await this.prisma.report.findUniqueOrThrow({ where: { id: dto.reporteId } });
        return this.prisma.reportViewLog.create({
            data: {
                usuarioId,
                reporteId: dto.reporteId,
                duracion: dto.duracion,
            },
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map