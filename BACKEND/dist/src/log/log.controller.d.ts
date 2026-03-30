import { Repository } from 'typeorm';
import { LogActivity } from './entities/log-activity.entity';
export declare class LogController {
    private readonly logRepository;
    constructor(logRepository: Repository<LogActivity>);
    findAll(): Promise<LogActivity[]>;
}
