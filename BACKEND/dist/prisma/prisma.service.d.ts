import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private readonly client;
    get user(): import("../generated/prisma/models").UserDelegate<import("@prisma/client/runtime/library").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    get role(): import("../generated/prisma/models").RoleDelegate<import("@prisma/client/runtime/library").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    get report(): import("../generated/prisma/models").ReportDelegate<import("@prisma/client/runtime/library").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    get auditAccess(): import("../generated/prisma/models").AuditAccessDelegate<import("@prisma/client/runtime/library").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    get logActivity(): import("../generated/prisma/models").LogActivityDelegate<import("@prisma/client/runtime/library").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    get reportRole(): import("../generated/prisma/models").ReportRoleDelegate<import("@prisma/client/runtime/library").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    get reportViewLog(): import("../generated/prisma/models").ReportViewLogDelegate<import("@prisma/client/runtime/library").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
