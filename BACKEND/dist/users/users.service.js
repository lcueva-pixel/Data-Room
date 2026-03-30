"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_response_dto_1 = require("../common/dto/paginated-response.dto");
const VALID_SORT_FIELDS = ['id', 'nombreCompleto', 'email', 'fechaCreacion'];
function toValidSortField(field) {
    if (field && VALID_SORT_FIELDS.includes(field)) {
        return field;
    }
    return 'id';
}
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        var _a, _b, _c;
        const page = (_a = query.page) !== null && _a !== void 0 ? _a : 1;
        const limit = (_b = query.limit) !== null && _b !== void 0 ? _b : 10;
        const skip = (page - 1) * limit;
        const sortBy = toValidSortField(query.sortBy);
        const order = (_c = query.order) !== null && _c !== void 0 ? _c : 'asc';
        const where = {};
        if (query.search) {
            where.OR = [
                { nombreCompleto: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.rolId !== undefined)
            where.rolId = query.rolId;
        if (query.activo !== undefined)
            where.activo = query.activo;
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: order },
                select: {
                    id: true,
                    nombreCompleto: true,
                    email: true,
                    rolId: true,
                    activo: true,
                    fechaCreacion: true,
                    rol: { select: { rolDescripcion: true } },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return (0, paginated_response_dto_1.buildPaginatedResponse)(data, total, page, limit);
    }
    async create(dto) {
        var _a;
        const hash = await bcrypt.hash(dto.password, 10);
        await this.prisma.user.create({
            data: {
                nombreCompleto: dto.nombreCompleto,
                email: dto.email,
                passwordHash: hash,
                rolId: dto.rolId,
                activo: (_a = dto.activo) !== null && _a !== void 0 ? _a : true,
            },
        });
        return { message: 'Usuario creado exitosamente' };
    }
    async update(id, dto) {
        const data = {};
        if (dto.nombreCompleto !== undefined)
            data.nombreCompleto = dto.nombreCompleto;
        if (dto.email !== undefined)
            data.email = dto.email;
        if (dto.rolId !== undefined)
            data.rolId = dto.rolId;
        if (dto.activo !== undefined)
            data.activo = dto.activo;
        if (dto.password) {
            data.passwordHash = await bcrypt.hash(dto.password, 10);
        }
        await this.prisma.user.update({ where: { id }, data });
        return { message: 'Usuario actualizado exitosamente' };
    }
    async toggleActivo(id) {
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
        const updated = await this.prisma.user.update({
            where: { id },
            data: { activo: !user.activo },
            select: {
                id: true,
                nombreCompleto: true,
                email: true,
                rolId: true,
                activo: true,
                fechaCreacion: true,
                rol: { select: { rolDescripcion: true } },
            },
        });
        return updated;
    }
    async remove(id) {
        await this.prisma.user.update({
            where: { id },
            data: { activo: false },
        });
        return { message: 'Usuario desactivado exitosamente' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map