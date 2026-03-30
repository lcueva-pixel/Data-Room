import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(): Promise<{
        id: number;
        rolDescripcion: string;
    }[]>;
}
