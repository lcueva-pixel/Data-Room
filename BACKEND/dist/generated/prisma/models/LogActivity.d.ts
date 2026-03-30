import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
export type LogActivityModel = runtime.Types.Result.DefaultSelection<Prisma.$LogActivityPayload>;
export type AggregateLogActivity = {
    _count: LogActivityCountAggregateOutputType | null;
    _avg: LogActivityAvgAggregateOutputType | null;
    _sum: LogActivitySumAggregateOutputType | null;
    _min: LogActivityMinAggregateOutputType | null;
    _max: LogActivityMaxAggregateOutputType | null;
};
export type LogActivityAvgAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
};
export type LogActivitySumAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
};
export type LogActivityMinAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
    accion: string | null;
    detalle: string | null;
    fechaHora: Date | null;
};
export type LogActivityMaxAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
    accion: string | null;
    detalle: string | null;
    fechaHora: Date | null;
};
export type LogActivityCountAggregateOutputType = {
    id: number;
    usuarioId: number;
    accion: number;
    detalle: number;
    fechaHora: number;
    _all: number;
};
export type LogActivityAvgAggregateInputType = {
    id?: true;
    usuarioId?: true;
};
export type LogActivitySumAggregateInputType = {
    id?: true;
    usuarioId?: true;
};
export type LogActivityMinAggregateInputType = {
    id?: true;
    usuarioId?: true;
    accion?: true;
    detalle?: true;
    fechaHora?: true;
};
export type LogActivityMaxAggregateInputType = {
    id?: true;
    usuarioId?: true;
    accion?: true;
    detalle?: true;
    fechaHora?: true;
};
export type LogActivityCountAggregateInputType = {
    id?: true;
    usuarioId?: true;
    accion?: true;
    detalle?: true;
    fechaHora?: true;
    _all?: true;
};
export type LogActivityAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LogActivityWhereInput;
    orderBy?: Prisma.LogActivityOrderByWithRelationInput | Prisma.LogActivityOrderByWithRelationInput[];
    cursor?: Prisma.LogActivityWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | LogActivityCountAggregateInputType;
    _avg?: LogActivityAvgAggregateInputType;
    _sum?: LogActivitySumAggregateInputType;
    _min?: LogActivityMinAggregateInputType;
    _max?: LogActivityMaxAggregateInputType;
};
export type GetLogActivityAggregateType<T extends LogActivityAggregateArgs> = {
    [P in keyof T & keyof AggregateLogActivity]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateLogActivity[P]> : Prisma.GetScalarType<T[P], AggregateLogActivity[P]>;
};
export type LogActivityGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LogActivityWhereInput;
    orderBy?: Prisma.LogActivityOrderByWithAggregationInput | Prisma.LogActivityOrderByWithAggregationInput[];
    by: Prisma.LogActivityScalarFieldEnum[] | Prisma.LogActivityScalarFieldEnum;
    having?: Prisma.LogActivityScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: LogActivityCountAggregateInputType | true;
    _avg?: LogActivityAvgAggregateInputType;
    _sum?: LogActivitySumAggregateInputType;
    _min?: LogActivityMinAggregateInputType;
    _max?: LogActivityMaxAggregateInputType;
};
export type LogActivityGroupByOutputType = {
    id: number;
    usuarioId: number;
    accion: string;
    detalle: string | null;
    fechaHora: Date;
    _count: LogActivityCountAggregateOutputType | null;
    _avg: LogActivityAvgAggregateOutputType | null;
    _sum: LogActivitySumAggregateOutputType | null;
    _min: LogActivityMinAggregateOutputType | null;
    _max: LogActivityMaxAggregateOutputType | null;
};
type GetLogActivityGroupByPayload<T extends LogActivityGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<LogActivityGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof LogActivityGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], LogActivityGroupByOutputType[P]> : Prisma.GetScalarType<T[P], LogActivityGroupByOutputType[P]>;
}>>;
export type LogActivityWhereInput = {
    AND?: Prisma.LogActivityWhereInput | Prisma.LogActivityWhereInput[];
    OR?: Prisma.LogActivityWhereInput[];
    NOT?: Prisma.LogActivityWhereInput | Prisma.LogActivityWhereInput[];
    id?: Prisma.IntFilter<"LogActivity"> | number;
    usuarioId?: Prisma.IntFilter<"LogActivity"> | number;
    accion?: Prisma.StringFilter<"LogActivity"> | string;
    detalle?: Prisma.StringNullableFilter<"LogActivity"> | string | null;
    fechaHora?: Prisma.DateTimeFilter<"LogActivity"> | Date | string;
    usuario?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type LogActivityOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    accion?: Prisma.SortOrder;
    detalle?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    usuario?: Prisma.UserOrderByWithRelationInput;
};
export type LogActivityWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.LogActivityWhereInput | Prisma.LogActivityWhereInput[];
    OR?: Prisma.LogActivityWhereInput[];
    NOT?: Prisma.LogActivityWhereInput | Prisma.LogActivityWhereInput[];
    usuarioId?: Prisma.IntFilter<"LogActivity"> | number;
    accion?: Prisma.StringFilter<"LogActivity"> | string;
    detalle?: Prisma.StringNullableFilter<"LogActivity"> | string | null;
    fechaHora?: Prisma.DateTimeFilter<"LogActivity"> | Date | string;
    usuario?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type LogActivityOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    accion?: Prisma.SortOrder;
    detalle?: Prisma.SortOrderInput | Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    _count?: Prisma.LogActivityCountOrderByAggregateInput;
    _avg?: Prisma.LogActivityAvgOrderByAggregateInput;
    _max?: Prisma.LogActivityMaxOrderByAggregateInput;
    _min?: Prisma.LogActivityMinOrderByAggregateInput;
    _sum?: Prisma.LogActivitySumOrderByAggregateInput;
};
export type LogActivityScalarWhereWithAggregatesInput = {
    AND?: Prisma.LogActivityScalarWhereWithAggregatesInput | Prisma.LogActivityScalarWhereWithAggregatesInput[];
    OR?: Prisma.LogActivityScalarWhereWithAggregatesInput[];
    NOT?: Prisma.LogActivityScalarWhereWithAggregatesInput | Prisma.LogActivityScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"LogActivity"> | number;
    usuarioId?: Prisma.IntWithAggregatesFilter<"LogActivity"> | number;
    accion?: Prisma.StringWithAggregatesFilter<"LogActivity"> | string;
    detalle?: Prisma.StringNullableWithAggregatesFilter<"LogActivity"> | string | null;
    fechaHora?: Prisma.DateTimeWithAggregatesFilter<"LogActivity"> | Date | string;
};
export type LogActivityCreateInput = {
    accion: string;
    detalle?: string | null;
    fechaHora?: Date | string;
    usuario: Prisma.UserCreateNestedOneWithoutLogActivitiesInput;
};
export type LogActivityUncheckedCreateInput = {
    id?: number;
    usuarioId: number;
    accion: string;
    detalle?: string | null;
    fechaHora?: Date | string;
};
export type LogActivityUpdateInput = {
    accion?: Prisma.StringFieldUpdateOperationsInput | string;
    detalle?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    usuario?: Prisma.UserUpdateOneRequiredWithoutLogActivitiesNestedInput;
};
export type LogActivityUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    accion?: Prisma.StringFieldUpdateOperationsInput | string;
    detalle?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LogActivityCreateManyInput = {
    id?: number;
    usuarioId: number;
    accion: string;
    detalle?: string | null;
    fechaHora?: Date | string;
};
export type LogActivityUpdateManyMutationInput = {
    accion?: Prisma.StringFieldUpdateOperationsInput | string;
    detalle?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LogActivityUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    accion?: Prisma.StringFieldUpdateOperationsInput | string;
    detalle?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LogActivityListRelationFilter = {
    every?: Prisma.LogActivityWhereInput;
    some?: Prisma.LogActivityWhereInput;
    none?: Prisma.LogActivityWhereInput;
};
export type LogActivityOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type LogActivityCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    accion?: Prisma.SortOrder;
    detalle?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
};
export type LogActivityAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
};
export type LogActivityMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    accion?: Prisma.SortOrder;
    detalle?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
};
export type LogActivityMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    accion?: Prisma.SortOrder;
    detalle?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
};
export type LogActivitySumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
};
export type LogActivityCreateNestedManyWithoutUsuarioInput = {
    create?: Prisma.XOR<Prisma.LogActivityCreateWithoutUsuarioInput, Prisma.LogActivityUncheckedCreateWithoutUsuarioInput> | Prisma.LogActivityCreateWithoutUsuarioInput[] | Prisma.LogActivityUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.LogActivityCreateOrConnectWithoutUsuarioInput | Prisma.LogActivityCreateOrConnectWithoutUsuarioInput[];
    createMany?: Prisma.LogActivityCreateManyUsuarioInputEnvelope;
    connect?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
};
export type LogActivityUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: Prisma.XOR<Prisma.LogActivityCreateWithoutUsuarioInput, Prisma.LogActivityUncheckedCreateWithoutUsuarioInput> | Prisma.LogActivityCreateWithoutUsuarioInput[] | Prisma.LogActivityUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.LogActivityCreateOrConnectWithoutUsuarioInput | Prisma.LogActivityCreateOrConnectWithoutUsuarioInput[];
    createMany?: Prisma.LogActivityCreateManyUsuarioInputEnvelope;
    connect?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
};
export type LogActivityUpdateManyWithoutUsuarioNestedInput = {
    create?: Prisma.XOR<Prisma.LogActivityCreateWithoutUsuarioInput, Prisma.LogActivityUncheckedCreateWithoutUsuarioInput> | Prisma.LogActivityCreateWithoutUsuarioInput[] | Prisma.LogActivityUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.LogActivityCreateOrConnectWithoutUsuarioInput | Prisma.LogActivityCreateOrConnectWithoutUsuarioInput[];
    upsert?: Prisma.LogActivityUpsertWithWhereUniqueWithoutUsuarioInput | Prisma.LogActivityUpsertWithWhereUniqueWithoutUsuarioInput[];
    createMany?: Prisma.LogActivityCreateManyUsuarioInputEnvelope;
    set?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
    disconnect?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
    delete?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
    connect?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
    update?: Prisma.LogActivityUpdateWithWhereUniqueWithoutUsuarioInput | Prisma.LogActivityUpdateWithWhereUniqueWithoutUsuarioInput[];
    updateMany?: Prisma.LogActivityUpdateManyWithWhereWithoutUsuarioInput | Prisma.LogActivityUpdateManyWithWhereWithoutUsuarioInput[];
    deleteMany?: Prisma.LogActivityScalarWhereInput | Prisma.LogActivityScalarWhereInput[];
};
export type LogActivityUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: Prisma.XOR<Prisma.LogActivityCreateWithoutUsuarioInput, Prisma.LogActivityUncheckedCreateWithoutUsuarioInput> | Prisma.LogActivityCreateWithoutUsuarioInput[] | Prisma.LogActivityUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.LogActivityCreateOrConnectWithoutUsuarioInput | Prisma.LogActivityCreateOrConnectWithoutUsuarioInput[];
    upsert?: Prisma.LogActivityUpsertWithWhereUniqueWithoutUsuarioInput | Prisma.LogActivityUpsertWithWhereUniqueWithoutUsuarioInput[];
    createMany?: Prisma.LogActivityCreateManyUsuarioInputEnvelope;
    set?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
    disconnect?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
    delete?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
    connect?: Prisma.LogActivityWhereUniqueInput | Prisma.LogActivityWhereUniqueInput[];
    update?: Prisma.LogActivityUpdateWithWhereUniqueWithoutUsuarioInput | Prisma.LogActivityUpdateWithWhereUniqueWithoutUsuarioInput[];
    updateMany?: Prisma.LogActivityUpdateManyWithWhereWithoutUsuarioInput | Prisma.LogActivityUpdateManyWithWhereWithoutUsuarioInput[];
    deleteMany?: Prisma.LogActivityScalarWhereInput | Prisma.LogActivityScalarWhereInput[];
};
export type LogActivityCreateWithoutUsuarioInput = {
    accion: string;
    detalle?: string | null;
    fechaHora?: Date | string;
};
export type LogActivityUncheckedCreateWithoutUsuarioInput = {
    id?: number;
    accion: string;
    detalle?: string | null;
    fechaHora?: Date | string;
};
export type LogActivityCreateOrConnectWithoutUsuarioInput = {
    where: Prisma.LogActivityWhereUniqueInput;
    create: Prisma.XOR<Prisma.LogActivityCreateWithoutUsuarioInput, Prisma.LogActivityUncheckedCreateWithoutUsuarioInput>;
};
export type LogActivityCreateManyUsuarioInputEnvelope = {
    data: Prisma.LogActivityCreateManyUsuarioInput | Prisma.LogActivityCreateManyUsuarioInput[];
    skipDuplicates?: boolean;
};
export type LogActivityUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: Prisma.LogActivityWhereUniqueInput;
    update: Prisma.XOR<Prisma.LogActivityUpdateWithoutUsuarioInput, Prisma.LogActivityUncheckedUpdateWithoutUsuarioInput>;
    create: Prisma.XOR<Prisma.LogActivityCreateWithoutUsuarioInput, Prisma.LogActivityUncheckedCreateWithoutUsuarioInput>;
};
export type LogActivityUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: Prisma.LogActivityWhereUniqueInput;
    data: Prisma.XOR<Prisma.LogActivityUpdateWithoutUsuarioInput, Prisma.LogActivityUncheckedUpdateWithoutUsuarioInput>;
};
export type LogActivityUpdateManyWithWhereWithoutUsuarioInput = {
    where: Prisma.LogActivityScalarWhereInput;
    data: Prisma.XOR<Prisma.LogActivityUpdateManyMutationInput, Prisma.LogActivityUncheckedUpdateManyWithoutUsuarioInput>;
};
export type LogActivityScalarWhereInput = {
    AND?: Prisma.LogActivityScalarWhereInput | Prisma.LogActivityScalarWhereInput[];
    OR?: Prisma.LogActivityScalarWhereInput[];
    NOT?: Prisma.LogActivityScalarWhereInput | Prisma.LogActivityScalarWhereInput[];
    id?: Prisma.IntFilter<"LogActivity"> | number;
    usuarioId?: Prisma.IntFilter<"LogActivity"> | number;
    accion?: Prisma.StringFilter<"LogActivity"> | string;
    detalle?: Prisma.StringNullableFilter<"LogActivity"> | string | null;
    fechaHora?: Prisma.DateTimeFilter<"LogActivity"> | Date | string;
};
export type LogActivityCreateManyUsuarioInput = {
    id?: number;
    accion: string;
    detalle?: string | null;
    fechaHora?: Date | string;
};
export type LogActivityUpdateWithoutUsuarioInput = {
    accion?: Prisma.StringFieldUpdateOperationsInput | string;
    detalle?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LogActivityUncheckedUpdateWithoutUsuarioInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    accion?: Prisma.StringFieldUpdateOperationsInput | string;
    detalle?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LogActivityUncheckedUpdateManyWithoutUsuarioInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    accion?: Prisma.StringFieldUpdateOperationsInput | string;
    detalle?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LogActivitySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    usuarioId?: boolean;
    accion?: boolean;
    detalle?: boolean;
    fechaHora?: boolean;
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["logActivity"]>;
export type LogActivitySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    usuarioId?: boolean;
    accion?: boolean;
    detalle?: boolean;
    fechaHora?: boolean;
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["logActivity"]>;
export type LogActivitySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    usuarioId?: boolean;
    accion?: boolean;
    detalle?: boolean;
    fechaHora?: boolean;
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["logActivity"]>;
export type LogActivitySelectScalar = {
    id?: boolean;
    usuarioId?: boolean;
    accion?: boolean;
    detalle?: boolean;
    fechaHora?: boolean;
};
export type LogActivityOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "usuarioId" | "accion" | "detalle" | "fechaHora", ExtArgs["result"]["logActivity"]>;
export type LogActivityInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type LogActivityIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type LogActivityIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $LogActivityPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "LogActivity";
    objects: {
        usuario: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        usuarioId: number;
        accion: string;
        detalle: string | null;
        fechaHora: Date;
    }, ExtArgs["result"]["logActivity"]>;
    composites: {};
};
export type LogActivityGetPayload<S extends boolean | null | undefined | LogActivityDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$LogActivityPayload, S>;
export type LogActivityCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<LogActivityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: LogActivityCountAggregateInputType | true;
};
export interface LogActivityDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['LogActivity'];
        meta: {
            name: 'LogActivity';
        };
    };
    findUnique<T extends LogActivityFindUniqueArgs>(args: Prisma.SelectSubset<T, LogActivityFindUniqueArgs<ExtArgs>>): Prisma.Prisma__LogActivityClient<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends LogActivityFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, LogActivityFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__LogActivityClient<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends LogActivityFindFirstArgs>(args?: Prisma.SelectSubset<T, LogActivityFindFirstArgs<ExtArgs>>): Prisma.Prisma__LogActivityClient<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends LogActivityFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, LogActivityFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__LogActivityClient<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends LogActivityFindManyArgs>(args?: Prisma.SelectSubset<T, LogActivityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends LogActivityCreateArgs>(args: Prisma.SelectSubset<T, LogActivityCreateArgs<ExtArgs>>): Prisma.Prisma__LogActivityClient<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends LogActivityCreateManyArgs>(args?: Prisma.SelectSubset<T, LogActivityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends LogActivityCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, LogActivityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends LogActivityDeleteArgs>(args: Prisma.SelectSubset<T, LogActivityDeleteArgs<ExtArgs>>): Prisma.Prisma__LogActivityClient<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends LogActivityUpdateArgs>(args: Prisma.SelectSubset<T, LogActivityUpdateArgs<ExtArgs>>): Prisma.Prisma__LogActivityClient<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends LogActivityDeleteManyArgs>(args?: Prisma.SelectSubset<T, LogActivityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends LogActivityUpdateManyArgs>(args: Prisma.SelectSubset<T, LogActivityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends LogActivityUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, LogActivityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends LogActivityUpsertArgs>(args: Prisma.SelectSubset<T, LogActivityUpsertArgs<ExtArgs>>): Prisma.Prisma__LogActivityClient<runtime.Types.Result.GetResult<Prisma.$LogActivityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends LogActivityCountArgs>(args?: Prisma.Subset<T, LogActivityCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], LogActivityCountAggregateOutputType> : number>;
    aggregate<T extends LogActivityAggregateArgs>(args: Prisma.Subset<T, LogActivityAggregateArgs>): Prisma.PrismaPromise<GetLogActivityAggregateType<T>>;
    groupBy<T extends LogActivityGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: LogActivityGroupByArgs['orderBy'];
    } : {
        orderBy?: LogActivityGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, LogActivityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLogActivityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: LogActivityFieldRefs;
}
export interface Prisma__LogActivityClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    usuario<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface LogActivityFieldRefs {
    readonly id: Prisma.FieldRef<"LogActivity", 'Int'>;
    readonly usuarioId: Prisma.FieldRef<"LogActivity", 'Int'>;
    readonly accion: Prisma.FieldRef<"LogActivity", 'String'>;
    readonly detalle: Prisma.FieldRef<"LogActivity", 'String'>;
    readonly fechaHora: Prisma.FieldRef<"LogActivity", 'DateTime'>;
}
export type LogActivityFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelect<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    include?: Prisma.LogActivityInclude<ExtArgs> | null;
    where: Prisma.LogActivityWhereUniqueInput;
};
export type LogActivityFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelect<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    include?: Prisma.LogActivityInclude<ExtArgs> | null;
    where: Prisma.LogActivityWhereUniqueInput;
};
export type LogActivityFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type LogActivityFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type LogActivityFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type LogActivityCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelect<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    include?: Prisma.LogActivityInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.LogActivityCreateInput, Prisma.LogActivityUncheckedCreateInput>;
};
export type LogActivityCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.LogActivityCreateManyInput | Prisma.LogActivityCreateManyInput[];
    skipDuplicates?: boolean;
};
export type LogActivityCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    data: Prisma.LogActivityCreateManyInput | Prisma.LogActivityCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.LogActivityIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type LogActivityUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelect<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    include?: Prisma.LogActivityInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.LogActivityUpdateInput, Prisma.LogActivityUncheckedUpdateInput>;
    where: Prisma.LogActivityWhereUniqueInput;
};
export type LogActivityUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.LogActivityUpdateManyMutationInput, Prisma.LogActivityUncheckedUpdateManyInput>;
    where?: Prisma.LogActivityWhereInput;
    limit?: number;
};
export type LogActivityUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.LogActivityUpdateManyMutationInput, Prisma.LogActivityUncheckedUpdateManyInput>;
    where?: Prisma.LogActivityWhereInput;
    limit?: number;
    include?: Prisma.LogActivityIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type LogActivityUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelect<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    include?: Prisma.LogActivityInclude<ExtArgs> | null;
    where: Prisma.LogActivityWhereUniqueInput;
    create: Prisma.XOR<Prisma.LogActivityCreateInput, Prisma.LogActivityUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.LogActivityUpdateInput, Prisma.LogActivityUncheckedUpdateInput>;
};
export type LogActivityDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelect<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    include?: Prisma.LogActivityInclude<ExtArgs> | null;
    where: Prisma.LogActivityWhereUniqueInput;
};
export type LogActivityDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LogActivityWhereInput;
    limit?: number;
};
export type LogActivityDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LogActivitySelect<ExtArgs> | null;
    omit?: Prisma.LogActivityOmit<ExtArgs> | null;
    include?: Prisma.LogActivityInclude<ExtArgs> | null;
};
export {};
