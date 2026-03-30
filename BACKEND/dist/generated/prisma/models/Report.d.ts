import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
export type ReportModel = runtime.Types.Result.DefaultSelection<Prisma.$ReportPayload>;
export type AggregateReport = {
    _count: ReportCountAggregateOutputType | null;
    _avg: ReportAvgAggregateOutputType | null;
    _sum: ReportSumAggregateOutputType | null;
    _min: ReportMinAggregateOutputType | null;
    _max: ReportMaxAggregateOutputType | null;
};
export type ReportAvgAggregateOutputType = {
    id: number | null;
};
export type ReportSumAggregateOutputType = {
    id: number | null;
};
export type ReportMinAggregateOutputType = {
    id: number | null;
    titulo: string | null;
    descripcion: string | null;
    urlIframe: string | null;
    activo: boolean | null;
    fechaRegistro: Date | null;
};
export type ReportMaxAggregateOutputType = {
    id: number | null;
    titulo: string | null;
    descripcion: string | null;
    urlIframe: string | null;
    activo: boolean | null;
    fechaRegistro: Date | null;
};
export type ReportCountAggregateOutputType = {
    id: number;
    titulo: number;
    descripcion: number;
    urlIframe: number;
    activo: number;
    fechaRegistro: number;
    _all: number;
};
export type ReportAvgAggregateInputType = {
    id?: true;
};
export type ReportSumAggregateInputType = {
    id?: true;
};
export type ReportMinAggregateInputType = {
    id?: true;
    titulo?: true;
    descripcion?: true;
    urlIframe?: true;
    activo?: true;
    fechaRegistro?: true;
};
export type ReportMaxAggregateInputType = {
    id?: true;
    titulo?: true;
    descripcion?: true;
    urlIframe?: true;
    activo?: true;
    fechaRegistro?: true;
};
export type ReportCountAggregateInputType = {
    id?: true;
    titulo?: true;
    descripcion?: true;
    urlIframe?: true;
    activo?: true;
    fechaRegistro?: true;
    _all?: true;
};
export type ReportAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportWhereInput;
    orderBy?: Prisma.ReportOrderByWithRelationInput | Prisma.ReportOrderByWithRelationInput[];
    cursor?: Prisma.ReportWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ReportCountAggregateInputType;
    _avg?: ReportAvgAggregateInputType;
    _sum?: ReportSumAggregateInputType;
    _min?: ReportMinAggregateInputType;
    _max?: ReportMaxAggregateInputType;
};
export type GetReportAggregateType<T extends ReportAggregateArgs> = {
    [P in keyof T & keyof AggregateReport]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateReport[P]> : Prisma.GetScalarType<T[P], AggregateReport[P]>;
};
export type ReportGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportWhereInput;
    orderBy?: Prisma.ReportOrderByWithAggregationInput | Prisma.ReportOrderByWithAggregationInput[];
    by: Prisma.ReportScalarFieldEnum[] | Prisma.ReportScalarFieldEnum;
    having?: Prisma.ReportScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ReportCountAggregateInputType | true;
    _avg?: ReportAvgAggregateInputType;
    _sum?: ReportSumAggregateInputType;
    _min?: ReportMinAggregateInputType;
    _max?: ReportMaxAggregateInputType;
};
export type ReportGroupByOutputType = {
    id: number;
    titulo: string;
    descripcion: string | null;
    urlIframe: string;
    activo: boolean;
    fechaRegistro: Date;
    _count: ReportCountAggregateOutputType | null;
    _avg: ReportAvgAggregateOutputType | null;
    _sum: ReportSumAggregateOutputType | null;
    _min: ReportMinAggregateOutputType | null;
    _max: ReportMaxAggregateOutputType | null;
};
type GetReportGroupByPayload<T extends ReportGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ReportGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ReportGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ReportGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ReportGroupByOutputType[P]>;
}>>;
export type ReportWhereInput = {
    AND?: Prisma.ReportWhereInput | Prisma.ReportWhereInput[];
    OR?: Prisma.ReportWhereInput[];
    NOT?: Prisma.ReportWhereInput | Prisma.ReportWhereInput[];
    id?: Prisma.IntFilter<"Report"> | number;
    titulo?: Prisma.StringFilter<"Report"> | string;
    descripcion?: Prisma.StringNullableFilter<"Report"> | string | null;
    urlIframe?: Prisma.StringFilter<"Report"> | string;
    activo?: Prisma.BoolFilter<"Report"> | boolean;
    fechaRegistro?: Prisma.DateTimeFilter<"Report"> | Date | string;
    reportesRoles?: Prisma.ReportRoleListRelationFilter;
    reportViewLogs?: Prisma.ReportViewLogListRelationFilter;
};
export type ReportOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
    descripcion?: Prisma.SortOrderInput | Prisma.SortOrder;
    urlIframe?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaRegistro?: Prisma.SortOrder;
    reportesRoles?: Prisma.ReportRoleOrderByRelationAggregateInput;
    reportViewLogs?: Prisma.ReportViewLogOrderByRelationAggregateInput;
};
export type ReportWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.ReportWhereInput | Prisma.ReportWhereInput[];
    OR?: Prisma.ReportWhereInput[];
    NOT?: Prisma.ReportWhereInput | Prisma.ReportWhereInput[];
    titulo?: Prisma.StringFilter<"Report"> | string;
    descripcion?: Prisma.StringNullableFilter<"Report"> | string | null;
    urlIframe?: Prisma.StringFilter<"Report"> | string;
    activo?: Prisma.BoolFilter<"Report"> | boolean;
    fechaRegistro?: Prisma.DateTimeFilter<"Report"> | Date | string;
    reportesRoles?: Prisma.ReportRoleListRelationFilter;
    reportViewLogs?: Prisma.ReportViewLogListRelationFilter;
}, "id">;
export type ReportOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
    descripcion?: Prisma.SortOrderInput | Prisma.SortOrder;
    urlIframe?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaRegistro?: Prisma.SortOrder;
    _count?: Prisma.ReportCountOrderByAggregateInput;
    _avg?: Prisma.ReportAvgOrderByAggregateInput;
    _max?: Prisma.ReportMaxOrderByAggregateInput;
    _min?: Prisma.ReportMinOrderByAggregateInput;
    _sum?: Prisma.ReportSumOrderByAggregateInput;
};
export type ReportScalarWhereWithAggregatesInput = {
    AND?: Prisma.ReportScalarWhereWithAggregatesInput | Prisma.ReportScalarWhereWithAggregatesInput[];
    OR?: Prisma.ReportScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ReportScalarWhereWithAggregatesInput | Prisma.ReportScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Report"> | number;
    titulo?: Prisma.StringWithAggregatesFilter<"Report"> | string;
    descripcion?: Prisma.StringNullableWithAggregatesFilter<"Report"> | string | null;
    urlIframe?: Prisma.StringWithAggregatesFilter<"Report"> | string;
    activo?: Prisma.BoolWithAggregatesFilter<"Report"> | boolean;
    fechaRegistro?: Prisma.DateTimeWithAggregatesFilter<"Report"> | Date | string;
};
export type ReportCreateInput = {
    titulo: string;
    descripcion?: string | null;
    urlIframe: string;
    activo?: boolean;
    fechaRegistro?: Date | string;
    reportesRoles?: Prisma.ReportRoleCreateNestedManyWithoutReporteInput;
    reportViewLogs?: Prisma.ReportViewLogCreateNestedManyWithoutReporteInput;
};
export type ReportUncheckedCreateInput = {
    id?: number;
    titulo: string;
    descripcion?: string | null;
    urlIframe: string;
    activo?: boolean;
    fechaRegistro?: Date | string;
    reportesRoles?: Prisma.ReportRoleUncheckedCreateNestedManyWithoutReporteInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedCreateNestedManyWithoutReporteInput;
};
export type ReportUpdateInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    descripcion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    urlIframe?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaRegistro?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    reportesRoles?: Prisma.ReportRoleUpdateManyWithoutReporteNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUpdateManyWithoutReporteNestedInput;
};
export type ReportUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    descripcion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    urlIframe?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaRegistro?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    reportesRoles?: Prisma.ReportRoleUncheckedUpdateManyWithoutReporteNestedInput;
    reportViewLogs?: Prisma.ReportViewLogUncheckedUpdateManyWithoutReporteNestedInput;
};
export type ReportCreateManyInput = {
    id?: number;
    titulo: string;
    descripcion?: string | null;
    urlIframe: string;
    activo?: boolean;
    fechaRegistro?: Date | string;
};
export type ReportUpdateManyMutationInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    descripcion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    urlIframe?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaRegistro?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReportUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    descripcion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    urlIframe?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaRegistro?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReportCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
    descripcion?: Prisma.SortOrder;
    urlIframe?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaRegistro?: Prisma.SortOrder;
};
export type ReportAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type ReportMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
    descripcion?: Prisma.SortOrder;
    urlIframe?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaRegistro?: Prisma.SortOrder;
};
export type ReportMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    titulo?: Prisma.SortOrder;
    descripcion?: Prisma.SortOrder;
    urlIframe?: Prisma.SortOrder;
    activo?: Prisma.SortOrder;
    fechaRegistro?: Prisma.SortOrder;
};
export type ReportSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type ReportScalarRelationFilter = {
    is?: Prisma.ReportWhereInput;
    isNot?: Prisma.ReportWhereInput;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type ReportCreateNestedOneWithoutReportesRolesInput = {
    create?: Prisma.XOR<Prisma.ReportCreateWithoutReportesRolesInput, Prisma.ReportUncheckedCreateWithoutReportesRolesInput>;
    connectOrCreate?: Prisma.ReportCreateOrConnectWithoutReportesRolesInput;
    connect?: Prisma.ReportWhereUniqueInput;
};
export type ReportUpdateOneRequiredWithoutReportesRolesNestedInput = {
    create?: Prisma.XOR<Prisma.ReportCreateWithoutReportesRolesInput, Prisma.ReportUncheckedCreateWithoutReportesRolesInput>;
    connectOrCreate?: Prisma.ReportCreateOrConnectWithoutReportesRolesInput;
    upsert?: Prisma.ReportUpsertWithoutReportesRolesInput;
    connect?: Prisma.ReportWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ReportUpdateToOneWithWhereWithoutReportesRolesInput, Prisma.ReportUpdateWithoutReportesRolesInput>, Prisma.ReportUncheckedUpdateWithoutReportesRolesInput>;
};
export type ReportCreateNestedOneWithoutReportViewLogsInput = {
    create?: Prisma.XOR<Prisma.ReportCreateWithoutReportViewLogsInput, Prisma.ReportUncheckedCreateWithoutReportViewLogsInput>;
    connectOrCreate?: Prisma.ReportCreateOrConnectWithoutReportViewLogsInput;
    connect?: Prisma.ReportWhereUniqueInput;
};
export type ReportUpdateOneRequiredWithoutReportViewLogsNestedInput = {
    create?: Prisma.XOR<Prisma.ReportCreateWithoutReportViewLogsInput, Prisma.ReportUncheckedCreateWithoutReportViewLogsInput>;
    connectOrCreate?: Prisma.ReportCreateOrConnectWithoutReportViewLogsInput;
    upsert?: Prisma.ReportUpsertWithoutReportViewLogsInput;
    connect?: Prisma.ReportWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ReportUpdateToOneWithWhereWithoutReportViewLogsInput, Prisma.ReportUpdateWithoutReportViewLogsInput>, Prisma.ReportUncheckedUpdateWithoutReportViewLogsInput>;
};
export type ReportCreateWithoutReportesRolesInput = {
    titulo: string;
    descripcion?: string | null;
    urlIframe: string;
    activo?: boolean;
    fechaRegistro?: Date | string;
    reportViewLogs?: Prisma.ReportViewLogCreateNestedManyWithoutReporteInput;
};
export type ReportUncheckedCreateWithoutReportesRolesInput = {
    id?: number;
    titulo: string;
    descripcion?: string | null;
    urlIframe: string;
    activo?: boolean;
    fechaRegistro?: Date | string;
    reportViewLogs?: Prisma.ReportViewLogUncheckedCreateNestedManyWithoutReporteInput;
};
export type ReportCreateOrConnectWithoutReportesRolesInput = {
    where: Prisma.ReportWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReportCreateWithoutReportesRolesInput, Prisma.ReportUncheckedCreateWithoutReportesRolesInput>;
};
export type ReportUpsertWithoutReportesRolesInput = {
    update: Prisma.XOR<Prisma.ReportUpdateWithoutReportesRolesInput, Prisma.ReportUncheckedUpdateWithoutReportesRolesInput>;
    create: Prisma.XOR<Prisma.ReportCreateWithoutReportesRolesInput, Prisma.ReportUncheckedCreateWithoutReportesRolesInput>;
    where?: Prisma.ReportWhereInput;
};
export type ReportUpdateToOneWithWhereWithoutReportesRolesInput = {
    where?: Prisma.ReportWhereInput;
    data: Prisma.XOR<Prisma.ReportUpdateWithoutReportesRolesInput, Prisma.ReportUncheckedUpdateWithoutReportesRolesInput>;
};
export type ReportUpdateWithoutReportesRolesInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    descripcion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    urlIframe?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaRegistro?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    reportViewLogs?: Prisma.ReportViewLogUpdateManyWithoutReporteNestedInput;
};
export type ReportUncheckedUpdateWithoutReportesRolesInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    descripcion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    urlIframe?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaRegistro?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    reportViewLogs?: Prisma.ReportViewLogUncheckedUpdateManyWithoutReporteNestedInput;
};
export type ReportCreateWithoutReportViewLogsInput = {
    titulo: string;
    descripcion?: string | null;
    urlIframe: string;
    activo?: boolean;
    fechaRegistro?: Date | string;
    reportesRoles?: Prisma.ReportRoleCreateNestedManyWithoutReporteInput;
};
export type ReportUncheckedCreateWithoutReportViewLogsInput = {
    id?: number;
    titulo: string;
    descripcion?: string | null;
    urlIframe: string;
    activo?: boolean;
    fechaRegistro?: Date | string;
    reportesRoles?: Prisma.ReportRoleUncheckedCreateNestedManyWithoutReporteInput;
};
export type ReportCreateOrConnectWithoutReportViewLogsInput = {
    where: Prisma.ReportWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReportCreateWithoutReportViewLogsInput, Prisma.ReportUncheckedCreateWithoutReportViewLogsInput>;
};
export type ReportUpsertWithoutReportViewLogsInput = {
    update: Prisma.XOR<Prisma.ReportUpdateWithoutReportViewLogsInput, Prisma.ReportUncheckedUpdateWithoutReportViewLogsInput>;
    create: Prisma.XOR<Prisma.ReportCreateWithoutReportViewLogsInput, Prisma.ReportUncheckedCreateWithoutReportViewLogsInput>;
    where?: Prisma.ReportWhereInput;
};
export type ReportUpdateToOneWithWhereWithoutReportViewLogsInput = {
    where?: Prisma.ReportWhereInput;
    data: Prisma.XOR<Prisma.ReportUpdateWithoutReportViewLogsInput, Prisma.ReportUncheckedUpdateWithoutReportViewLogsInput>;
};
export type ReportUpdateWithoutReportViewLogsInput = {
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    descripcion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    urlIframe?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaRegistro?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    reportesRoles?: Prisma.ReportRoleUpdateManyWithoutReporteNestedInput;
};
export type ReportUncheckedUpdateWithoutReportViewLogsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    titulo?: Prisma.StringFieldUpdateOperationsInput | string;
    descripcion?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    urlIframe?: Prisma.StringFieldUpdateOperationsInput | string;
    activo?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    fechaRegistro?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    reportesRoles?: Prisma.ReportRoleUncheckedUpdateManyWithoutReporteNestedInput;
};
export type ReportCountOutputType = {
    reportesRoles: number;
    reportViewLogs: number;
};
export type ReportCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    reportesRoles?: boolean | ReportCountOutputTypeCountReportesRolesArgs;
    reportViewLogs?: boolean | ReportCountOutputTypeCountReportViewLogsArgs;
};
export type ReportCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportCountOutputTypeSelect<ExtArgs> | null;
};
export type ReportCountOutputTypeCountReportesRolesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportRoleWhereInput;
};
export type ReportCountOutputTypeCountReportViewLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportViewLogWhereInput;
};
export type ReportSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    titulo?: boolean;
    descripcion?: boolean;
    urlIframe?: boolean;
    activo?: boolean;
    fechaRegistro?: boolean;
    reportesRoles?: boolean | Prisma.Report$reportesRolesArgs<ExtArgs>;
    reportViewLogs?: boolean | Prisma.Report$reportViewLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.ReportCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["report"]>;
export type ReportSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    titulo?: boolean;
    descripcion?: boolean;
    urlIframe?: boolean;
    activo?: boolean;
    fechaRegistro?: boolean;
}, ExtArgs["result"]["report"]>;
export type ReportSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    titulo?: boolean;
    descripcion?: boolean;
    urlIframe?: boolean;
    activo?: boolean;
    fechaRegistro?: boolean;
}, ExtArgs["result"]["report"]>;
export type ReportSelectScalar = {
    id?: boolean;
    titulo?: boolean;
    descripcion?: boolean;
    urlIframe?: boolean;
    activo?: boolean;
    fechaRegistro?: boolean;
};
export type ReportOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "titulo" | "descripcion" | "urlIframe" | "activo" | "fechaRegistro", ExtArgs["result"]["report"]>;
export type ReportInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    reportesRoles?: boolean | Prisma.Report$reportesRolesArgs<ExtArgs>;
    reportViewLogs?: boolean | Prisma.Report$reportViewLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.ReportCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ReportIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ReportIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ReportPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Report";
    objects: {
        reportesRoles: Prisma.$ReportRolePayload<ExtArgs>[];
        reportViewLogs: Prisma.$ReportViewLogPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        activo: boolean;
        fechaRegistro: Date;
    }, ExtArgs["result"]["report"]>;
    composites: {};
};
export type ReportGetPayload<S extends boolean | null | undefined | ReportDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ReportPayload, S>;
export type ReportCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ReportFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ReportCountAggregateInputType | true;
};
export interface ReportDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Report'];
        meta: {
            name: 'Report';
        };
    };
    findUnique<T extends ReportFindUniqueArgs>(args: Prisma.SelectSubset<T, ReportFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ReportFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ReportFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ReportFindFirstArgs>(args?: Prisma.SelectSubset<T, ReportFindFirstArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ReportFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ReportFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ReportFindManyArgs>(args?: Prisma.SelectSubset<T, ReportFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ReportCreateArgs>(args: Prisma.SelectSubset<T, ReportCreateArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ReportCreateManyArgs>(args?: Prisma.SelectSubset<T, ReportCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ReportCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ReportCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ReportDeleteArgs>(args: Prisma.SelectSubset<T, ReportDeleteArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ReportUpdateArgs>(args: Prisma.SelectSubset<T, ReportUpdateArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ReportDeleteManyArgs>(args?: Prisma.SelectSubset<T, ReportDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ReportUpdateManyArgs>(args: Prisma.SelectSubset<T, ReportUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ReportUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ReportUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ReportUpsertArgs>(args: Prisma.SelectSubset<T, ReportUpsertArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ReportCountArgs>(args?: Prisma.Subset<T, ReportCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ReportCountAggregateOutputType> : number>;
    aggregate<T extends ReportAggregateArgs>(args: Prisma.Subset<T, ReportAggregateArgs>): Prisma.PrismaPromise<GetReportAggregateType<T>>;
    groupBy<T extends ReportGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ReportGroupByArgs['orderBy'];
    } : {
        orderBy?: ReportGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ReportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ReportFieldRefs;
}
export interface Prisma__ReportClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    reportesRoles<T extends Prisma.Report$reportesRolesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Report$reportesRolesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    reportViewLogs<T extends Prisma.Report$reportViewLogsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Report$reportViewLogsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ReportFieldRefs {
    readonly id: Prisma.FieldRef<"Report", 'Int'>;
    readonly titulo: Prisma.FieldRef<"Report", 'String'>;
    readonly descripcion: Prisma.FieldRef<"Report", 'String'>;
    readonly urlIframe: Prisma.FieldRef<"Report", 'String'>;
    readonly activo: Prisma.FieldRef<"Report", 'Boolean'>;
    readonly fechaRegistro: Prisma.FieldRef<"Report", 'DateTime'>;
}
export type ReportFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
    where: Prisma.ReportWhereUniqueInput;
};
export type ReportFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
    where: Prisma.ReportWhereUniqueInput;
};
export type ReportFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
    where?: Prisma.ReportWhereInput;
    orderBy?: Prisma.ReportOrderByWithRelationInput | Prisma.ReportOrderByWithRelationInput[];
    cursor?: Prisma.ReportWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReportScalarFieldEnum | Prisma.ReportScalarFieldEnum[];
};
export type ReportFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
    where?: Prisma.ReportWhereInput;
    orderBy?: Prisma.ReportOrderByWithRelationInput | Prisma.ReportOrderByWithRelationInput[];
    cursor?: Prisma.ReportWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReportScalarFieldEnum | Prisma.ReportScalarFieldEnum[];
};
export type ReportFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
    where?: Prisma.ReportWhereInput;
    orderBy?: Prisma.ReportOrderByWithRelationInput | Prisma.ReportOrderByWithRelationInput[];
    cursor?: Prisma.ReportWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ReportScalarFieldEnum | Prisma.ReportScalarFieldEnum[];
};
export type ReportCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReportCreateInput, Prisma.ReportUncheckedCreateInput>;
};
export type ReportCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ReportCreateManyInput | Prisma.ReportCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ReportCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    data: Prisma.ReportCreateManyInput | Prisma.ReportCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ReportUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReportUpdateInput, Prisma.ReportUncheckedUpdateInput>;
    where: Prisma.ReportWhereUniqueInput;
};
export type ReportUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ReportUpdateManyMutationInput, Prisma.ReportUncheckedUpdateManyInput>;
    where?: Prisma.ReportWhereInput;
    limit?: number;
};
export type ReportUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReportUpdateManyMutationInput, Prisma.ReportUncheckedUpdateManyInput>;
    where?: Prisma.ReportWhereInput;
    limit?: number;
};
export type ReportUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
    where: Prisma.ReportWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReportCreateInput, Prisma.ReportUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ReportUpdateInput, Prisma.ReportUncheckedUpdateInput>;
};
export type ReportDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
    where: Prisma.ReportWhereUniqueInput;
};
export type ReportDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportWhereInput;
    limit?: number;
};
export type Report$reportesRolesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Report$reportViewLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ReportDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportSelect<ExtArgs> | null;
    omit?: Prisma.ReportOmit<ExtArgs> | null;
    include?: Prisma.ReportInclude<ExtArgs> | null;
};
export {};
