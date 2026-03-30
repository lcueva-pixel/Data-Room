"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginatedResponse = buildPaginatedResponse;
function buildPaginatedResponse(data, total, page, limit) {
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=paginated-response.dto.js.map