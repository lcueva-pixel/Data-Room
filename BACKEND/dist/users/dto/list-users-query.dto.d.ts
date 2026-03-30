import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class ListUsersQueryDto extends PaginationQueryDto {
    rolId?: number;
    activo?: boolean;
}
