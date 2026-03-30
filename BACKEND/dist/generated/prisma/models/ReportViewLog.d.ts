import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
export type ReportViewLogModel = runtime.Types.Result.DefaultSelection<Prisma.$ReportViewLogPayload>;
export type AggregateReportViewLog = {
    _count: ReportViewLogCountAggregateOutputType | null;
    _avg: ReportViewLogAvgAggregateOutputType | null;
    _sum: ReportViewLogSumAggregateOutputType | null;
    _min: ReportViewLogMinAggregateOutputType | null;
    _max: ReportViewLogMaxAggregateOutputType | null;
};
export type ReportViewLogAvgAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
    reporteId: number | null;
    duracion: number | null;
};
export type ReportViewLogSumAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
    reporteId: number | null;
    duracion: number | null;
};
export type ReportViewLogMinAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
    reporteId: number | null;
    duracion: number | null;
    fechaHora: Date | null;
};
export type ReportViewLogMaxAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
    reporteId: number | null;
    duracion: number | null;
    fechaHora: Date | null;
};
export type ReportViewLogCountAggregateOutputType = {
    id: number;
    usuarioId: number;
    reporteId: number;
    duracion: number;
    fechaHora: number;
    _all: number;
};
export type ReportViewLogAvgAggregateInputType = {
    id?: true;
    usuarioId?: true;
    reporteId?: true;
    duracion?: true;
};
export type ReportViewLogSumAggregateInputType = {
    id?: true;
    usuarioId?: true;
    reporteId?: true;
    duracion?: true;
};
export type ReportViewLogMinAggregateInputType = {
    id?: true;
    usuarioId?: true;
    reporteId?: true;
    duracion?: true;
    fechaHora?: true;
};
export type ReportViewLogMaxAggregateInputType = {
    id?: true;
    usuarioId?: true;
    reporteId?: true;
    duracion?: true;
    fechaHora?: true;
};
export type ReportViewLogCountAggregateInputType = {
    id?: true;
    usuarioId?: true;
    reporteId?: true;
    duracion?: true;
    fechaHora?: true;
    _all?: true;
};
export type ReportViewLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportViewLogWhereInput;
    orderBy?: Prisma.ReportViewLogOrderByWithRelationInput | Prisma.ReportViewLogOrderByWithRelationInput[];
    cursor?: Prisma.ReportViewLogWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ReportViewLogCountAggregateInputType;
    _avg?: ReportViewLogAvgAggregateInputType;
    _sum?: ReportViewLogSumAggregateInputType;
    _min?: ReportViewLogMinAggregateInputType;
    _max?: ReportViewLogMaxAggregateInputType;
};
export type GetReportViewLogAggregateType<T extends ReportViewLogAggregateArgs> = {
    [P in keyof T & keyof AggregateReportViewLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateReportViewLog[P]> : Prisma.GetScalarType<T[P], AggregateReportViewLog[P]>;
};
export type ReportViewLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportViewLogWhereInput;
    orderBy?: Prisma.ReportViewLogOrderByWithAggregationInput | Prisma.ReportViewLogOrderByWithAggregationInput[];
    by: Prisma.ReportViewLogScalarFieldEnum[] | Prisma.ReportViewLogScalarFieldEnum;
    having?: Prisma.ReportViewLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ReportViewLogCountAggregateInputType | true;
    _avg?: ReportViewLogAvgAggregateInputType;
    _sum?: ReportViewLogSumAggregateInputType;
    _min?: ReportViewLogMinAggregateInputType;
    _max?: ReportViewLogMaxAggregateInputType;
};
export type ReportViewLogGroupByOutputType = {
    id: number;
    usuarioId: number;
    reporteId: number;
    duracion: number;
    fechaHora: Date;
    _count: ReportViewLogCountAggregateOutputType | null;
    _avg: ReportViewLogAvgAggregateOutputType | null;
    _sum: ReportViewLogSumAggregateOutputType | null;
    _min: ReportViewLogMinAggregateOutputType | null;
    _max: ReportViewLogMaxAggregateOutputType | null;
};
type GetReportViewLogGroupByPayload<T extends ReportViewLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ReportViewLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ReportViewLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ReportViewLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ReportViewLogGroupByOutputType[P]>;
}>>;
export type ReportViewLogWhereInput = {
    AND?: Prisma.ReportViewLogWhereInput | Prisma.ReportViewLogWhereInput[];
    OR?: Prisma.ReportViewLogWhereInput[];
    NOT?: Prisma.ReportViewLogWhereInput | Prisma.ReportViewLogWhereInput[];
    id?: Prisma.IntFilter<"ReportViewLog"> | number;
    usuarioId?: Prisma.IntFilter<"ReportViewLog"> | number;
    reporteId?: Prisma.IntFilter<"ReportViewLog"> | number;
    duracion?: Prisma.IntFilter<"ReportViewLog"> | number;
    fechaHora?: Prisma.DateTimeFilter<"ReportViewLog"> | Date | string;
    usuario?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    reporte?: Prisma.XOR<Prisma.ReportScalarRelationFilter, Prisma.ReportWhereInput>;
};
export type ReportViewLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    reporteId?: Prisma.SortOrder;
    duracion?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    usuario?: Prisma.UserOrderByWithRelationInput;
    reporte?: Prisma.ReportOrderByWithRelationInput;
};
export type ReportViewLogWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.ReportViewLogWhereInput | Prisma.ReportViewLogWhereInput[];
    OR?: Prisma.ReportViewLogWhereInput[];
    NOT?: Prisma.ReportViewLogWhereInput | Prisma.ReportViewLogWhereInput[];
    usuarioId?: Prisma.IntFilter<"ReportViewLog"> | number;
    reporteId?: Prisma.IntFilter<"ReportViewLog"> | number;
    duracion?: Prisma.IntFilter<"ReportViewLog"> | number;
    fechaHora?: Prisma.DateTimeFilter<"ReportViewLog"> | Date | string;
    usuario?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    reporte?: Prisma.XOR<Prisma.ReportScalarRelationFilter, Prisma.ReportWhereInput>;
}, "id">;
export type ReportViewLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    reporteId?: Prisma.SortOrder;
    duracion?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    _count?: Prisma.ReportViewLogCountOrderByAggregateInput;
    _avg?: Prisma.ReportViewLogAvgOrderByAggregateInput;
    _max?: Prisma.ReportViewLogMaxOrderByAggregateInput;
    _min?: Prisma.ReportViewLogMinOrderByAggregateInput;
    _sum?: Prisma.ReportViewLogSumOrderByAggregateInput;
};
export type ReportViewLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.ReportViewLogScalarWhereWithAggregatesInput | Prisma.ReportViewLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.ReportViewLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ReportViewLogScalarWhereWithAggregatesInput | Prisma.ReportViewLogScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"ReportViewLog"> | number;
    usuarioId?: Prisma.IntWithAggregatesFilter<"ReportViewLog"> | number;
    reporteId?: Prisma.IntWithAggregatesFilter<"ReportViewLog"> | number;
    duracion?: Prisma.IntWithAggregatesFilter<"ReportViewLog"> | number;
    fechaHora?: Prisma.DateTimeWithAggregatesFilter<"ReportViewLog"> | Date | string;
};
export type ReportViewLogCreateInput = {
    duracion: number;
    fechaHora?: Date | string;
    usuario: Prisma.UserCreateNestedOneWithoutReportViewLogsInput;
    reporte: Prisma.ReportCreateNestedOneWithoutReportViewLogsInput;
};
export type ReportViewLogUncheckedCreateInput = {
    id?: number;
    usuarioId: number;
    reporteId: number;
    duracion: number;
    fechaHora?: Date | string;
};
export type ReportViewLogUpdateInput = {
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usuario?: Prisma.UserUpdateOneRequiredWithoutReportViewLogsNestedInput;
    reporte?: Prisma.ReportUpdateOneRequiredWithoutReportViewLogsNestedInput;
};
export type ReportViewLogUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    reporteId?: Prisma.IntFieldUpdateOperationsInput | number;
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReportViewLogCreateManyInput = {
    id?: number;
    usuarioId: number;
    reporteId: number;
    duracion: number;
    fechaHora?: Date | string;
};
export type ReportViewLogUpdateManyMutationInput = {
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReportViewLogUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    reporteId?: Prisma.IntFieldUpdateOperationsInput | number;
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReportViewLogListRelationFilter = {
    every?: Prisma.ReportViewLogWhereInput;
    some?: Prisma.ReportViewLogWhereInput;
    none?: Prisma.ReportViewLogWhereInput;
};
export type ReportViewLogOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ReportViewLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    reporteId?: Prisma.SortOrder;
    duracion?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
};
export type ReportViewLogAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    reporteId?: Prisma.SortOrder;
    duracion?: Prisma.SortOrder;
};
export type ReportViewLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    reporteId?: Prisma.SortOrder;
    duracion?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
};
export type ReportViewLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    reporteId?: Prisma.SortOrder;
    duracion?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
};
export type ReportViewLogSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    reporteId?: Prisma.SortOrder;
    duracion?: Prisma.SortOrder;
};
export type ReportViewLogCreateNestedManyWithoutUsuarioInput = {
    create?: Prisma.XOR<Prisma.ReportViewLogCreateWithoutUsuarioInput, Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput> | Prisma.ReportViewLogCreateWithoutUsuarioInput[] | Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.ReportViewLogCreateOrConnectWithoutUsuarioInput | Prisma.ReportViewLogCreateOrConnectWithoutUsuarioInput[];
    createMany?: Prisma.ReportViewLogCreateManyUsuarioInputEnvelope;
    connect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
};
export type ReportViewLogUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: Prisma.XOR<Prisma.ReportViewLogCreateWithoutUsuarioInput, Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput> | Prisma.ReportViewLogCreateWithoutUsuarioInput[] | Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.ReportViewLogCreateOrConnectWithoutUsuarioInput | Prisma.ReportViewLogCreateOrConnectWithoutUsuarioInput[];
    createMany?: Prisma.ReportViewLogCreateManyUsuarioInputEnvelope;
    connect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
};
export type ReportViewLogUpdateManyWithoutUsuarioNestedInput = {
    create?: Prisma.XOR<Prisma.ReportViewLogCreateWithoutUsuarioInput, Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput> | Prisma.ReportViewLogCreateWithoutUsuarioInput[] | Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.ReportViewLogCreateOrConnectWithoutUsuarioInput | Prisma.ReportViewLogCreateOrConnectWithoutUsuarioInput[];
    upsert?: Prisma.ReportViewLogUpsertWithWhereUniqueWithoutUsuarioInput | Prisma.ReportViewLogUpsertWithWhereUniqueWithoutUsuarioInput[];
    createMany?: Prisma.ReportViewLogCreateManyUsuarioInputEnvelope;
    set?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    disconnect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    delete?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    connect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    update?: Prisma.ReportViewLogUpdateWithWhereUniqueWithoutUsuarioInput | Prisma.ReportViewLogUpdateWithWhereUniqueWithoutUsuarioInput[];
    updateMany?: Prisma.ReportViewLogUpdateManyWithWhereWithoutUsuarioInput | Prisma.ReportViewLogUpdateManyWithWhereWithoutUsuarioInput[];
    deleteMany?: Prisma.ReportViewLogScalarWhereInput | Prisma.ReportViewLogScalarWhereInput[];
};
export type ReportViewLogUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: Prisma.XOR<Prisma.ReportViewLogCreateWithoutUsuarioInput, Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput> | Prisma.ReportViewLogCreateWithoutUsuarioInput[] | Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.ReportViewLogCreateOrConnectWithoutUsuarioInput | Prisma.ReportViewLogCreateOrConnectWithoutUsuarioInput[];
    upsert?: Prisma.ReportViewLogUpsertWithWhereUniqueWithoutUsuarioInput | Prisma.ReportViewLogUpsertWithWhereUniqueWithoutUsuarioInput[];
    createMany?: Prisma.ReportViewLogCreateManyUsuarioInputEnvelope;
    set?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    disconnect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    delete?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    connect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    update?: Prisma.ReportViewLogUpdateWithWhereUniqueWithoutUsuarioInput | Prisma.ReportViewLogUpdateWithWhereUniqueWithoutUsuarioInput[];
    updateMany?: Prisma.ReportViewLogUpdateManyWithWhereWithoutUsuarioInput | Prisma.ReportViewLogUpdateManyWithWhereWithoutUsuarioInput[];
    deleteMany?: Prisma.ReportViewLogScalarWhereInput | Prisma.ReportViewLogScalarWhereInput[];
};
export type ReportViewLogCreateNestedManyWithoutReporteInput = {
    create?: Prisma.XOR<Prisma.ReportViewLogCreateWithoutReporteInput, Prisma.ReportViewLogUncheckedCreateWithoutReporteInput> | Prisma.ReportViewLogCreateWithoutReporteInput[] | Prisma.ReportViewLogUncheckedCreateWithoutReporteInput[];
    connectOrCreate?: Prisma.ReportViewLogCreateOrConnectWithoutReporteInput | Prisma.ReportViewLogCreateOrConnectWithoutReporteInput[];
    createMany?: Prisma.ReportViewLogCreateManyReporteInputEnvelope;
    connect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
};
export type ReportViewLogUncheckedCreateNestedManyWithoutReporteInput = {
    create?: Prisma.XOR<Prisma.ReportViewLogCreateWithoutReporteInput, Prisma.ReportViewLogUncheckedCreateWithoutReporteInput> | Prisma.ReportViewLogCreateWithoutReporteInput[] | Prisma.ReportViewLogUncheckedCreateWithoutReporteInput[];
    connectOrCreate?: Prisma.ReportViewLogCreateOrConnectWithoutReporteInput | Prisma.ReportViewLogCreateOrConnectWithoutReporteInput[];
    createMany?: Prisma.ReportViewLogCreateManyReporteInputEnvelope;
    connect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
};
export type ReportViewLogUpdateManyWithoutReporteNestedInput = {
    create?: Prisma.XOR<Prisma.ReportViewLogCreateWithoutReporteInput, Prisma.ReportViewLogUncheckedCreateWithoutReporteInput> | Prisma.ReportViewLogCreateWithoutReporteInput[] | Prisma.ReportViewLogUncheckedCreateWithoutReporteInput[];
    connectOrCreate?: Prisma.ReportViewLogCreateOrConnectWithoutReporteInput | Prisma.ReportViewLogCreateOrConnectWithoutReporteInput[];
    upsert?: Prisma.ReportViewLogUpsertWithWhereUniqueWithoutReporteInput | Prisma.ReportViewLogUpsertWithWhereUniqueWithoutReporteInput[];
    createMany?: Prisma.ReportViewLogCreateManyReporteInputEnvelope;
    set?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    disconnect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    delete?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    connect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    update?: Prisma.ReportViewLogUpdateWithWhereUniqueWithoutReporteInput | Prisma.ReportViewLogUpdateWithWhereUniqueWithoutReporteInput[];
    updateMany?: Prisma.ReportViewLogUpdateManyWithWhereWithoutReporteInput | Prisma.ReportViewLogUpdateManyWithWhereWithoutReporteInput[];
    deleteMany?: Prisma.ReportViewLogScalarWhereInput | Prisma.ReportViewLogScalarWhereInput[];
};
export type ReportViewLogUncheckedUpdateManyWithoutReporteNestedInput = {
    create?: Prisma.XOR<Prisma.ReportViewLogCreateWithoutReporteInput, Prisma.ReportViewLogUncheckedCreateWithoutReporteInput> | Prisma.ReportViewLogCreateWithoutReporteInput[] | Prisma.ReportViewLogUncheckedCreateWithoutReporteInput[];
    connectOrCreate?: Prisma.ReportViewLogCreateOrConnectWithoutReporteInput | Prisma.ReportViewLogCreateOrConnectWithoutReporteInput[];
    upsert?: Prisma.ReportViewLogUpsertWithWhereUniqueWithoutReporteInput | Prisma.ReportViewLogUpsertWithWhereUniqueWithoutReporteInput[];
    createMany?: Prisma.ReportViewLogCreateManyReporteInputEnvelope;
    set?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    disconnect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    delete?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    connect?: Prisma.ReportViewLogWhereUniqueInput | Prisma.ReportViewLogWhereUniqueInput[];
    update?: Prisma.ReportViewLogUpdateWithWhereUniqueWithoutReporteInput | Prisma.ReportViewLogUpdateWithWhereUniqueWithoutReporteInput[];
    updateMany?: Prisma.ReportViewLogUpdateManyWithWhereWithoutReporteInput | Prisma.ReportViewLogUpdateManyWithWhereWithoutReporteInput[];
    deleteMany?: Prisma.ReportViewLogScalarWhereInput | Prisma.ReportViewLogScalarWhereInput[];
};
export type ReportViewLogCreateWithoutUsuarioInput = {
    duracion: number;
    fechaHora?: Date | string;
    reporte: Prisma.ReportCreateNestedOneWithoutReportViewLogsInput;
};
export type ReportViewLogUncheckedCreateWithoutUsuarioInput = {
    id?: number;
    reporteId: number;
    duracion: number;
    fechaHora?: Date | string;
};
export type ReportViewLogCreateOrConnectWithoutUsuarioInput = {
    where: Prisma.ReportViewLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReportViewLogCreateWithoutUsuarioInput, Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput>;
};
export type ReportViewLogCreateManyUsuarioInputEnvelope = {
    data: Prisma.ReportViewLogCreateManyUsuarioInput | Prisma.ReportViewLogCreateManyUsuarioInput[];
    skipDuplicates?: boolean;
};
export type ReportViewLogUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: Prisma.ReportViewLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ReportViewLogUpdateWithoutUsuarioInput, Prisma.ReportViewLogUncheckedUpdateWithoutUsuarioInput>;
    create: Prisma.XOR<Prisma.ReportViewLogCreateWithoutUsuarioInput, Prisma.ReportViewLogUncheckedCreateWithoutUsuarioInput>;
};
export type ReportViewLogUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: Prisma.ReportViewLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ReportViewLogUpdateWithoutUsuarioInput, Prisma.ReportViewLogUncheckedUpdateWithoutUsuarioInput>;
};
export type ReportViewLogUpdateManyWithWhereWithoutUsuarioInput = {
    where: Prisma.ReportViewLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ReportViewLogUpdateManyMutationInput, Prisma.ReportViewLogUncheckedUpdateManyWithoutUsuarioInput>;
};
export type ReportViewLogScalarWhereInput = {
    AND?: Prisma.ReportViewLogScalarWhereInput | Prisma.ReportViewLogScalarWhereInput[];
    OR?: Prisma.ReportViewLogScalarWhereInput[];
    NOT?: Prisma.ReportViewLogScalarWhereInput | Prisma.ReportViewLogScalarWhereInput[];
    id?: Prisma.IntFilter<"ReportViewLog"> | number;
    usuarioId?: Prisma.IntFilter<"ReportViewLog"> | number;
    reporteId?: Prisma.IntFilter<"ReportViewLog"> | number;
    duracion?: Prisma.IntFilter<"ReportViewLog"> | number;
    fechaHora?: Prisma.DateTimeFilter<"ReportViewLog"> | Date | string;
};
export type ReportViewLogCreateWithoutReporteInput = {
    duracion: number;
    fechaHora?: Date | string;
    usuario: Prisma.UserCreateNestedOneWithoutReportViewLogsInput;
};
export type ReportViewLogUncheckedCreateWithoutReporteInput = {
    id?: number;
    usuarioId: number;
    duracion: number;
    fechaHora?: Date | string;
};
export type ReportViewLogCreateOrConnectWithoutReporteInput = {
    where: Prisma.ReportViewLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReportViewLogCreateWithoutReporteInput, Prisma.ReportViewLogUncheckedCreateWithoutReporteInput>;
};
export type ReportViewLogCreateManyReporteInputEnvelope = {
    data: Prisma.ReportViewLogCreateManyReporteInput | Prisma.ReportViewLogCreateManyReporteInput[];
    skipDuplicates?: boolean;
};
export type ReportViewLogUpsertWithWhereUniqueWithoutReporteInput = {
    where: Prisma.ReportViewLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.ReportViewLogUpdateWithoutReporteInput, Prisma.ReportViewLogUncheckedUpdateWithoutReporteInput>;
    create: Prisma.XOR<Prisma.ReportViewLogCreateWithoutReporteInput, Prisma.ReportViewLogUncheckedCreateWithoutReporteInput>;
};
export type ReportViewLogUpdateWithWhereUniqueWithoutReporteInput = {
    where: Prisma.ReportViewLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.ReportViewLogUpdateWithoutReporteInput, Prisma.ReportViewLogUncheckedUpdateWithoutReporteInput>;
};
export type ReportViewLogUpdateManyWithWhereWithoutReporteInput = {
    where: Prisma.ReportViewLogScalarWhereInput;
    data: Prisma.XOR<Prisma.ReportViewLogUpdateManyMutationInput, Prisma.ReportViewLogUncheckedUpdateManyWithoutReporteInput>;
};
export type ReportViewLogCreateManyUsuarioInput = {
    id?: number;
    reporteId: number;
    duracion: number;
    fechaHora?: Date | string;
};
export type ReportViewLogUpdateWithoutUsuarioInput = {
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    reporte?: Prisma.ReportUpdateOneRequiredWithoutReportViewLogsNestedInput;
};
export type ReportViewLogUncheckedUpdateWithoutUsuarioInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    reporteId?: Prisma.IntFieldUpdateOperationsInput | number;
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReportViewLogUncheckedUpdateManyWithoutUsuarioInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    reporteId?: Prisma.IntFieldUpdateOperationsInput | number;
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReportViewLogCreateManyReporteInput = {
    id?: number;
    usuarioId: number;
    duracion: number;
    fechaHora?: Date | string;
};
export type ReportViewLogUpdateWithoutReporteInput = {
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usuario?: Prisma.UserUpdateOneRequiredWithoutReportViewLogsNestedInput;
};
export type ReportViewLogUncheckedUpdateWithoutReporteInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReportViewLogUncheckedUpdateManyWithoutReporteInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    duracion?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ReportViewLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    usuarioId?: boolean;
    reporteId?: boolean;
    duracion?: boolean;
    fechaHora?: boolean;
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reportViewLog"]>;
export type ReportViewLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    usuarioId?: boolean;
    reporteId?: boolean;
    duracion?: boolean;
    fechaHora?: boolean;
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reportViewLog"]>;
export type ReportViewLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    usuarioId?: boolean;
    reporteId?: boolean;
    duracion?: boolean;
    fechaHora?: boolean;
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["reportViewLog"]>;
export type ReportViewLogSelectScalar = {
    id?: boolean;
    usuarioId?: boolean;
    reporteId?: boolean;
    duracion?: boolean;
    fechaHora?: boolean;
};
export type ReportViewLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "usuarioId" | "reporteId" | "duracion" | "fechaHora", ExtArgs["result"]["reportViewLog"]>;
export type ReportViewLogInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
};
export type ReportViewLogIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
};
export type ReportViewLogIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    reporte?: boolean | Prisma.ReportDefaultArgs<ExtArgs>;
};
export type $ReportViewLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ReportViewLog";
    objects: {
        usuario: Prisma.$UserPayload<ExtArgs>;
        reporte: Prisma.$ReportPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        usuarioId: number;
        reporteId: number;
        duracion: number;
        fechaHora: Date;
    }, ExtArgs["result"]["reportViewLog"]>;
    composites: {};
};
export type ReportViewLogGetPayload<S extends boolean | null | undefined | ReportViewLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload, S>;
export type ReportViewLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ReportViewLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ReportViewLogCountAggregateInputType | true;
};
export interface ReportViewLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ReportViewLog'];
        meta: {
            name: 'ReportViewLog';
        };
    };
    findUnique<T extends ReportViewLogFindUniqueArgs>(args: Prisma.SelectSubset<T, ReportViewLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ReportViewLogClient<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ReportViewLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ReportViewLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReportViewLogClient<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ReportViewLogFindFirstArgs>(args?: Prisma.SelectSubset<T, ReportViewLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__ReportViewLogClient<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ReportViewLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ReportViewLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ReportViewLogClient<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ReportViewLogFindManyArgs>(args?: Prisma.SelectSubset<T, ReportViewLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ReportViewLogCreateArgs>(args: Prisma.SelectSubset<T, ReportViewLogCreateArgs<ExtArgs>>): Prisma.Prisma__ReportViewLogClient<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ReportViewLogCreateManyArgs>(args?: Prisma.SelectSubset<T, ReportViewLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ReportViewLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ReportViewLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ReportViewLogDeleteArgs>(args: Prisma.SelectSubset<T, ReportViewLogDeleteArgs<ExtArgs>>): Prisma.Prisma__ReportViewLogClient<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ReportViewLogUpdateArgs>(args: Prisma.SelectSubset<T, ReportViewLogUpdateArgs<ExtArgs>>): Prisma.Prisma__ReportViewLogClient<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ReportViewLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, ReportViewLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ReportViewLogUpdateManyArgs>(args: Prisma.SelectSubset<T, ReportViewLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ReportViewLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ReportViewLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ReportViewLogUpsertArgs>(args: Prisma.SelectSubset<T, ReportViewLogUpsertArgs<ExtArgs>>): Prisma.Prisma__ReportViewLogClient<runtime.Types.Result.GetResult<Prisma.$ReportViewLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ReportViewLogCountArgs>(args?: Prisma.Subset<T, ReportViewLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ReportViewLogCountAggregateOutputType> : number>;
    aggregate<T extends ReportViewLogAggregateArgs>(args: Prisma.Subset<T, ReportViewLogAggregateArgs>): Prisma.PrismaPromise<GetReportViewLogAggregateType<T>>;
    groupBy<T extends ReportViewLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ReportViewLogGroupByArgs['orderBy'];
    } : {
        orderBy?: ReportViewLogGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ReportViewLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReportViewLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ReportViewLogFieldRefs;
}
export interface Prisma__ReportViewLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    usuario<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    reporte<T extends Prisma.ReportDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ReportDefaultArgs<ExtArgs>>): Prisma.Prisma__ReportClient<runtime.Types.Result.GetResult<Prisma.$ReportPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ReportViewLogFieldRefs {
    readonly id: Prisma.FieldRef<"ReportViewLog", 'Int'>;
    readonly usuarioId: Prisma.FieldRef<"ReportViewLog", 'Int'>;
    readonly reporteId: Prisma.FieldRef<"ReportViewLog", 'Int'>;
    readonly duracion: Prisma.FieldRef<"ReportViewLog", 'Int'>;
    readonly fechaHora: Prisma.FieldRef<"ReportViewLog", 'DateTime'>;
}
export type ReportViewLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    include?: Prisma.ReportViewLogInclude<ExtArgs> | null;
    where: Prisma.ReportViewLogWhereUniqueInput;
};
export type ReportViewLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    include?: Prisma.ReportViewLogInclude<ExtArgs> | null;
    where: Prisma.ReportViewLogWhereUniqueInput;
};
export type ReportViewLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ReportViewLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ReportViewLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ReportViewLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    include?: Prisma.ReportViewLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReportViewLogCreateInput, Prisma.ReportViewLogUncheckedCreateInput>;
};
export type ReportViewLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ReportViewLogCreateManyInput | Prisma.ReportViewLogCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ReportViewLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    data: Prisma.ReportViewLogCreateManyInput | Prisma.ReportViewLogCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ReportViewLogIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ReportViewLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    include?: Prisma.ReportViewLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReportViewLogUpdateInput, Prisma.ReportViewLogUncheckedUpdateInput>;
    where: Prisma.ReportViewLogWhereUniqueInput;
};
export type ReportViewLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ReportViewLogUpdateManyMutationInput, Prisma.ReportViewLogUncheckedUpdateManyInput>;
    where?: Prisma.ReportViewLogWhereInput;
    limit?: number;
};
export type ReportViewLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ReportViewLogUpdateManyMutationInput, Prisma.ReportViewLogUncheckedUpdateManyInput>;
    where?: Prisma.ReportViewLogWhereInput;
    limit?: number;
    include?: Prisma.ReportViewLogIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ReportViewLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    include?: Prisma.ReportViewLogInclude<ExtArgs> | null;
    where: Prisma.ReportViewLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.ReportViewLogCreateInput, Prisma.ReportViewLogUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ReportViewLogUpdateInput, Prisma.ReportViewLogUncheckedUpdateInput>;
};
export type ReportViewLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    include?: Prisma.ReportViewLogInclude<ExtArgs> | null;
    where: Prisma.ReportViewLogWhereUniqueInput;
};
export type ReportViewLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportViewLogWhereInput;
    limit?: number;
};
export type ReportViewLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ReportViewLogSelect<ExtArgs> | null;
    omit?: Prisma.ReportViewLogOmit<ExtArgs> | null;
    include?: Prisma.ReportViewLogInclude<ExtArgs> | null;
};
export {};
