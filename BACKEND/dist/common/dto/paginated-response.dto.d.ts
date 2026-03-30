export interface PaginatedMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginatedMeta;
}
export declare function buildPaginatedResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T>;
