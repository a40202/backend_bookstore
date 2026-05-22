import { ReturnStatus } from '@prisma/client';
import type { PublicUser } from '../common/types';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnsService } from './returns.service';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    create(user: PublicUser, dto: CreateReturnDto): Promise<import("./returns.service").ReturnRequestDetail>;
    findAll(user: PublicUser): Promise<import("./returns.service").ReturnRequestDetail[]>;
    findOne(id: string, user: PublicUser): Promise<import("./returns.service").ReturnRequestDetail>;
    updateStatus(id: string, body: {
        status: ReturnStatus;
        adminNote?: string;
        refundAmount?: number;
    }): Promise<import("./returns.service").ReturnRequestDetail>;
}
