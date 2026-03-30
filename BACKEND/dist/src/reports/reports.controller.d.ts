import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
export declare class ReportsController {
    private readonly reportRepository;
    constructor(reportRepository: Repository<Report>);
    findAll(req: any): Promise<Report[]>;
}
