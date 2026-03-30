import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
export type AuditAccessModel = runtime.Types.Result.DefaultSelection<Prisma.$AuditAccessPayload>;
export type AggregateAuditAccess = {
    _count: AuditAccessCountAggregateOutputType | null;
    _avg: AuditAccessAvgAggregateOutputType | null;
    _sum: AuditAccessSumAggregateOutputType | null;
    _min: AuditAccessMinAggregateOutputType | null;
    _max: AuditAccessMaxAggregateOutputType | null;
};
export type AuditAccessAvgAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
};
export type AuditAccessSumAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
};
export type AuditAccessMinAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
    fechaHora: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
};
export type AuditAccessMaxAggregateOutputType = {
    id: number | null;
    usuarioId: number | null;
    fechaHora: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
};
export type AuditAccessCountAggregateOutputType = {
    id: number;
    usuarioId: number;
    fechaHora: number;
    ipAddress: number;
    userAgent: number;
    _all: number;
};
export type AuditAccessAvgAggregateInputType = {
    id?: true;
    usuarioId?: true;
};
export type AuditAccessSumAggregateInputType = {
    id?: true;
    usuarioId?: true;
};
export type AuditAccessMinAggregateInputType = {
    id?: true;
    usuarioId?: true;
    fechaHora?: true;
    ipAddress?: true;
    userAgent?: true;
};
export type AuditAccessMaxAggregateInputType = {
    id?: true;
    usuarioId?: true;
    fechaHora?: true;
    ipAddress?: true;
    userAgent?: true;
};
export type AuditAccessCountAggregateInputType = {
    id?: true;
    usuarioId?: true;
    fechaHora?: true;
    ipAddress?: true;
    userAgent?: true;
    _all?: true;
};
export type AuditAccessAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditAccessWhereInput;
    orderBy?: Prisma.AuditAccessOrderByWithRelationInput | Prisma.AuditAccessOrderByWithRelationInput[];
    cursor?: Prisma.AuditAccessWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AuditAccessCountAggregateInputType;
    _avg?: AuditAccessAvgAggregateInputType;
    _sum?: AuditAccessSumAggregateInputType;
    _min?: AuditAccessMinAggregateInputType;
    _max?: AuditAccessMaxAggregateInputType;
};
export type GetAuditAccessAggregateType<T extends AuditAccessAggregateArgs> = {
    [P in keyof T & keyof AggregateAuditAccess]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAuditAccess[P]> : Prisma.GetScalarType<T[P], AggregateAuditAccess[P]>;
};
export type AuditAccessGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditAccessWhereInput;
    orderBy?: Prisma.AuditAccessOrderByWithAggregationInput | Prisma.AuditAccessOrderByWithAggregationInput[];
    by: Prisma.AuditAccessScalarFieldEnum[] | Prisma.AuditAccessScalarFieldEnum;
    having?: Prisma.AuditAccessScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AuditAccessCountAggregateInputType | true;
    _avg?: AuditAccessAvgAggregateInputType;
    _sum?: AuditAccessSumAggregateInputType;
    _min?: AuditAccessMinAggregateInputType;
    _max?: AuditAccessMaxAggregateInputType;
};
export type AuditAccessGroupByOutputType = {
    id: number;
    usuarioId: number;
    fechaHora: Date;
    ipAddress: string | null;
    userAgent: string | null;
    _count: AuditAccessCountAggregateOutputType | null;
    _avg: AuditAccessAvgAggregateOutputType | null;
    _sum: AuditAccessSumAggregateOutputType | null;
    _min: AuditAccessMinAggregateOutputType | null;
    _max: AuditAccessMaxAggregateOutputType | null;
};
type GetAuditAccessGroupByPayload<T extends AuditAccessGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AuditAccessGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AuditAccessGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AuditAccessGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AuditAccessGroupByOutputType[P]>;
}>>;
export type AuditAccessWhereInput = {
    AND?: Prisma.AuditAccessWhereInput | Prisma.AuditAccessWhereInput[];
    OR?: Prisma.AuditAccessWhereInput[];
    NOT?: Prisma.AuditAccessWhereInput | Prisma.AuditAccessWhereInput[];
    id?: Prisma.IntFilter<"AuditAccess"> | number;
    usuarioId?: Prisma.IntFilter<"AuditAccess"> | number;
    fechaHora?: Prisma.DateTimeFilter<"AuditAccess"> | Date | string;
    ipAddress?: Prisma.StringNullableFilter<"AuditAccess"> | string | null;
    userAgent?: Prisma.StringNullableFilter<"AuditAccess"> | string | null;
    usuario?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type AuditAccessOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    userAgent?: Prisma.SortOrderInput | Prisma.SortOrder;
    usuario?: Prisma.UserOrderByWithRelationInput;
};
export type AuditAccessWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.AuditAccessWhereInput | Prisma.AuditAccessWhereInput[];
    OR?: Prisma.AuditAccessWhereInput[];
    NOT?: Prisma.AuditAccessWhereInput | Prisma.AuditAccessWhereInput[];
    usuarioId?: Prisma.IntFilter<"AuditAccess"> | number;
    fechaHora?: Prisma.DateTimeFilter<"AuditAccess"> | Date | string;
    ipAddress?: Prisma.StringNullableFilter<"AuditAccess"> | string | null;
    userAgent?: Prisma.StringNullableFilter<"AuditAccess"> | string | null;
    usuario?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type AuditAccessOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrderInput | Prisma.SortOrder;
    userAgent?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.AuditAccessCountOrderByAggregateInput;
    _avg?: Prisma.AuditAccessAvgOrderByAggregateInput;
    _max?: Prisma.AuditAccessMaxOrderByAggregateInput;
    _min?: Prisma.AuditAccessMinOrderByAggregateInput;
    _sum?: Prisma.AuditAccessSumOrderByAggregateInput;
};
export type AuditAccessScalarWhereWithAggregatesInput = {
    AND?: Prisma.AuditAccessScalarWhereWithAggregatesInput | Prisma.AuditAccessScalarWhereWithAggregatesInput[];
    OR?: Prisma.AuditAccessScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AuditAccessScalarWhereWithAggregatesInput | Prisma.AuditAccessScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"AuditAccess"> | number;
    usuarioId?: Prisma.IntWithAggregatesFilter<"AuditAccess"> | number;
    fechaHora?: Prisma.DateTimeWithAggregatesFilter<"AuditAccess"> | Date | string;
    ipAddress?: Prisma.StringNullableWithAggregatesFilter<"AuditAccess"> | string | null;
    userAgent?: Prisma.StringNullableWithAggregatesFilter<"AuditAccess"> | string | null;
};
export type AuditAccessCreateInput = {
    fechaHora?: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
    usuario: Prisma.UserCreateNestedOneWithoutAuditAccessesInput;
};
export type AuditAccessUncheckedCreateInput = {
    id?: number;
    usuarioId: number;
    fechaHora?: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
};
export type AuditAccessUpdateInput = {
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    usuario?: Prisma.UserUpdateOneRequiredWithoutAuditAccessesNestedInput;
};
export type AuditAccessUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type AuditAccessCreateManyInput = {
    id?: number;
    usuarioId: number;
    fechaHora?: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
};
export type AuditAccessUpdateManyMutationInput = {
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type AuditAccessUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    usuarioId?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type AuditAccessListRelationFilter = {
    every?: Prisma.AuditAccessWhereInput;
    some?: Prisma.AuditAccessWhereInput;
    none?: Prisma.AuditAccessWhereInput;
};
export type AuditAccessOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AuditAccessCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
};
export type AuditAccessAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
};
export type AuditAccessMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
};
export type AuditAccessMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
    fechaHora?: Prisma.SortOrder;
    ipAddress?: Prisma.SortOrder;
    userAgent?: Prisma.SortOrder;
};
export type AuditAccessSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    usuarioId?: Prisma.SortOrder;
};
export type AuditAccessCreateNestedManyWithoutUsuarioInput = {
    create?: Prisma.XOR<Prisma.AuditAccessCreateWithoutUsuarioInput, Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput> | Prisma.AuditAccessCreateWithoutUsuarioInput[] | Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.AuditAccessCreateOrConnectWithoutUsuarioInput | Prisma.AuditAccessCreateOrConnectWithoutUsuarioInput[];
    createMany?: Prisma.AuditAccessCreateManyUsuarioInputEnvelope;
    connect?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
};
export type AuditAccessUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: Prisma.XOR<Prisma.AuditAccessCreateWithoutUsuarioInput, Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput> | Prisma.AuditAccessCreateWithoutUsuarioInput[] | Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.AuditAccessCreateOrConnectWithoutUsuarioInput | Prisma.AuditAccessCreateOrConnectWithoutUsuarioInput[];
    createMany?: Prisma.AuditAccessCreateManyUsuarioInputEnvelope;
    connect?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
};
export type AuditAccessUpdateManyWithoutUsuarioNestedInput = {
    create?: Prisma.XOR<Prisma.AuditAccessCreateWithoutUsuarioInput, Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput> | Prisma.AuditAccessCreateWithoutUsuarioInput[] | Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.AuditAccessCreateOrConnectWithoutUsuarioInput | Prisma.AuditAccessCreateOrConnectWithoutUsuarioInput[];
    upsert?: Prisma.AuditAccessUpsertWithWhereUniqueWithoutUsuarioInput | Prisma.AuditAccessUpsertWithWhereUniqueWithoutUsuarioInput[];
    createMany?: Prisma.AuditAccessCreateManyUsuarioInputEnvelope;
    set?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
    disconnect?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
    delete?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
    connect?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
    update?: Prisma.AuditAccessUpdateWithWhereUniqueWithoutUsuarioInput | Prisma.AuditAccessUpdateWithWhereUniqueWithoutUsuarioInput[];
    updateMany?: Prisma.AuditAccessUpdateManyWithWhereWithoutUsuarioInput | Prisma.AuditAccessUpdateManyWithWhereWithoutUsuarioInput[];
    deleteMany?: Prisma.AuditAccessScalarWhereInput | Prisma.AuditAccessScalarWhereInput[];
};
export type AuditAccessUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: Prisma.XOR<Prisma.AuditAccessCreateWithoutUsuarioInput, Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput> | Prisma.AuditAccessCreateWithoutUsuarioInput[] | Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput[];
    connectOrCreate?: Prisma.AuditAccessCreateOrConnectWithoutUsuarioInput | Prisma.AuditAccessCreateOrConnectWithoutUsuarioInput[];
    upsert?: Prisma.AuditAccessUpsertWithWhereUniqueWithoutUsuarioInput | Prisma.AuditAccessUpsertWithWhereUniqueWithoutUsuarioInput[];
    createMany?: Prisma.AuditAccessCreateManyUsuarioInputEnvelope;
    set?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
    disconnect?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
    delete?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
    connect?: Prisma.AuditAccessWhereUniqueInput | Prisma.AuditAccessWhereUniqueInput[];
    update?: Prisma.AuditAccessUpdateWithWhereUniqueWithoutUsuarioInput | Prisma.AuditAccessUpdateWithWhereUniqueWithoutUsuarioInput[];
    updateMany?: Prisma.AuditAccessUpdateManyWithWhereWithoutUsuarioInput | Prisma.AuditAccessUpdateManyWithWhereWithoutUsuarioInput[];
    deleteMany?: Prisma.AuditAccessScalarWhereInput | Prisma.AuditAccessScalarWhereInput[];
};
export type AuditAccessCreateWithoutUsuarioInput = {
    fechaHora?: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
};
export type AuditAccessUncheckedCreateWithoutUsuarioInput = {
    id?: number;
    fechaHora?: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
};
export type AuditAccessCreateOrConnectWithoutUsuarioInput = {
    where: Prisma.AuditAccessWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuditAccessCreateWithoutUsuarioInput, Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput>;
};
export type AuditAccessCreateManyUsuarioInputEnvelope = {
    data: Prisma.AuditAccessCreateManyUsuarioInput | Prisma.AuditAccessCreateManyUsuarioInput[];
    skipDuplicates?: boolean;
};
export type AuditAccessUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: Prisma.AuditAccessWhereUniqueInput;
    update: Prisma.XOR<Prisma.AuditAccessUpdateWithoutUsuarioInput, Prisma.AuditAccessUncheckedUpdateWithoutUsuarioInput>;
    create: Prisma.XOR<Prisma.AuditAccessCreateWithoutUsuarioInput, Prisma.AuditAccessUncheckedCreateWithoutUsuarioInput>;
};
export type AuditAccessUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: Prisma.AuditAccessWhereUniqueInput;
    data: Prisma.XOR<Prisma.AuditAccessUpdateWithoutUsuarioInput, Prisma.AuditAccessUncheckedUpdateWithoutUsuarioInput>;
};
export type AuditAccessUpdateManyWithWhereWithoutUsuarioInput = {
    where: Prisma.AuditAccessScalarWhereInput;
    data: Prisma.XOR<Prisma.AuditAccessUpdateManyMutationInput, Prisma.AuditAccessUncheckedUpdateManyWithoutUsuarioInput>;
};
export type AuditAccessScalarWhereInput = {
    AND?: Prisma.AuditAccessScalarWhereInput | Prisma.AuditAccessScalarWhereInput[];
    OR?: Prisma.AuditAccessScalarWhereInput[];
    NOT?: Prisma.AuditAccessScalarWhereInput | Prisma.AuditAccessScalarWhereInput[];
    id?: Prisma.IntFilter<"AuditAccess"> | number;
    usuarioId?: Prisma.IntFilter<"AuditAccess"> | number;
    fechaHora?: Prisma.DateTimeFilter<"AuditAccess"> | Date | string;
    ipAddress?: Prisma.StringNullableFilter<"AuditAccess"> | string | null;
    userAgent?: Prisma.StringNullableFilter<"AuditAccess"> | string | null;
};
export type AuditAccessCreateManyUsuarioInput = {
    id?: number;
    fechaHora?: Date | string;
    ipAddress?: string | null;
    userAgent?: string | null;
};
export type AuditAccessUpdateWithoutUsuarioInput = {
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type AuditAccessUncheckedUpdateWithoutUsuarioInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type AuditAccessUncheckedUpdateManyWithoutUsuarioInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    fechaHora?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type AuditAccessSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    usuarioId?: boolean;
    fechaHora?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["auditAccess"]>;
export type AuditAccessSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    usuarioId?: boolean;
    fechaHora?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["auditAccess"]>;
export type AuditAccessSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    usuarioId?: boolean;
    fechaHora?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["auditAccess"]>;
export type AuditAccessSelectScalar = {
    id?: boolean;
    usuarioId?: boolean;
    fechaHora?: boolean;
    ipAddress?: boolean;
    userAgent?: boolean;
};
export type AuditAccessOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "usuarioId" | "fechaHora" | "ipAddress" | "userAgent", ExtArgs["result"]["auditAccess"]>;
export type AuditAccessInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type AuditAccessIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type AuditAccessIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuario?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $AuditAccessPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AuditAccess";
    objects: {
        usuario: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        usuarioId: number;
        fechaHora: Date;
        ipAddress: string | null;
        userAgent: string | null;
    }, ExtArgs["result"]["auditAccess"]>;
    composites: {};
};
export type AuditAccessGetPayload<S extends boolean | null | undefined | AuditAccessDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload, S>;
export type AuditAccessCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AuditAccessFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AuditAccessCountAggregateInputType | true;
};
export interface AuditAccessDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AuditAccess'];
        meta: {
            name: 'AuditAccess';
        };
    };
    findUnique<T extends AuditAccessFindUniqueArgs>(args: Prisma.SelectSubset<T, AuditAccessFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AuditAccessClient<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AuditAccessFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AuditAccessFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AuditAccessClient<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AuditAccessFindFirstArgs>(args?: Prisma.SelectSubset<T, AuditAccessFindFirstArgs<ExtArgs>>): Prisma.Prisma__AuditAccessClient<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AuditAccessFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AuditAccessFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AuditAccessClient<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AuditAccessFindManyArgs>(args?: Prisma.SelectSubset<T, AuditAccessFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AuditAccessCreateArgs>(args: Prisma.SelectSubset<T, AuditAccessCreateArgs<ExtArgs>>): Prisma.Prisma__AuditAccessClient<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AuditAccessCreateManyArgs>(args?: Prisma.SelectSubset<T, AuditAccessCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AuditAccessCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AuditAccessCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AuditAccessDeleteArgs>(args: Prisma.SelectSubset<T, AuditAccessDeleteArgs<ExtArgs>>): Prisma.Prisma__AuditAccessClient<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AuditAccessUpdateArgs>(args: Prisma.SelectSubset<T, AuditAccessUpdateArgs<ExtArgs>>): Prisma.Prisma__AuditAccessClient<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AuditAccessDeleteManyArgs>(args?: Prisma.SelectSubset<T, AuditAccessDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AuditAccessUpdateManyArgs>(args: Prisma.SelectSubset<T, AuditAccessUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AuditAccessUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AuditAccessUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AuditAccessUpsertArgs>(args: Prisma.SelectSubset<T, AuditAccessUpsertArgs<ExtArgs>>): Prisma.Prisma__AuditAccessClient<runtime.Types.Result.GetResult<Prisma.$AuditAccessPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AuditAccessCountArgs>(args?: Prisma.Subset<T, AuditAccessCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AuditAccessCountAggregateOutputType> : number>;
    aggregate<T extends AuditAccessAggregateArgs>(args: Prisma.Subset<T, AuditAccessAggregateArgs>): Prisma.PrismaPromise<GetAuditAccessAggregateType<T>>;
    groupBy<T extends AuditAccessGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AuditAccessGroupByArgs['orderBy'];
    } : {
        orderBy?: AuditAccessGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AuditAccessGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditAccessGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AuditAccessFieldRefs;
}
export interface Prisma__AuditAccessClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    usuario<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AuditAccessFieldRefs {
    readonly id: Prisma.FieldRef<"AuditAccess", 'Int'>;
    readonly usuarioId: Prisma.FieldRef<"AuditAccess", 'Int'>;
    readonly fechaHora: Prisma.FieldRef<"AuditAccess", 'DateTime'>;
    readonly ipAddress: Prisma.FieldRef<"AuditAccess", 'String'>;
    readonly userAgent: Prisma.FieldRef<"AuditAccess", 'String'>;
}
export type AuditAccessFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelect<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    include?: Prisma.AuditAccessInclude<ExtArgs> | null;
    where: Prisma.AuditAccessWhereUniqueInput;
};
export type AuditAccessFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelect<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    include?: Prisma.AuditAccessInclude<ExtArgs> | null;
    where: Prisma.AuditAccessWhereUniqueInput;
};
export type AuditAccessFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AuditAccessFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AuditAccessFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AuditAccessCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelect<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    include?: Prisma.AuditAccessInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuditAccessCreateInput, Prisma.AuditAccessUncheckedCreateInput>;
};
export type AuditAccessCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AuditAccessCreateManyInput | Prisma.AuditAccessCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AuditAccessCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    data: Prisma.AuditAccessCreateManyInput | Prisma.AuditAccessCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AuditAccessIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AuditAccessUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelect<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    include?: Prisma.AuditAccessInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuditAccessUpdateInput, Prisma.AuditAccessUncheckedUpdateInput>;
    where: Prisma.AuditAccessWhereUniqueInput;
};
export type AuditAccessUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AuditAccessUpdateManyMutationInput, Prisma.AuditAccessUncheckedUpdateManyInput>;
    where?: Prisma.AuditAccessWhereInput;
    limit?: number;
};
export type AuditAccessUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuditAccessUpdateManyMutationInput, Prisma.AuditAccessUncheckedUpdateManyInput>;
    where?: Prisma.AuditAccessWhereInput;
    limit?: number;
    include?: Prisma.AuditAccessIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AuditAccessUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelect<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    include?: Prisma.AuditAccessInclude<ExtArgs> | null;
    where: Prisma.AuditAccessWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuditAccessCreateInput, Prisma.AuditAccessUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AuditAccessUpdateInput, Prisma.AuditAccessUncheckedUpdateInput>;
};
export type AuditAccessDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelect<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    include?: Prisma.AuditAccessInclude<ExtArgs> | null;
    where: Prisma.AuditAccessWhereUniqueInput;
};
export type AuditAccessDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuditAccessWhereInput;
    limit?: number;
};
export type AuditAccessDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuditAccessSelect<ExtArgs> | null;
    omit?: Prisma.AuditAccessOmit<ExtArgs> | null;
    include?: Prisma.AuditAccessInclude<ExtArgs> | null;
};
export {};
