import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace";
export type RoleModel = runtime.Types.Result.DefaultSelection<Prisma.$RolePayload>;
export type AggregateRole = {
    _count: RoleCountAggregateOutputType | null;
    _avg: RoleAvgAggregateOutputType | null;
    _sum: RoleSumAggregateOutputType | null;
    _min: RoleMinAggregateOutputType | null;
    _max: RoleMaxAggregateOutputType | null;
};
export type RoleAvgAggregateOutputType = {
    id: number | null;
};
export type RoleSumAggregateOutputType = {
    id: number | null;
};
export type RoleMinAggregateOutputType = {
    id: number | null;
    rolDescripcion: string | null;
};
export type RoleMaxAggregateOutputType = {
    id: number | null;
    rolDescripcion: string | null;
};
export type RoleCountAggregateOutputType = {
    id: number;
    rolDescripcion: number;
    _all: number;
};
export type RoleAvgAggregateInputType = {
    id?: true;
};
export type RoleSumAggregateInputType = {
    id?: true;
};
export type RoleMinAggregateInputType = {
    id?: true;
    rolDescripcion?: true;
};
export type RoleMaxAggregateInputType = {
    id?: true;
    rolDescripcion?: true;
};
export type RoleCountAggregateInputType = {
    id?: true;
    rolDescripcion?: true;
    _all?: true;
};
export type RoleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationInput | Prisma.RoleOrderByWithRelationInput[];
    cursor?: Prisma.RoleWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RoleCountAggregateInputType;
    _avg?: RoleAvgAggregateInputType;
    _sum?: RoleSumAggregateInputType;
    _min?: RoleMinAggregateInputType;
    _max?: RoleMaxAggregateInputType;
};
export type GetRoleAggregateType<T extends RoleAggregateArgs> = {
    [P in keyof T & keyof AggregateRole]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRole[P]> : Prisma.GetScalarType<T[P], AggregateRole[P]>;
};
export type RoleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithAggregationInput | Prisma.RoleOrderByWithAggregationInput[];
    by: Prisma.RoleScalarFieldEnum[] | Prisma.RoleScalarFieldEnum;
    having?: Prisma.RoleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RoleCountAggregateInputType | true;
    _avg?: RoleAvgAggregateInputType;
    _sum?: RoleSumAggregateInputType;
    _min?: RoleMinAggregateInputType;
    _max?: RoleMaxAggregateInputType;
};
export type RoleGroupByOutputType = {
    id: number;
    rolDescripcion: string;
    _count: RoleCountAggregateOutputType | null;
    _avg: RoleAvgAggregateOutputType | null;
    _sum: RoleSumAggregateOutputType | null;
    _min: RoleMinAggregateOutputType | null;
    _max: RoleMaxAggregateOutputType | null;
};
type GetRoleGroupByPayload<T extends RoleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RoleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RoleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RoleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RoleGroupByOutputType[P]>;
}>>;
export type RoleWhereInput = {
    AND?: Prisma.RoleWhereInput | Prisma.RoleWhereInput[];
    OR?: Prisma.RoleWhereInput[];
    NOT?: Prisma.RoleWhereInput | Prisma.RoleWhereInput[];
    id?: Prisma.IntFilter<"Role"> | number;
    rolDescripcion?: Prisma.StringFilter<"Role"> | string;
    usuarios?: Prisma.UserListRelationFilter;
    reportesRoles?: Prisma.ReportRoleListRelationFilter;
};
export type RoleOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    rolDescripcion?: Prisma.SortOrder;
    usuarios?: Prisma.UserOrderByRelationAggregateInput;
    reportesRoles?: Prisma.ReportRoleOrderByRelationAggregateInput;
};
export type RoleWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    rolDescripcion?: string;
    AND?: Prisma.RoleWhereInput | Prisma.RoleWhereInput[];
    OR?: Prisma.RoleWhereInput[];
    NOT?: Prisma.RoleWhereInput | Prisma.RoleWhereInput[];
    usuarios?: Prisma.UserListRelationFilter;
    reportesRoles?: Prisma.ReportRoleListRelationFilter;
}, "id" | "rolDescripcion">;
export type RoleOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    rolDescripcion?: Prisma.SortOrder;
    _count?: Prisma.RoleCountOrderByAggregateInput;
    _avg?: Prisma.RoleAvgOrderByAggregateInput;
    _max?: Prisma.RoleMaxOrderByAggregateInput;
    _min?: Prisma.RoleMinOrderByAggregateInput;
    _sum?: Prisma.RoleSumOrderByAggregateInput;
};
export type RoleScalarWhereWithAggregatesInput = {
    AND?: Prisma.RoleScalarWhereWithAggregatesInput | Prisma.RoleScalarWhereWithAggregatesInput[];
    OR?: Prisma.RoleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RoleScalarWhereWithAggregatesInput | Prisma.RoleScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Role"> | number;
    rolDescripcion?: Prisma.StringWithAggregatesFilter<"Role"> | string;
};
export type RoleCreateInput = {
    rolDescripcion: string;
    usuarios?: Prisma.UserCreateNestedManyWithoutRolInput;
    reportesRoles?: Prisma.ReportRoleCreateNestedManyWithoutRolInput;
};
export type RoleUncheckedCreateInput = {
    id?: number;
    rolDescripcion: string;
    usuarios?: Prisma.UserUncheckedCreateNestedManyWithoutRolInput;
    reportesRoles?: Prisma.ReportRoleUncheckedCreateNestedManyWithoutRolInput;
};
export type RoleUpdateInput = {
    rolDescripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    usuarios?: Prisma.UserUpdateManyWithoutRolNestedInput;
    reportesRoles?: Prisma.ReportRoleUpdateManyWithoutRolNestedInput;
};
export type RoleUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    rolDescripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    usuarios?: Prisma.UserUncheckedUpdateManyWithoutRolNestedInput;
    reportesRoles?: Prisma.ReportRoleUncheckedUpdateManyWithoutRolNestedInput;
};
export type RoleCreateManyInput = {
    id?: number;
    rolDescripcion: string;
};
export type RoleUpdateManyMutationInput = {
    rolDescripcion?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RoleUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    rolDescripcion?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type RoleCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    rolDescripcion?: Prisma.SortOrder;
};
export type RoleAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type RoleMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    rolDescripcion?: Prisma.SortOrder;
};
export type RoleMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    rolDescripcion?: Prisma.SortOrder;
};
export type RoleSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type RoleScalarRelationFilter = {
    is?: Prisma.RoleWhereInput;
    isNot?: Prisma.RoleWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type RoleCreateNestedOneWithoutUsuariosInput = {
    create?: Prisma.XOR<Prisma.RoleCreateWithoutUsuariosInput, Prisma.RoleUncheckedCreateWithoutUsuariosInput>;
    connectOrCreate?: Prisma.RoleCreateOrConnectWithoutUsuariosInput;
    connect?: Prisma.RoleWhereUniqueInput;
};
export type RoleUpdateOneRequiredWithoutUsuariosNestedInput = {
    create?: Prisma.XOR<Prisma.RoleCreateWithoutUsuariosInput, Prisma.RoleUncheckedCreateWithoutUsuariosInput>;
    connectOrCreate?: Prisma.RoleCreateOrConnectWithoutUsuariosInput;
    upsert?: Prisma.RoleUpsertWithoutUsuariosInput;
    connect?: Prisma.RoleWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RoleUpdateToOneWithWhereWithoutUsuariosInput, Prisma.RoleUpdateWithoutUsuariosInput>, Prisma.RoleUncheckedUpdateWithoutUsuariosInput>;
};
export type RoleCreateNestedOneWithoutReportesRolesInput = {
    create?: Prisma.XOR<Prisma.RoleCreateWithoutReportesRolesInput, Prisma.RoleUncheckedCreateWithoutReportesRolesInput>;
    connectOrCreate?: Prisma.RoleCreateOrConnectWithoutReportesRolesInput;
    connect?: Prisma.RoleWhereUniqueInput;
};
export type RoleUpdateOneRequiredWithoutReportesRolesNestedInput = {
    create?: Prisma.XOR<Prisma.RoleCreateWithoutReportesRolesInput, Prisma.RoleUncheckedCreateWithoutReportesRolesInput>;
    connectOrCreate?: Prisma.RoleCreateOrConnectWithoutReportesRolesInput;
    upsert?: Prisma.RoleUpsertWithoutReportesRolesInput;
    connect?: Prisma.RoleWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.RoleUpdateToOneWithWhereWithoutReportesRolesInput, Prisma.RoleUpdateWithoutReportesRolesInput>, Prisma.RoleUncheckedUpdateWithoutReportesRolesInput>;
};
export type RoleCreateWithoutUsuariosInput = {
    rolDescripcion: string;
    reportesRoles?: Prisma.ReportRoleCreateNestedManyWithoutRolInput;
};
export type RoleUncheckedCreateWithoutUsuariosInput = {
    id?: number;
    rolDescripcion: string;
    reportesRoles?: Prisma.ReportRoleUncheckedCreateNestedManyWithoutRolInput;
};
export type RoleCreateOrConnectWithoutUsuariosInput = {
    where: Prisma.RoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.RoleCreateWithoutUsuariosInput, Prisma.RoleUncheckedCreateWithoutUsuariosInput>;
};
export type RoleUpsertWithoutUsuariosInput = {
    update: Prisma.XOR<Prisma.RoleUpdateWithoutUsuariosInput, Prisma.RoleUncheckedUpdateWithoutUsuariosInput>;
    create: Prisma.XOR<Prisma.RoleCreateWithoutUsuariosInput, Prisma.RoleUncheckedCreateWithoutUsuariosInput>;
    where?: Prisma.RoleWhereInput;
};
export type RoleUpdateToOneWithWhereWithoutUsuariosInput = {
    where?: Prisma.RoleWhereInput;
    data: Prisma.XOR<Prisma.RoleUpdateWithoutUsuariosInput, Prisma.RoleUncheckedUpdateWithoutUsuariosInput>;
};
export type RoleUpdateWithoutUsuariosInput = {
    rolDescripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    reportesRoles?: Prisma.ReportRoleUpdateManyWithoutRolNestedInput;
};
export type RoleUncheckedUpdateWithoutUsuariosInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    rolDescripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    reportesRoles?: Prisma.ReportRoleUncheckedUpdateManyWithoutRolNestedInput;
};
export type RoleCreateWithoutReportesRolesInput = {
    rolDescripcion: string;
    usuarios?: Prisma.UserCreateNestedManyWithoutRolInput;
};
export type RoleUncheckedCreateWithoutReportesRolesInput = {
    id?: number;
    rolDescripcion: string;
    usuarios?: Prisma.UserUncheckedCreateNestedManyWithoutRolInput;
};
export type RoleCreateOrConnectWithoutReportesRolesInput = {
    where: Prisma.RoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.RoleCreateWithoutReportesRolesInput, Prisma.RoleUncheckedCreateWithoutReportesRolesInput>;
};
export type RoleUpsertWithoutReportesRolesInput = {
    update: Prisma.XOR<Prisma.RoleUpdateWithoutReportesRolesInput, Prisma.RoleUncheckedUpdateWithoutReportesRolesInput>;
    create: Prisma.XOR<Prisma.RoleCreateWithoutReportesRolesInput, Prisma.RoleUncheckedCreateWithoutReportesRolesInput>;
    where?: Prisma.RoleWhereInput;
};
export type RoleUpdateToOneWithWhereWithoutReportesRolesInput = {
    where?: Prisma.RoleWhereInput;
    data: Prisma.XOR<Prisma.RoleUpdateWithoutReportesRolesInput, Prisma.RoleUncheckedUpdateWithoutReportesRolesInput>;
};
export type RoleUpdateWithoutReportesRolesInput = {
    rolDescripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    usuarios?: Prisma.UserUpdateManyWithoutRolNestedInput;
};
export type RoleUncheckedUpdateWithoutReportesRolesInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    rolDescripcion?: Prisma.StringFieldUpdateOperationsInput | string;
    usuarios?: Prisma.UserUncheckedUpdateManyWithoutRolNestedInput;
};
export type RoleCountOutputType = {
    usuarios: number;
    reportesRoles: number;
};
export type RoleCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuarios?: boolean | RoleCountOutputTypeCountUsuariosArgs;
    reportesRoles?: boolean | RoleCountOutputTypeCountReportesRolesArgs;
};
export type RoleCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleCountOutputTypeSelect<ExtArgs> | null;
};
export type RoleCountOutputTypeCountUsuariosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
};
export type RoleCountOutputTypeCountReportesRolesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ReportRoleWhereInput;
};
export type RoleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    rolDescripcion?: boolean;
    usuarios?: boolean | Prisma.Role$usuariosArgs<ExtArgs>;
    reportesRoles?: boolean | Prisma.Role$reportesRolesArgs<ExtArgs>;
    _count?: boolean | Prisma.RoleCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["role"]>;
export type RoleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    rolDescripcion?: boolean;
}, ExtArgs["result"]["role"]>;
export type RoleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    rolDescripcion?: boolean;
}, ExtArgs["result"]["role"]>;
export type RoleSelectScalar = {
    id?: boolean;
    rolDescripcion?: boolean;
};
export type RoleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "rolDescripcion", ExtArgs["result"]["role"]>;
export type RoleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    usuarios?: boolean | Prisma.Role$usuariosArgs<ExtArgs>;
    reportesRoles?: boolean | Prisma.Role$reportesRolesArgs<ExtArgs>;
    _count?: boolean | Prisma.RoleCountOutputTypeDefaultArgs<ExtArgs>;
};
export type RoleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type RoleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $RolePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Role";
    objects: {
        usuarios: Prisma.$UserPayload<ExtArgs>[];
        reportesRoles: Prisma.$ReportRolePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        rolDescripcion: string;
    }, ExtArgs["result"]["role"]>;
    composites: {};
};
export type RoleGetPayload<S extends boolean | null | undefined | RoleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RolePayload, S>;
export type RoleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RoleCountAggregateInputType | true;
};
export interface RoleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Role'];
        meta: {
            name: 'Role';
        };
    };
    findUnique<T extends RoleFindUniqueArgs>(args: Prisma.SelectSubset<T, RoleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RoleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RoleFindFirstArgs>(args?: Prisma.SelectSubset<T, RoleFindFirstArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RoleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RoleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RoleFindManyArgs>(args?: Prisma.SelectSubset<T, RoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RoleCreateArgs>(args: Prisma.SelectSubset<T, RoleCreateArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RoleCreateManyArgs>(args?: Prisma.SelectSubset<T, RoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RoleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RoleDeleteArgs>(args: Prisma.SelectSubset<T, RoleDeleteArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RoleUpdateArgs>(args: Prisma.SelectSubset<T, RoleUpdateArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RoleDeleteManyArgs>(args?: Prisma.SelectSubset<T, RoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RoleUpdateManyArgs>(args: Prisma.SelectSubset<T, RoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RoleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RoleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RoleUpsertArgs>(args: Prisma.SelectSubset<T, RoleUpsertArgs<ExtArgs>>): Prisma.Prisma__RoleClient<runtime.Types.Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RoleCountArgs>(args?: Prisma.Subset<T, RoleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RoleCountAggregateOutputType> : number>;
    aggregate<T extends RoleAggregateArgs>(args: Prisma.Subset<T, RoleAggregateArgs>): Prisma.PrismaPromise<GetRoleAggregateType<T>>;
    groupBy<T extends RoleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RoleGroupByArgs['orderBy'];
    } : {
        orderBy?: RoleGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RoleFieldRefs;
}
export interface Prisma__RoleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    usuarios<T extends Prisma.Role$usuariosArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Role$usuariosArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    reportesRoles<T extends Prisma.Role$reportesRolesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Role$reportesRolesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ReportRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RoleFieldRefs {
    readonly id: Prisma.FieldRef<"Role", 'Int'>;
    readonly rolDescripcion: Prisma.FieldRef<"Role", 'String'>;
}
export type RoleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
    where: Prisma.RoleWhereUniqueInput;
};
export type RoleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
    where: Prisma.RoleWhereUniqueInput;
};
export type RoleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationInput | Prisma.RoleOrderByWithRelationInput[];
    cursor?: Prisma.RoleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RoleScalarFieldEnum | Prisma.RoleScalarFieldEnum[];
};
export type RoleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationInput | Prisma.RoleOrderByWithRelationInput[];
    cursor?: Prisma.RoleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RoleScalarFieldEnum | Prisma.RoleScalarFieldEnum[];
};
export type RoleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationInput | Prisma.RoleOrderByWithRelationInput[];
    cursor?: Prisma.RoleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RoleScalarFieldEnum | Prisma.RoleScalarFieldEnum[];
};
export type RoleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RoleCreateInput, Prisma.RoleUncheckedCreateInput>;
};
export type RoleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RoleCreateManyInput | Prisma.RoleCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RoleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    data: Prisma.RoleCreateManyInput | Prisma.RoleCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RoleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RoleUpdateInput, Prisma.RoleUncheckedUpdateInput>;
    where: Prisma.RoleWhereUniqueInput;
};
export type RoleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RoleUpdateManyMutationInput, Prisma.RoleUncheckedUpdateManyInput>;
    where?: Prisma.RoleWhereInput;
    limit?: number;
};
export type RoleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RoleUpdateManyMutationInput, Prisma.RoleUncheckedUpdateManyInput>;
    where?: Prisma.RoleWhereInput;
    limit?: number;
};
export type RoleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
    where: Prisma.RoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.RoleCreateInput, Prisma.RoleUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RoleUpdateInput, Prisma.RoleUncheckedUpdateInput>;
};
export type RoleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
    where: Prisma.RoleWhereUniqueInput;
};
export type RoleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RoleWhereInput;
    limit?: number;
};
export type Role$usuariosArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Role$reportesRolesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type RoleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RoleSelect<ExtArgs> | null;
    omit?: Prisma.RoleOmit<ExtArgs> | null;
    include?: Prisma.RoleInclude<ExtArgs> | null;
};
export {};
