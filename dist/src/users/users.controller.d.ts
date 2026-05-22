import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("../common/types").PublicUser[]>;
    updateActive(id: string, isActive: boolean): Promise<import("../common/types").PublicUser>;
}
