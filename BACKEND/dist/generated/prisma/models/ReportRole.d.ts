import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
export type ReportRoleModel = runtime.Types.Result.DefaultSelection<Prisma.$ReportRolePayload>;
export type AggregateReportRole = {
    _count: ReportRoleCountAggregateOutputType | null;
    _avg: ReportRoleAvgAggregateOutputType | null;
    _sum: ReportRoleSumAggregateOutputType | null;
    _min: ReportRoleMinAggregateOutputType | null;
    _max: ReportRoleMaxAggregateOutputType | null;
};
export type ReportRoleAvgAggregateOutputType = {
    reporteId: number | null;
    rolId: number | null;
};
export type ReportRoleSumAggregateOutputType = {
    reporteId: number | null;
    rolId: number | null;
};
export type ReportRoleMinAggregateOutputType = {
    reporteId: number | null;
    rolId: number | null;
};
export type ReportRoleMaxAggregateOutputType = {
    reporteId: number | null;
    rolId: number | null;
};
export type ReportRoleCountAggregateOutputType = {
    reporteId: number;
    rolId: number;
    _all: number;
};
export type ReportRoleAvgAggregateInputType = {
    reporteId?: true;
    rolId?: true;
};
export type ReportRoleSumAggregateInputType = {
    reporteId?: true;
    rolId?: true;
};
export type ReportRoleMinAggregateInputType = {
    reporteId?: true;
    rolId?: true;
};
export type ReportRoleMaxAggregateInputType = {
    reporteId?: true;
    rolId?: true;
};
export type ReportRoleCountAggregateInputType = {
    reporteId?: true;
    rolId?: true;
    _all?: true;
};
export type ReportRoleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportRoleWhereInput;
    orderBy?: Prisma.ReportRoleOrderByWithRelationInput | Prisma.ReportRoleOrderByWithRelationInput[];
    cursor?: Prisma.ReportRoleWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ReportRoleCountAggregateInputType;
    _avg?: ReportRoleAvgAggregateInputType;
    _sum?: ReportRoleSumAggregateInputType;
    _min?: ReportRoleMinAggregateInputType;
    _max?: ReportRoleMaxAggregateInputType;
};
export type GetReportRoleAggregateType<T extends ReportRoleAggregateArgs> = {
    [P in keyof T & keyof AggregateReportRole]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateReportRole[P]> : Prisma.GetScalarType<T[P], AggregateReportRole[P]>;
};
export type ReportRoleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportRoleWhereInput;
    orderBy?: Prisma.ReportRoleOrderByWithAggregationInput | Prisma.ReportRoleOrderByWithAggregationInput[];
    by: Prisma.ReportRoleScalarFieldEnum[] | Prisma.ReportRoleScalarFieldEnum;
    having?: Prisma.ReportRoleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ReportRoleCountAggregateInputType | true;
    _avg?: ReportRoleAvgAggregateInputType;
    _sum?: ReportRoleSumAggregateInputType;
    _min?: ReportRoleMinAggregateInputType;
    _max?: ReportRoleMaxAggregateInputType;
};
export type ReportRoleGroupByOutputType = {
    reporteId: number;
    rolId: number;
    _count: ReportRoleCountAggregateOutputType | null;
    _avg: ReportRoleAvgAggregateOutputType | null;
    _sum: ReportRoleSumAggregateOutputType | null;
    _min: ReportRoleMinAggregateOutputType | null;
    _max: ReportRoleMaxAggregateOutputType | null;
};
type GetReportRoleGroupByPayload<T extends ReportRoleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ReportRoleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ReportRoleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ReportRoleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ReportRoleGroupByOutputType[P]>;
}>>;
export type ReportRoleWhereInput = {
    AND?: Prisma.ReportRoleWhereInput | Prisma.ReportRoleWhereInput[];
    OR?: Prisma.ReportRoleWhereInput[];
    NOT?: Prisma.ReportRoleWhereInput | Prisma.ReportRoleWhereInput[];
    reporteId?: Prisma.IntFilter<"ReportRole"> | number;
    rolId?: Prisma.IntFilter<"ReportRole"> | number;
    reporte?: Prisma.XOR<Prisma.ReportScalarRelationFilter, Prisma.ReportWhereInput>;
    rol?: Prisma.XOR<Prisma.RoleScalarRelationFilter, Prisma.RoleWhereInput>;
};
export type ReportRoleOrderByWithRelationInput = {
    reporteId?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
    reporte?: Prisma.ReportOrderByWithRelationInput;
    rol?: Prisma.RoleOrderByWithRelationInput;
};
export type ReportRoleWhereUniqueInput = Prisma.AtLeast<{
    reporteId_rolId?: Prisma.ReportRoleReporteIdRolIdCompoundUniqueInput;
    AND?: Prisma.ReportRoleWhereInput | Prisma.ReportRoleWhereInput[];
    OR?: Prisma.ReportRoleWhereInput[];
    NOT?: Prisma.ReportRoleWhereInput | Prisma.ReportRoleWhereInput[];
    reporteId?: Prisma.IntFilter<"ReportRole"> | number;
    rolId?: Prisma.IntFilter<"ReportRole"> | number;
    reporte?: Prisma.XOR<Prisma.ReportScalarRelationFilter, Prisma.ReportWhereInput>;
    rol?: Prisma.XOR<Prisma.RoleScalarRelationFilter, Prisma.RoleWhereInput>;
}, "reporteId_rolId">;
export type ReportRoleOrderByWithAggregationInput = {
    reporteId?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
    _count?: Prisma.ReportRoleCountOrderByAggregateInput;
    _avg?: Prisma.ReportRoleAvgOrderByAggregateInput;
    _max?: Prisma.ReportRoleMaxOrderByAggregateInput;
    _min?: Prisma.ReportRoleMinOrderByAggregateInput;
    _sum?: Prisma.ReportRoleSumOrderByAggregateInput;
};
export type ReportRoleScalarWhereWithAggregatesInput = {
    AND?: Prisma.ReportRoleScalarWhereWithAggregatesInput | Prisma.ReportRoleScalarWhereWithAggregatesInput[];
    OR?: Prisma.ReportRoleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ReportRoleScalarWhereWithAggregatesInput | Prisma.ReportRoleScalarWhereWithAggregatesInput[];
    reporteId?: Prisma.IntWithAggregatesFilter<"ReportRole"> | number;
    rolId?: Prisma.IntWithAggregatesFilter<"ReportRole"> | number;
};
export type ReportRoleCreateInput = {
    reporte: Prisma.ReportCreateNestedOneWithoutReportesRolesInput;
    rol: Prisma.RoleCreateNestedOneWithoutReportesRolesInput;
};
export type ReportRoleUncheckedCreateInput = {
    reporteId: number;
    rolId: number;
};
export type ReportRoleUpdateInput = {
    reporte?: Prisma.ReportUpdateOneRequiredWithoutReportesRolesNestedInput;
    rol?: Prisma.RoleUpdateOneRequiredWithoutReportesRolesNestedInput;
};
export type ReportRoleUncheckedUpdateInput = {
    reporteId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ReportRoleCreateManyInput = {
    reporteId: number;
    rolId: number;
};
export type ReportRoleUpdateManyMutationInput = {};
export type ReportRoleUncheckedUpdateManyInput = {
    reporteId?: Prisma.IntFieldUpdateOperationsInput | number;
    rolId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ReportRoleListRelationFilter = {
    every?: Prisma.ReportRoleWhereInput;
    some?: Prisma.ReportRoleWhereInput;
    none?: Prisma.ReportRoleWhereInput;
};
export type ReportRoleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ReportRoleReporteIdRolIdCompoundUniqueInput = {
    reporteId: number;
    rolId: number;
};
export type ReportRoleCountOrderByAggregateInput = {
    reporteId?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
};
export type ReportRoleAvgOrderByAggregateInput = {
    reporteId?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
};
export type ReportRoleMaxOrderByAggregateInput = {
    reporteId?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
};
export type ReportRoleMinOrderByAggregateInput = {
    reporteId?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
};
export type ReportRoleSumOrderByAggregateInput = {
    reporteId?: Prisma.SortOrder;
    rolId?: Prisma.SortOrder;
};
export type ReportRoleCreateNestedManyWithoutRolInput = {
    create?: Prisma.XOR<Prisma.ReportRoleCreateWithoutRolInput, Prisma.ReportRoleUncheckedCreateWithoutRolInput> | Prisma.ReportRoleCreateWithoutRolInput[] | Prisma.ReportRoleUncheckedCreateWithoutRolInput[];
    connectOrCreate?: Prisma.ReportRoleCreateOrConnectWithoutRolInput | Prisma.ReportRoleCreateOrConnectWithoutRolInput[];
    createMany?: Prisma.ReportRoleCreateManyRolInputEnvelope;
    connect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
};
export type ReportRoleUncheckedCreateNestedManyWithoutRolInput = {
    create?: Prisma.XOR<Prisma.ReportRoleCreateWithoutRolInput, Prisma.ReportRoleUncheckedCreateWithoutRolInput> | Prisma.ReportRoleCreateWithoutRolInput[] | Prisma.ReportRoleUncheckedCreateWithoutRolInput[];
    connectOrCreate?: Prisma.ReportRoleCreateOrConnectWithoutRolInput | Prisma.ReportRoleCreateOrConnectWithoutRolInput[];
    createMany?: Prisma.ReportRoleCreateManyRolInputEnvelope;
    connect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
};
export type ReportRoleUpdateManyWithoutRolNestedInput = {
    create?: Prisma.XOR<Prisma.ReportRoleCreateWithoutRolInput, Prisma.ReportRoleUncheckedCreateWithoutRolInput> | Prisma.ReportRoleCreateWithoutRolInput[] | Prisma.ReportRoleUncheckedCreateWithoutRolInput[];
    connectOrCreate?: Prisma.ReportRoleCreateOrConnectWithoutRolInput | Prisma.ReportRoleCreateOrConnectWithoutRolInput[];
    upsert?: Prisma.ReportRoleUpsertWithWhereUniqueWithoutRolInput | Prisma.ReportRoleUpsertWithWhereUniqueWithoutRolInput[];
    createMany?: Prisma.ReportRoleCreateManyRolInputEnvelope;
    set?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    disconnect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    delete?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    connect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    update?: Prisma.ReportRoleUpdateWithWhereUniqueWithoutRolInput | Prisma.ReportRoleUpdateWithWhereUniqueWithoutRolInput[];
    updateMany?: Prisma.ReportRoleUpdateManyWithWhereWithoutRolInput | Prisma.ReportRoleUpdateManyWithWhereWithoutRolInput[];
    deleteMany?: Prisma.ReportRoleScalarWhereInput | Prisma.ReportRoleScalarWhereInput[];
};
export type ReportRoleUncheckedUpdateManyWithoutRolNestedInput = {
    create?: Prisma.XOR<Prisma.ReportRoleCreateWithoutRolInput, Prisma.ReportRoleUncheckedCreateWithoutRolInput> | Prisma.ReportRoleCreateWithoutRolInput[] | Prisma.ReportRoleUncheckedCreateWithoutRolInput[];
    connectOrCreate?: Prisma.ReportRoleCreateOrConnectWithoutRolInput | Prisma.ReportRoleCreateOrConnectWithoutRolInput[];
    upsert?: Prisma.ReportRoleUpsertWithWhereUniqueWithoutRolInput | Prisma.ReportRoleUpsertWithWhereUniqueWithoutRolInput[];
    createMany?: Prisma.ReportRoleCreateManyRolInputEnvelope;
    set?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    disconnect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    delete?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    connect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    update?: Prisma.ReportRoleUpdateWithWhereUniqueWithoutRolInput | Prisma.ReportRoleUpdateWithWhereUniqueWithoutRolInput[];
    updateMany?: Prisma.ReportRoleUpdateManyWithWhereWithoutRolInput | Prisma.ReportRoleUpdateManyWithWhereWithoutRolInput[];
    deleteMany?: Prisma.ReportRoleScalarWhereInput | Prisma.ReportRoleScalarWhereInput[];
};
export type ReportRoleCreateNestedManyWithoutReporteInput = {
    create?: Prisma.XOR<Prisma.ReportRoleCreateWithoutReporteInput, Prisma.ReportRoleUncheckedCreateWithoutReporteInput> | Prisma.ReportRoleCreateWithoutReporteInput[] | Prisma.ReportRoleUncheckedCreateWithoutReporteInput[];
    connectOrCreate?: Prisma.ReportRoleCreateOrConnectWithoutReporteInput | Prisma.ReportRoleCreateOrConnectWithoutReporteInput[];
    createMany?: Prisma.ReportRoleCreateManyReporteInputEnvelope;
    connect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
};
export type ReportRoleUncheckedCreateNestedManyWithoutReporteInput = {
    create?: Prisma.XOR<Prisma.ReportRoleCreateWithoutReporteInput, Prisma.ReportRoleUncheckedCreateWithoutReporteInput> | Prisma.ReportRoleCreateWithoutReporteInput[] | Prisma.ReportRoleUncheckedCreateWithoutReporteInput[];
    connectOrCreate?: Prisma.ReportRoleCreateOrConnectWithoutReporteInput | Prisma.ReportRoleCreateOrConnectWithoutReporteInput[];
    createMany?: Prisma.ReportRoleCreateManyReporteInputEnvelope;
    connect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
};
export type ReportRoleUpdateManyWithoutReporteNestedInput = {
    create?: Prisma.XOR<Prisma.ReportRoleCreateWithoutReporteInput, Prisma.ReportRoleUncheckedCreateWithoutReporteInput> | Prisma.ReportRoleCreateWithoutReporteInput[] | Prisma.ReportRoleUncheckedCreateWithoutReporteInput[];
    connectOrCreate?: Prisma.ReportRoleCreateOrConnectWithoutReporteInput | Prisma.ReportRoleCreateOrConnectWithoutReporteInput[];
    upsert?: Prisma.ReportRoleUpsertWithWhereUniqueWithoutReporteInput | Prisma.ReportRoleUpsertWithWhereUniqueWithoutReporteInput[];
    createMany?: Prisma.ReportRoleCreateManyReporteInputEnvelope;
    set?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    disconnect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    delete?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    connect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    update?: Prisma.ReportRoleUpdateWithWhereUniqueWithoutReporteInput | Prisma.ReportRoleUpdateWithWhereUniqueWithoutReporteInput[];
    updateMany?: Prisma.ReportRoleUpdateManyWithWhereWithoutReporteInput | Prisma.ReportRoleUpdateManyWithWhereWithoutReporteInput[];
    deleteMany?: Prisma.ReportRoleScalarWhereInput | Prisma.ReportRoleScalarWhereInput[];
};
export type ReportRoleUncheckedUpdateManyWithoutReporteNestedInput = {
    create?: Prisma.XOR<Prisma.ReportRoleCreateWithoutReporteInput, Prisma.ReportRoleUncheckedCreateWithoutReporteInput> | Prisma.ReportRoleCreateWithoutReporteInput[] | Prisma.ReportRoleUncheckedCreateWithoutReporteInput[];
    connectOrCreate?: Prisma.ReportRoleCreateOrConnectWithoutReporteInput | Prisma.ReportRoleCreateOrConnectWithoutReporteInput[];
    upsert?: Prisma.ReportRoleUpsertWithWhereUniqueWithoutReporteInput | Prisma.ReportRoleUpsertWithWhereUniqueWithoutReporteInput[];
    createMany?: Prisma.ReportRoleCreateManyReporteInputEnvelope;
    set?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    disconnect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    delete?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    connect?: Prisma.ReportRoleWhereUniqueInput | Prisma.ReportRoleWhereUniqueInput[];
    update?: Prisma.ReportRoleUpdateWithWhereUniqueWithoutReporteInput | Prisma.ReportRoleUpdateWithWhereUniqueWithoutReporteInput[];
    updateMany?: Prisma.ReportRoleUpdateManyWithWhereWithoutReporteInput | Prisma.ReportRoleUpdateManyWithWhereWithoutReporteInput[];
    deleteMany?: Prisma.ReportRoleScalarWhereInput | Prisma.ReportRoleScalarWhereInput[];
};
export type ReportRoleCreateWithoutRolInput = {
    reporte: Prisma.ReportCreateNestedOneWithoutReportesRolesInput;
};
export type ReportRoleUncheckedCreateWithoutRolInput = {
    reporteId: number;
};
export type ReportRoleCreateOrConnectWithoutRolInput = {
    where: Prisma.ReportRoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReportRoleCreateWithoutRolInput, Prisma.ReportRoleUncheckedCreateWithoutRolInput>;
};
export type ReportRoleCreateManyRolInputEnvelope = {
    data: Prisma.ReportRoleCreateManyRolInput | Prisma.ReportRoleCreateManyRolInput[];
    skipDuplicates?: boolean;
};
export type ReportRoleUpsertWithWhereUniqueWithoutRolInput = {
    where: Prisma.ReportRoleWhereUniqueInput;
    update: Prisma.XOR<Prisma.ReportRoleUpdateWithoutRolInput, Prisma.ReportRoleUncheckedUpdateWithoutRolInput>;
    create: Prisma.XOR<Prisma.ReportRoleCreateWithoutRolInput, Prisma.ReportRoleUncheckedCreateWithoutRolInput>;
};
export type ReportRoleUpdateWithWhereUniqueWithoutRolInput = {
    where: Prisma.ReportRoleWhereUniqueInput;
    data: Prisma.XOR<Prisma.ReportRoleUpdateWithoutRolInput, Prisma.ReportRoleUncheckedUpdateWithoutRolInput>;
};
export type ReportRoleUpdateManyWithWhereWithoutRolInput = {
    where: Prisma.ReportRoleScalarWhereInput;
    data: Prisma.XOR<Prisma.ReportRoleUpdateManyMutationInput, Prisma.ReportRoleUncheckedUpdateManyWithoutRolInput>;
};
export type ReportRoleScalarWhereInput = {
    AND?: Prisma.ReportRoleScalarWhereInput | Prisma.ReportRoleScalarWhereInput[];
    OR?: Prisma.ReportRoleScalarWhereInput[];
    NOT?: Prisma.ReportRoleScalarWhereInput | Prisma.ReportRoleScalarWhereInput[];
    reporteId?: Prisma.IntFilter<"ReportRole"> | number;
    rolId?: Prisma.IntFilter<"ReportRole"> | number;
};
export type ReportRoleCreateWithoutReporteInput = {
    rol: Prisma.RoleCreateNestedOneWithoutReportesRolesInput;
};
export type ReportRoleUncheckedCreateWithoutReporteInput = {
    rolId: number;
};
export type ReportRoleCreateOrConnectWithoutReporteInput = {
    where: Prisma.ReportRoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReportRoleCreateWithoutReporteInput, Prisma.ReportRoleUncheckedCreateWithoutReporteInput>;
};
export type ReportRoleCreateManyReporteInputEnvelope = {
    data: Prisma.ReportRoleCreateManyReporteInput | Prisma.ReportRoleCreateManyReporteInput[];
    skipDuplicates?: boolean;
};
export type ReportRoleUpsertWithWhereUniqueWithoutReporteInput = {
    where: Prisma.ReportRoleWhereUniqueInput;
    update: Prisma.XOR<Prisma.ReportRoleUpdateWithoutReporteInput, Prisma.ReportRoleUncheckedUpdateWithoutReporteInput>;
    create: Prisma.XOR<Prisma.ReportRoleCreateWithoutReporteInput, Prisma.ReportRoleUncheckedCreateWithoutReporteInput>;
};
export type ReportRoleUpdateWithWhereUniqueWithoutReporteInput = {
    where: Prisma.ReportRoleWhereUniqueInput;
    data: Prisma.XOR<Prisma.ReportRoleUpdateWithoutReporteInput, Prisma.ReportRoleUncheckedUpdateWithoutReporteInput>;
};
export type ReportRoleUpdateManyWithWhereWithoutReporteInput = {
    where: Prisma.ReportRoleScalarWhereInput;
    data: Prisma.XOR<Prisma.ReportRoleUpdateManyMutationInput, Prisma.ReportRoleUncheckedUpdateManyWithoutReporteInput>;
};
export type ReportRoleCreateManyRolInput = {
    reporteId: number;
};
export type ReportRoleUpdateWithoutRolInput = {
    reporte?: Prisma.ReportUpdateOneRequiredWithoutReportesRolesNestedInput;
};
export type ReportRoleUncheckedUpdateWithoutRolInput = {
    reporteId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ReportRoleUncheckedUpdateManyWithoutRolInput = {
    reporteId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ReportRoleCreateManyReporteInput = {
    rolId: number;
};
export type ReportRoleUpdateWithoutReporteInput = {
    rol?: Prisma.RoleUpdateOneRequiredWithoutReportesRolesNestedInput;
};
export type ReportRoleUncheckedUpdateWithoutReporteInput = {
    rolId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ReportRoleUncheckedUpdateManyWithoutReporteInput = {
    rolId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ReportRoleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    reporteId?: boolean;
    rolId?: boolean;
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reportRole"]>;
export type ReportRoleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    reporteId?: boolean;
    rolId?: boolean;
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reportRole"]>;
export type ReportRoleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    reporteId?: boolean;
    rolId?: boolean;
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reportRole"]>;
export type ReportRoleSelectScalar = {
    reporteId?: boolean;
    rolId?: boolean;
};
export type ReportRoleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"reporteId" | "rolId", ExtArgs["result"]["reportRole"]>;
export type ReportRoleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
};
export type ReportRoleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
};
export type ReportRoleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
    rol?: boolean | Prisma.RoleDefaultArgs<ExtArgs>;
};
export type $ReportRolePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ReportRole";
    objects: {
        reporte: Prisma.$ReportPayload<ExtArgs>;
        rol: Prisma.$RolePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        reporteId: number;
        rolId: number;
    }, ExtArgs["result"]["reportRole"]>;
    composites: {};
};
export type ReportRoleGetPayload<S extends boolean | null | undefined | ReportRoleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ReportRolePayload, S>;
export type ReportRoleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ReportRoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ReportRoleCountAggregateInputType | true;
};
export interface ReportRoleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ReportRole'];
        meta: {
            name: 'ReportRole';
        };
    };
    findUnique<T extends ReportRoleFindUniqueArgs>(args: Prisma.SelectSubset<T, ReportRoleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ReportRoleClient<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ReportRoleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ReportRoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReportRoleClient<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ReportRoleFindFirstArgs>(args?: Prisma.SelectSubset<T, ReportRoleFindFirstArgs<ExtArgs>>): Prisma.Prisma__ReportRoleClient<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ReportRoleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ReportRoleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReportRoleClient<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ReportRoleFindManyArgs>(args?: Prisma.SelectSubset<T, ReportRoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ReportRoleCreateArgs>(args: Prisma.SelectSubset<T, ReportRoleCreateArgs<ExtArgs>>): Prisma.Prisma__ReportRoleClient<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ReportRoleCreateManyArgs>(args?: Prisma.SelectSubset<T, ReportRoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ReportRoleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ReportRoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ReportRoleDeleteArgs>(args: Prisma.SelectSubset<T, ReportRoleDeleteArgs<ExtArgs>>): Prisma.Prisma__ReportRoleClient<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ReportRoleUpdateArgs>(args: Prisma.SelectSubset<T, ReportRoleUpdateArgs<ExtArgs>>): Prisma.Prisma__ReportRoleClient<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ReportRoleDeleteManyArgs>(args?: Prisma.SelectSubset<T, ReportRoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ReportRoleUpdateManyArgs>(args: Prisma.SelectSubset<T, ReportRoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ReportRoleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ReportRoleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ReportRoleUpsertArgs>(args: Prisma.SelectSubset<T, ReportRoleUpsertArgs<ExtArgs>>): Prisma.Prisma__ReportRoleClient<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ReportRoleCountArgs>(args?: Prisma.Subset<T, ReportRoleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ReportRoleCountAggregateOutputType> : number>;
    aggregate<T extends ReportRoleAggregateArgs>(args: Prisma.Subset<T, ReportRoleAggregateArgs>): Prisma.PrismaPromise<GetReportRoleAggregateType<T>>;
    groupBy<T extends ReportRoleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ReportRoleGroupByArgs['orderBy'];
    } : {
        orderBy?: ReportRoleGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ReportRoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ReportRoleFieldRefs;
}
export interface Prisma__ReportRoleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    reporte<T extends Prisma.ReportDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ReportDefaultArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    rol<T extends Prisma.RoleDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RoleDefaultArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ReportRoleFieldRefs {
    readonly reporteId: Prisma.FieldRef<"ReportRole", 'Int'>;
    readonly rolId: Prisma.FieldRef<"ReportRole", 'Int'>;
}
export type ReportRoleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
    where: Prisma.ReportRoleWhereUniqueInput;
};
export type ReportRoleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
    where: Prisma.ReportRoleWhereUniqueInput;
};
export type ReportRoleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
    where?: Prisma.ReportRoleWhereInput;
    orderBy?: Prisma.ReportRoleOrderByWithRelationInput | Prisma.ReportRoleOrderByWithRelationInput[];
    cursor?: Prisma.ReportRoleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReportRoleScalarFieldEnum | Prisma.ReportRoleScalarFieldEnum[];
};
export type ReportRoleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
    where?: Prisma.ReportRoleWhereInput;
    orderBy?: Prisma.ReportRoleOrderByWithRelationInput | Prisma.ReportRoleOrderByWithRelationInput[];
    cursor?: Prisma.ReportRoleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReportRoleScalarFieldEnum | Prisma.ReportRoleScalarFieldEnum[];
};
export type ReportRoleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
    where?: Prisma.ReportRoleWhereInput;
    orderBy?: Prisma.ReportRoleOrderByWithRelationInput | Prisma.ReportRoleOrderByWithRelationInput[];
    cursor?: Prisma.ReportRoleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReportRoleScalarFieldEnum | Prisma.ReportRoleScalarFieldEnum[];
};
export type ReportRoleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReportRoleCreateInput, Prisma.ReportRoleUncheckedCreateInput>;
};
export type ReportRoleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ReportRoleCreateManyInput | Prisma.ReportRoleCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ReportRoleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    data: Prisma.ReportRoleCreateManyInput | Prisma.ReportRoleCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ReportRoleIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ReportRoleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReportRoleUpdateInput, Prisma.ReportRoleUncheckedUpdateInput>;
    where: Prisma.ReportRoleWhereUniqueInput;
};
export type ReportRoleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ReportRoleUpdateManyMutationInput, Prisma.ReportRoleUncheckedUpdateManyInput>;
    where?: Prisma.ReportRoleWhereInput;
    limit?: number;
};
export type ReportRoleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReportRoleUpdateManyMutationInput, Prisma.ReportRoleUncheckedUpdateManyInput>;
    where?: Prisma.ReportRoleWhereInput;
    limit?: number;
    include?: Prisma.ReportRoleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ReportRoleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
    where: Prisma.ReportRoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReportRoleCreateInput, Prisma.ReportRoleUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ReportRoleUpdateInput, Prisma.ReportRoleUncheckedUpdateInput>;
};
export type ReportRoleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
    where: Prisma.ReportRoleWhereUniqueInput;
};
export type ReportRoleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportRoleWhereInput;
    limit?: number;
};
export type ReportRoleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportRoleSelect<ExtArgs> | null;
    omit?: Prisma.ReportRoleOmit<ExtArgs> | null;
    include?: Prisma.ReportRoleInclude<ExtArgs> | null;
};
export {};
