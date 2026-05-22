import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { PublicUser } from '../common/types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<import("../common/types").AuthResponse>;
    register(dto: RegisterDto): Promise<import("../common/types").AuthResponse>;
    me(user: PublicUser): PublicUser;
    updateProfile(user: PublicUser, dto: UpdateProfileDto): Promise<PublicUser>;
}
