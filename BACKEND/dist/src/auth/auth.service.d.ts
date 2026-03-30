import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AuditAccess } from '../audit/entities/audit-access.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly auditAccessRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, auditAccessRepository: Repository<AuditAccess>, jwtService: JwtService);
    validateUser(email: string, password: string, ipAddress: string, userAgent: string): Promise<User>;
    login(user: User): Promise<{
        access_token: string;
        rol_id: number;
    }>;
}
