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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_response_dto_1 = require("../common/dto/paginated-response.dto");
const VALID_SORT_FIELDS = ['id', 'titulo', 'fechaRegistro'];
function toValidSortField(field) {
    if (field && VALID_SORT_FIELDS.includes(field)) {
        return field;
    }
    return 'id';
}
const REPORT_INCLUDE = {
    reportesRoles: { include: { rol: true } },
};
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByRole(rolId) {
        if (rolId === 1) {
            return this.prisma.report.findMany({
                where: { activo: true },
                include: REPORT_INCLUDE,
                orderBy: { id: 'asc' },
            });
        }
        return this.prisma.report.findMany({
            where: {
                activo: true,
                reportesRoles: { some: { rolId } },
            },
            include: REPORT_INCLUDE,
            orderBy: { id: 'asc' },
        });
    }
    async findAllAdmin(query) {
        var _a, _b, _c;
        const page = (_a = query.page) !== null && _a !== void 0 ? _a : 1;
        const limit = (_b = query.limit) !== null && _b !== void 0 ? _b : 5;
        const skip = (page - 1) * limit;
        const sortBy = toValidSortField(query.sortBy);
        const order = (_c = query.order) !== null && _c !== void 0 ? _c : 'asc';
        const where = {};
        if (query.search) {
            where.OR = [
                { titulo: { contains: query.search, mode: 'insensitive' } },
                { descripcion: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.activo !== undefined)
            where.activo = query.activo;
        const [data, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: order },
                include: REPORT_INCLUDE,
            }),
            this.prisma.report.count({ where }),
        ]);
        return (0, paginated_response_dto_1.buildPaginatedResponse)(data, total, page, limit);
    }
    async create(dto) {
        var _a;
        await this.prisma.report.create({
            data: {
                titulo: dto.titulo,
                descripcion: dto.descripcion,
                urlIframe: dto.urlIframe,
                activo: (_a = dto.activo) !== null && _a !== void 0 ? _a : true,
                reportesRoles: {
                    create: dto.rolesIds.map((rolId) => ({ rolId })),
                },
            },
        });
        return { message: 'Reporte creado exitosamente' };
    }
    async update(id, dto) {
        await this.prisma.report.update({
            where: { id },
            data: {
                ...(dto.titulo !== undefined && { titulo: dto.titulo }),
                ...(dto.urlIframe !== undefined && { urlIframe: dto.urlIframe }),
                ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
                ...(dto.activo !== undefined && { activo: dto.activo }),
                ...(dto.rolesIds !== undefined && {
                    reportesRoles: {
                        deleteMany: {},
                        create: dto.rolesIds.map((rolId) => ({ rolId })),
                    },
                }),
            },
        });
        return { message: 'Reporte actualizado exitosamente' };
    }
    async toggleActivo(id) {
        const report = await this.prisma.report.findUniqueOrThrow({ where: { id } });
        const updated = await this.prisma.report.update({
            where: { id },
            data: { activo: !report.activo },
            include: REPORT_INCLUDE,
        });
        return updated;
    }
    async remove(id) {
        await this.prisma.report.update({
            where: { id },
            data: { activo: false },
        });
        return { message: 'Reporte desactivado exitosamente' };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map