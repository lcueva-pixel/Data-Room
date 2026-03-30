import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
export type UserModel = runtime.Types.Result.DefaultSelection<Prisma.$UserPayload>;
export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
export type UserAvgAggregateOutputType = {
    id: number | null;
    rolId: number | null;
};
export type UserSumAggregateOutputType = {
    id: number | null;
    rolId: number | null;
};
export type UserMinAggregateOutputType = {
    id: number | null;
    nombreCompleto: string | null;
    email: string | null;
    passwordHash: string | null;
    rolId: number | null;
    activo: boolean | null;
    fechaCreacion: Date | null;
};
export type UserMaxAggregateOutputType = {
    id: number | null;
    nombreCompleto: string | null;
    email: string | null;
    passwordHash: string | null;
    rolId: number | null;
    activo: boolean | null;
    fechaCreacion: Date | null;
};
export type UserCountAggregateOutputType = {
    id: number;
    nombreCompleto: number;
    email: number;
    passwordHash: number;
    rolId: number;
    activo: number;
    fechaCreacion: number;
    _all: number;
};
export type UserAvgAggregateInputType = {
    id?: true;
    rolId?: true;
};
export type UserSumAggregateInputType = {
    id?: true;
    rolId?: true;
};
export type UserMinAggregateInputType = {
    id?: true;
    nombreCompleto?: true;
    email?: true;
    passwordHash?: true;
    rolId?: true;
    activo?: true;
    fechaCreacion?: true;
};
export type UserMaxAggregateInputType = {
    id?: true;
    nombreCompleto?: true;
    email?: true;
    passwordHash?: true;
    rolId?: true;
    activo?: true;
    fechaCreacion?: true;
};
export type UserCountAggregateInputType = {
    id?: true;
    nombreCompleto?: true;
    email?: true;
    passwordHash?: true;
    rolId?: true;
    activo?: true;
    fechaCreacion?: true;
    _all?: true;
};
export type UserAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UserCountAggregateInputType;
    _avg?: UserAvgAggregateInputType;
    _sum?: UserSumAggregateInputType;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUser[P]> : Prisma.GetScalarType<T[P], AggregateUser[P]>;
};
export type UserGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithAggregationInput | Prisma.UserOrderByWithAggregationInput[];
    by: Prisma.UserScalarFieldEnum[] | Prisma.UserScalarFieldEnum;
    having?: Prisma.UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _avg?: UserAvgAggregateInputType;
    _sum?: UserSumAggregateInputType;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type UserGroupByOutputType = {
    id: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    rolId: number;
    activo: boolean;
    fechaCreacion: Date;
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]>;
}>>;
export type UserWhereInput = {
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    id?: Prisma.IntFilter<"User"> | number;
    nombreCompleto?: Prisma.StringFilter<"User"> | string;
    email?: Prisma.StringFilter<"User"> | string;
    passwordHash?: Prisma.StringFilter<"User"> | string;
    rolId?: Prisma.IntFilter<"User"> | number;
    activo?: Prisma.BoolFilter<"User"> | boolean;
    fechaCreacion?: Prisma.DateTimeFilter<"User"> | Date | string;
    rol?: Prisma.XOR<Prisma.RoleScalarRelationFilter, Prisma.RoleWhereInput>;
    auditAccesses?: Prisma.AuditAccessListRelationFilter;
    logActivities?: Prisma.LogActivityListRelationFilter;
    reportViewLogs?: Prisma.ReportViewLogListRelationFilter;
};
export type UserOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    nombreCompleto?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaCreacion?: Prisma.SortOrder;
    rol?: Prisma.RoleOrderByWithRelationInput;
    auditAccesses?: Prisma.AuditAccessOrderByRelationAggregateInput;
    logActivities?: Prisma.LogActivityOrderByRelationAggregateInput;
    reportViewLogs?: Prisma.ReportViewLogOrderByRelationAggregateInput;
};
export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    email?: string;
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    nombreCompleto?: Prisma.StringFilter<"User"> | string;
    passwordHash?: Prisma.StringFilter<"User"> | string;
    rolId?: Prisma.IntFilter<"User"> | number;
    activo?: Prisma.BoolFilter<"User"> | boolean;
    fechaCreacion?: Prisma.DateTimeFilter<"User"> | Date | string;
    rol?: Prisma.XOR<Prisma.RoleScalarRelationFilter, Prisma.RoleWhereInput>;
    auditAccesses?: Prisma.AuditAccessListRelationFilter;
    logActivities?: Prisma.LogActivityListRelationFilter;
    reportViewLogs?: Prisma.ReportViewLogListRelationFilter;
}, "id" | "email">;
export type UserOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    nombreCompleto?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaCreacion?: Prisma.SortOrder;
    _count?: Prisma.UserCountOrderByAggregateInput;
    _avg?: Prisma.UserAvgOrderByAggregateInput;
    _max?: Prisma.UserMaxOrderByAggregateInput;
    _min?: Prisma.UserMinOrderByAggregateInput;
    _sum?: Prisma.UserSumOrderByAggregateInput;
};
export type UserScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"User"> | number;
    nombreCompleto?: Prisma.StringWithAggregatesFilter<"User"> | string;
    email?: Prisma.StringWithAggregatesFilter<"User"> | string;
    passwordHash?: Prisma.StringWithAggregatesFilter<"User"> | string;
    rolId?: Prisma.IntWithAggregatesFilter<"User"> | number;
    activo?: Prisma.BoolWithAggregatesFilter<"User"> | boolean;
    fechaCreacion?: Prisma.DateTimeWithAggregatesFilter<"User"> | Date | string;
};
export type UserCreateInput = {
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    activo?: boolean;
    fechaCreacion?: Date | string;
    rol: Prisma.RoleCreateNestedOneWithoutUsuariosInput;
    auditAccesses?: Prisma.AuditAccessCreateNestedManyWithoutUsuarioInput;
    logActivities?: Prisma.LogActivityCreateNestedManyWithoutUsuarioInput;
    reportViewLogs?: Prisma.ReportViewLogCreateNestedManyWithoutUsuarioInput;
};
export type UserUncheckedCreateInput = {
    id?: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    rolId: number;
    activo?: boolean;
    fechaCreacion?: Date | string;
    auditAccesses?: Prisma.AuditAccessUncheckedCreateNestedManyWithoutUsuarioInput;
    logActivities?: Prisma.LogActivityUncheckedCreateNestedManyWithoutUsuarioInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UserUpdateInput = {
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    rol?: Prisma.RoleUpdateOneRequiredWithoutUsuariosNestedInput;
    auditAccesses?: Prisma.AuditAccessUpdateManyWithoutUsuarioNestedInput;
    logActivities?: Prisma.LogActivityUpdateManyWithoutUsuarioNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUpdateManyWithoutUsuarioNestedInput;
};
export type UserUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    rolId?: Prisma.IntFieldUpdateOperationsInput | number;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    auditAccesses?: Prisma.AuditAccessUncheckedUpdateManyWithoutUsuarioNestedInput;
    logActivities?: Prisma.LogActivityUncheckedUpdateManyWithoutUsuarioNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UserCreateManyInput = {
    id?: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    rolId: number;
    activo?: boolean;
    fechaCreacion?: Date | string;
};
export type UserUpdateManyMutationInput = {
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    rolId?: Prisma.IntFieldUpdateOperationsInput | number;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserListRelationFilter = {
    every?: Prisma.UserWhereInput;
    some?: Prisma.UserWhereInput;
    none?: Prisma.UserWhereInput;
};
export type UserOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type UserCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nombreCompleto?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaCreacion?: Prisma.SortOrder;
};
export type UserAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
};
export type UserMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nombreCompleto?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaCreacion?: Prisma.SortOrder;
};
export type UserMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    nombreCompleto?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    passwordHash?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaCreacion?: Prisma.SortOrder;
};
export type UserSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
};
export type UserScalarRelationFilter = {
    is?: Prisma.UserWhereInput;
    isNot?: Prisma.UserWhereInput;
};
export type UserCreateNestedManyWithoutRolInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutRolInput, Prisma.UserUncheckedCreateWithoutRolInput> | Prisma.UserCreateWithoutRolInput[] | Prisma.UserUncheckedCreateWithoutRolInput[];
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutRolInput | Prisma.UserCreateOrConnectWithoutRolInput[];
    createMany?: Prisma.UserCreateManyRolInputEnvelope;
    connect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
};
export type UserUncheckedCreateNestedManyWithoutRolInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutRolInput, Prisma.UserUncheckedCreateWithoutRolInput> | Prisma.UserCreateWithoutRolInput[] | Prisma.UserUncheckedCreateWithoutRolInput[];
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutRolInput | Prisma.UserCreateOrConnectWithoutRolInput[];
    createMany?: Prisma.UserCreateManyRolInputEnvelope;
    connect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
};
export type UserUpdateManyWithoutRolNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutRolInput, Prisma.UserUncheckedCreateWithoutRolInput> | Prisma.UserCreateWithoutRolInput[] | Prisma.UserUncheckedCreateWithoutRolInput[];
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutRolInput | Prisma.UserCreateOrConnectWithoutRolInput[];
    upsert?: Prisma.UserUpsertWithWhereUniqueWithoutRolInput | Prisma.UserUpsertWithWhereUniqueWithoutRolInput[];
    createMany?: Prisma.UserCreateManyRolInputEnvelope;
    set?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    disconnect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    delete?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    connect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    update?: Prisma.UserUpdateWithWhereUniqueWithoutRolInput | Prisma.UserUpdateWithWhereUniqueWithoutRolInput[];
    updateMany?: Prisma.UserUpdateManyWithWhereWithoutRolInput | Prisma.UserUpdateManyWithWhereWithoutRolInput[];
    deleteMany?: Prisma.UserScalarWhereInput | Prisma.UserScalarWhereInput[];
};
export type UserUncheckedUpdateManyWithoutRolNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutRolInput, Prisma.UserUncheckedCreateWithoutRolInput> | Prisma.UserCreateWithoutRolInput[] | Prisma.UserUncheckedCreateWithoutRolInput[];
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutRolInput | Prisma.UserCreateOrConnectWithoutRolInput[];
    upsert?: Prisma.UserUpsertWithWhereUniqueWithoutRolInput | Prisma.UserUpsertWithWhereUniqueWithoutRolInput[];
    createMany?: Prisma.UserCreateManyRolInputEnvelope;
    set?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    disconnect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    delete?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    connect?: Prisma.UserWhereUniqueInput | Prisma.UserWhereUniqueInput[];
    update?: Prisma.UserUpdateWithWhereUniqueWithoutRolInput | Prisma.UserUpdateWithWhereUniqueWithoutRolInput[];
    updateMany?: Prisma.UserUpdateManyWithWhereWithoutRolInput | Prisma.UserUpdateManyWithWhereWithoutRolInput[];
    deleteMany?: Prisma.UserScalarWhereInput | Prisma.UserScalarWhereInput[];
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type UserCreateNestedOneWithoutAuditAccessesInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutAuditAccessesInput, Prisma.UserUncheckedCreateWithoutAuditAccessesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutAuditAccessesInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutAuditAccessesNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutAuditAccessesInput, Prisma.UserUncheckedCreateWithoutAuditAccessesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutAuditAccessesInput;
    upsert?: Prisma.UserUpsertWithoutAuditAccessesInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutAuditAccessesInput, Prisma.UserUpdateWithoutAuditAccessesInput>, Prisma.UserUncheckedUpdateWithoutAuditAccessesInput>;
};
export type UserCreateNestedOneWithoutLogActivitiesInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutLogActivitiesInput, Prisma.UserUncheckedCreateWithoutLogActivitiesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutLogActivitiesInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutLogActivitiesNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutLogActivitiesInput, Prisma.UserUncheckedCreateWithoutLogActivitiesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutLogActivitiesInput;
    upsert?: Prisma.UserUpsertWithoutLogActivitiesInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutLogActivitiesInput, Prisma.UserUpdateWithoutLogActivitiesInput>, Prisma.UserUncheckedUpdateWithoutLogActivitiesInput>;
};
export type UserCreateNestedOneWithoutReportViewLogsInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutReportViewLogsInput, Prisma.UserUncheckedCreateWithoutReportViewLogsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutReportViewLogsInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutReportViewLogsNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutReportViewLogsInput, Prisma.UserUncheckedCreateWithoutReportViewLogsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutReportViewLogsInput;
    upsert?: Prisma.UserUpsertWithoutReportViewLogsInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutReportViewLogsInput, Prisma.UserUpdateWithoutReportViewLogsInput>, Prisma.UserUncheckedUpdateWithoutReportViewLogsInput>;
};
export type UserCreateWithoutRolInput = {
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    activo?: boolean;
    fechaCreacion?: Date | string;
    auditAccesses?: Prisma.AuditAccessCreateNestedManyWithoutUsuarioInput;
    logActivities?: Prisma.LogActivityCreateNestedManyWithoutUsuarioInput;
    reportViewLogs?: Prisma.ReportViewLogCreateNestedManyWithoutUsuarioInput;
};
export type UserUncheckedCreateWithoutRolInput = {
    id?: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    activo?: boolean;
    fechaCreacion?: Date | string;
    auditAccesses?: Prisma.AuditAccessUncheckedCreateNestedManyWithoutUsuarioInput;
    logActivities?: Prisma.LogActivityUncheckedCreateNestedManyWithoutUsuarioInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UserCreateOrConnectWithoutRolInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutRolInput, Prisma.UserUncheckedCreateWithoutRolInput>;
};
export type UserCreateManyRolInputEnvelope = {
    data: Prisma.UserCreateManyRolInput | Prisma.UserCreateManyRolInput[];
    skipDuplicates?: boolean;
};
export type UserUpsertWithWhereUniqueWithoutRolInput = {
    where: Prisma.UserWhereUniqueInput;
    update: Prisma.XOR<Prisma.UserUpdateWithoutRolInput, Prisma.UserUncheckedUpdateWithoutRolInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutRolInput, Prisma.UserUncheckedCreateWithoutRolInput>;
};
export type UserUpdateWithWhereUniqueWithoutRolInput = {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutRolInput, Prisma.UserUncheckedUpdateWithoutRolInput>;
};
export type UserUpdateManyWithWhereWithoutRolInput = {
    where: Prisma.UserScalarWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyWithoutRolInput>;
};
export type UserScalarWhereInput = {
    AND?: Prisma.UserScalarWhereInput | Prisma.UserScalarWhereInput[];
    OR?: Prisma.UserScalarWhereInput[];
    NOT?: Prisma.UserScalarWhereInput | Prisma.UserScalarWhereInput[];
    id?: Prisma.IntFilter<"User"> | number;
    nombreCompleto?: Prisma.StringFilter<"User"> | string;
    email?: Prisma.StringFilter<"User"> | string;
    passwordHash?: Prisma.StringFilter<"User"> | string;
    rolId?: Prisma.IntFilter<"User"> | number;
    activo?: Prisma.BoolFilter<"User"> | boolean;
    fechaCreacion?: Prisma.DateTimeFilter<"User"> | Date | string;
};
export type UserCreateWithoutAuditAccessesInput = {
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    activo?: boolean;
    fechaCreacion?: Date | string;
    rol: Prisma.RoleCreateNestedOneWithoutUsuariosInput;
    logActivities?: Prisma.LogActivityCreateNestedManyWithoutUsuarioInput;
    reportViewLogs?: Prisma.ReportViewLogCreateNestedManyWithoutUsuarioInput;
};
export type UserUncheckedCreateWithoutAuditAccessesInput = {
    id?: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    rolId: number;
    activo?: boolean;
    fechaCreacion?: Date | string;
    logActivities?: Prisma.LogActivityUncheckedCreateNestedManyWithoutUsuarioInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UserCreateOrConnectWithoutAuditAccessesInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutAuditAccessesInput, Prisma.UserUncheckedCreateWithoutAuditAccessesInput>;
};
export type UserUpsertWithoutAuditAccessesInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutAuditAccessesInput, Prisma.UserUncheckedUpdateWithoutAuditAccessesInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutAuditAccessesInput, Prisma.UserUncheckedCreateWithoutAuditAccessesInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutAuditAccessesInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutAuditAccessesInput, Prisma.UserUncheckedUpdateWithoutAuditAccessesInput>;
};
export type UserUpdateWithoutAuditAccessesInput = {
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    rol?: Prisma.RoleUpdateOneRequiredWithoutUsuariosNestedInput;
    logActivities?: Prisma.LogActivityUpdateManyWithoutUsuarioNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUpdateManyWithoutUsuarioNestedInput;
};
export type UserUncheckedUpdateWithoutAuditAccessesInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    rolId?: Prisma.IntFieldUpdateOperationsInput | number;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    logActivities?: Prisma.LogActivityUncheckedUpdateManyWithoutUsuarioNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UserCreateWithoutLogActivitiesInput = {
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    activo?: boolean;
    fechaCreacion?: Date | string;
    rol: Prisma.RoleCreateNestedOneWithoutUsuariosInput;
    auditAccesses?: Prisma.AuditAccessCreateNestedManyWithoutUsuarioInput;
    reportViewLogs?: Prisma.ReportViewLogCreateNestedManyWithoutUsuarioInput;
};
export type UserUncheckedCreateWithoutLogActivitiesInput = {
    id?: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    rolId: number;
    activo?: boolean;
    fechaCreacion?: Date | string;
    auditAccesses?: Prisma.AuditAccessUncheckedCreateNestedManyWithoutUsuarioInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UserCreateOrConnectWithoutLogActivitiesInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutLogActivitiesInput, Prisma.UserUncheckedCreateWithoutLogActivitiesInput>;
};
export type UserUpsertWithoutLogActivitiesInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutLogActivitiesInput, Prisma.UserUncheckedUpdateWithoutLogActivitiesInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutLogActivitiesInput, Prisma.UserUncheckedCreateWithoutLogActivitiesInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutLogActivitiesInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutLogActivitiesInput, Prisma.UserUncheckedUpdateWithoutLogActivitiesInput>;
};
export type UserUpdateWithoutLogActivitiesInput = {
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    rol?: Prisma.RoleUpdateOneRequiredWithoutUsuariosNestedInput;
    auditAccesses?: Prisma.AuditAccessUpdateManyWithoutUsuarioNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUpdateManyWithoutUsuarioNestedInput;
};
export type UserUncheckedUpdateWithoutLogActivitiesInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    rolId?: Prisma.IntFieldUpdateOperationsInput | number;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    auditAccesses?: Prisma.AuditAccessUncheckedUpdateManyWithoutUsuarioNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UserCreateWithoutReportViewLogsInput = {
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    activo?: boolean;
    fechaCreacion?: Date | string;
    rol: Prisma.RoleCreateNestedOneWithoutUsuariosInput;
    auditAccesses?: Prisma.AuditAccessCreateNestedManyWithoutUsuarioInput;
    logActivities?: Prisma.LogActivityCreateNestedManyWithoutUsuarioInput;
};
export type UserUncheckedCreateWithoutReportViewLogsInput = {
    id?: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    rolId: number;
    activo?: boolean;
    fechaCreacion?: Date | string;
    auditAccesses?: Prisma.AuditAccessUncheckedCreateNestedManyWithoutUsuarioInput;
    logActivities?: Prisma.LogActivityUncheckedCreateNestedManyWithoutUsuarioInput;
};
export type UserCreateOrConnectWithoutReportViewLogsInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutReportViewLogsInput, Prisma.UserUncheckedCreateWithoutReportViewLogsInput>;
};
export type UserUpsertWithoutReportViewLogsInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutReportViewLogsInput, Prisma.UserUncheckedUpdateWithoutReportViewLogsInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutReportViewLogsInput, Prisma.UserUncheckedCreateWithoutReportViewLogsInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutReportViewLogsInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutReportViewLogsInput, Prisma.UserUncheckedUpdateWithoutReportViewLogsInput>;
};
export type UserUpdateWithoutReportViewLogsInput = {
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    rol?: Prisma.RoleUpdateOneRequiredWithoutUsuariosNestedInput;
    auditAccesses?: Prisma.AuditAccessUpdateManyWithoutUsuarioNestedInput;
    logActivities?: Prisma.LogActivityUpdateManyWithoutUsuarioNestedInput;
};
export type UserUncheckedUpdateWithoutReportViewLogsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    rolId?: Prisma.IntFieldUpdateOperationsInput | number;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    auditAccesses?: Prisma.AuditAccessUncheckedUpdateManyWithoutUsuarioNestedInput;
    logActivities?: Prisma.LogActivityUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UserCreateManyRolInput = {
    id?: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    activo?: boolean;
    fechaCreacion?: Date | string;
};
export type UserUpdateWithoutRolInput = {
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    auditAccesses?: Prisma.AuditAccessUpdateManyWithoutUsuarioNestedInput;
    logActivities?: Prisma.LogActivityUpdateManyWithoutUsuarioNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUpdateManyWithoutUsuarioNestedInput;
};
export type UserUncheckedUpdateWithoutRolInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    auditAccesses?: Prisma.AuditAccessUncheckedUpdateManyWithoutUsuarioNestedInput;
    logActivities?: Prisma.LogActivityUncheckedUpdateManyWithoutUsuarioNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedUpdateManyWithoutUsuarioNestedInput;
};
export type UserUncheckedUpdateManyWithoutRolInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    nombreCompleto?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    passwordHash?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaCreacion?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserCountOutputType = {
    auditAccesses: number;
    logActivities: number;
    reportViewLogs: number;
};
export type UserCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    auditAccesses?: boolean | UserCountOutputTypeCountAuditAccessesArgs;
    logActivities?: boolean | UserCountOutputTypeCountLogActivitiesArgs;
    reportViewLogs?: boolean | UserCountOutputTypeCountReportViewLogsArgs;
};
export type UserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserCountOutputTypeSelect<ExtArgs> | null;
};
export type UserCountOutputTypeCountAuditAccessesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditAccessWhereInput;
};
export type UserCountOutputTypeCountLogActivitiesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LogActivityWhereInput;
};
export type UserCountOutputTypeCountReportViewLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportViewLogWhereInput;
};
export type UserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nombreCompleto?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    rolId?: boolean;
    activo?: boolean;
    fechaCreacion?: boolean;
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
    auditAccesses?: boolean | Prisma.User$auditAccessesArgs<ExtArgs>;
    logActivities?: boolean | Prisma.User$logActivitiesArgs<ExtArgs>;
    reportViewLogs?: boolean | Prisma.User$reportViewLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["user"]>;
export type UserSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nombreCompleto?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    rolId?: boolean;
    activo?: boolean;
    fechaCreacion?: boolean;
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["user"]>;
export type UserSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    nombreCompleto?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    rolId?: boolean;
    activo?: boolean;
    fechaCreacion?: boolean;
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["user"]>;
export type UserSelectScalar = {
    id?: boolean;
    nombreCompleto?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    rolId?: boolean;
    activo?: boolean;
    fechaCreacion?: boolean;
};
export type UserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "nombreCompleto" | "email" | "passwordHash" | "rolId" | "activo" | "fechaCreacion", ExtArgs["result"]["user"]>;
export type UserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
    auditAccesses?: boolean | Prisma.User$auditAccessesArgs<ExtArgs>;
    logActivities?: boolean | Prisma.User$logActivitiesArgs<ExtArgs>;
    reportViewLogs?: boolean | Prisma.User$reportViewLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
};
export type UserIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
};
export type UserIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
};
export type $UserPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "User";
    objects: {
        rol: Prisma.$RolePayload<ExtArgs>;
        auditAccesses: Prisma.$AuditAccessPayload<ExtArgs>[];
        logActivities: Prisma.$LogActivityPayload<ExtArgs>[];
        reportViewLogs: Prisma.$ReportViewLogPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        nombreCompleto: string;
        email: string;
        passwordHash: string;
        rolId: number;
        activo: boolean;
        fechaCreacion: Date;
    }, ExtArgs["result"]["user"]>;
    composites: {};
};
export type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserPayload, S>;
export type UserCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserCountAggregateInputType | true;
};
export interface UserDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['User'];
        meta: {
            name: 'User';
        };
    };
    findUnique<T extends UserFindUniqueArgs>(args: Prisma.SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UserFindFirstArgs>(args?: Prisma.SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UserFindManyArgs>(args?: Prisma.SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UserCreateArgs>(args: Prisma.SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UserCreateManyArgs>(args?: Prisma.SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UserDeleteArgs>(args: Prisma.SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UserUpdateArgs>(args: Prisma.SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UserDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UserUpdateManyArgs>(args: Prisma.SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UserUpsertArgs>(args: Prisma.SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UserCountArgs>(args?: Prisma.Subset<T, UserCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserCountAggregateOutputType> : number>;
    aggregate<T extends UserAggregateArgs>(args: Prisma.Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>;
    groupBy<T extends UserGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserGroupByArgs['orderBy'];
    } : {
        orderBy?: UserGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UserFieldRefs;
}
export interface Prisma__UserClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    rol<T extends Prisma.RoleDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RoleDefaultArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    auditAccesses<T extends Prisma.User$auditAccessesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$auditAccessesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    logActivities<T extends Prisma.User$logActivitiesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$logActivitiesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    reportViewLogs<T extends Prisma.User$reportViewLogsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$reportViewLogsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UserFieldRefs {
    readonly id: Prisma.FieldRef<"User", 'Int'>;
    readonly nombreCompleto: Prisma.FieldRef<"User", 'String'>;
    readonly email: Prisma.FieldRef<"User", 'String'>;
    readonly passwordHash: Prisma.FieldRef<"User", 'String'>;
    readonly rolId: Prisma.FieldRef<"User", 'Int'>;
    readonly activo: Prisma.FieldRef<"User", 'Boolean'>;
    readonly fechaCreacion: Prisma.FieldRef<"User", 'DateTime'>;
}
export type UserFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
};
export type UserCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
    skipDuplicates?: boolean;
};
export type UserCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.UserIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type UserUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
    where: Prisma.UserWhereUniqueInput;
};
export type UserUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type UserUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
    include?: Prisma.UserIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type UserUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
};
export type UserDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type User$auditAccessesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelect<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    include?: Prisma.AuditAccessInclude<ExtArgs> | null;
    where?: Prisma.AuditAccessWhereInput;
    orderBy?: Prisma.AuditAccessOrderByWithRelationInput | Prisma.AuditAccessOrderByWithRelationInput[];
    cursor?: Prisma.AuditAccessWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuditAccessScalarFieldEnum | Prisma.AuditAccessScalarFieldEnum[];
};
export type User$logActivitiesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelect<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    include?: Prisma.LogActivityInclude<ExtArgs> | null;
    where?: Prisma.LogActivityWhereInput;
    orderBy?: Prisma.LogActivityOrderByWithRelationInput | Prisma.LogActivityOrderByWithRelationInput[];
    cursor?: Prisma.LogActivityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.LogActivityScalarFieldEnum | Prisma.LogActivityScalarFieldEnum[];
};
export type User$reportViewLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    include?: Prisma.ReportViewLogInclude<ExtArgs> | null;
    where?: Prisma.ReportViewLogWhereInput;
    orderBy?: Prisma.ReportViewLogOrderByWithRelationInput | Prisma.ReportViewLogOrderByWithRelationInput[];
    cursor?: Prisma.ReportViewLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReportViewLogScalarFieldEnum | Prisma.ReportViewLogScalarFieldEnum[];
};
export type UserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
};
export {};
