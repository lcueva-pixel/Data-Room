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
exports.Report = void 0;
const typeorm_1 = require("typeorm");
const role_entity_1 = require("../../roles/entities/role.entity");
let Report = class Report {
};
exports.Report = Report;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Report.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Report.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Report.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'url_iframe', type: 'text' }),
    __metadata("design:type", String)
], Report.prototype, "urlIframe", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rol_minimo_id' }),
    __metadata("design:type", Number)
], Report.prototype, "rolMinimoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role),
    (0, typeorm_1.JoinColumn)({ name: 'rol_minimo_id' }),
    __metadata("design:type", role_entity_1.Role)
], Report.prototype, "rolMinimo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Report.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_registro', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Report.prototype, "fechaRegistro", void 0);
exports.Report = Report = __decorate([
    (0, typeorm_1.Entity)({ name: 'cex_reportes' })
], Report);
//# sourceMappingURL=report.entity.js.map