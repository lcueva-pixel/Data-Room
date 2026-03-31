import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.objectEnumValues.instances.AnyNull);
};
export declare const DbNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const JsonNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const AnyNull: {
    "__#private@#private": any;
    _getNamespace(): string;
    _getName(): string;
    toString(): string;
};
export declare const ModelName: {
    readonly Role: "Role";
    readonly User: "User";
    readonly Report: "Report";
    readonly ReportRole: "ReportRole";
    readonly AuditAccess: "AuditAccess";
    readonly LogActivity: "LogActivity";
    readonly ReportViewLog: "ReportViewLog";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const RoleScalarFieldEnum: {
    readonly id: "id";
    readonly rolDescripcion: "rolDescripcion";
};
export type RoleScalarFieldEnum = (typeof RoleScalarFieldEnum)[keyof typeof RoleScalarFieldEnum];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly nombreCompleto: "nombreCompleto";
    readonly email: "email";
    readonly passwordHash: "passwordHash";
    readonly rolId: "rolId";
    readonly activo: "activo";
    readonly fechaCreacion: "fechaCreacion";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const ReportScalarFieldEnum: {
    readonly id: "id";
    readonly titulo: "titulo";
    readonly descripcion: "descripcion";
    readonly urlIframe: "urlIframe";
    readonly activo: "activo";
    readonly fechaRegistro: "fechaRegistro";
    readonly padreId: "padreId";
};
export type ReportScalarFieldEnum = (typeof ReportScalarFieldEnum)[keyof typeof ReportScalarFieldEnum];
export declare const ReportRoleScalarFieldEnum: {
    readonly reporteId: "reporteId";
    readonly rolId: "rolId";
};
export type ReportRoleScalarFieldEnum = (typeof ReportRoleScalarFieldEnum)[keyof typeof ReportRoleScalarFieldEnum];
export declare const AuditAccessScalarFieldEnum: {
    readonly id: "id";
    readonly usuarioId: "usuarioId";
    readonly fechaHora: "fechaHora";
    readonly ipAddress: "ipAddress";
    readonly userAgent: "userAgent";
};
export type AuditAccessScalarFieldEnum = (typeof AuditAccessScalarFieldEnum)[keyof typeof AuditAccessScalarFieldEnum];
export declare const LogActivityScalarFieldEnum: {
    readonly id: "id";
    readonly usuarioId: "usuarioId";
    readonly accion: "accion";
    readonly detalle: "detalle";
    readonly fechaHora: "fechaHora";
};
export type LogActivityScalarFieldEnum = (typeof LogActivityScalarFieldEnum)[keyof typeof LogActivityScalarFieldEnum];
export declare const ReportViewLogScalarFieldEnum: {
    readonly id: "id";
    readonly usuarioId: "usuarioId";
    readonly reporteId: "reporteId";
    readonly duracion: "duracion";
    readonly fechaHora: "fechaHora";
};
export type ReportViewLogScalarFieldEnum = (typeof ReportViewLogScalarFieldEnum)[keyof typeof ReportViewLogScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
