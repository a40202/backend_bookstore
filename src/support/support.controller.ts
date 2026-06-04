import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../common/types';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Body() dto: CreateSupportTicketDto, @Req() req: Request) {
    const user = req.user as JwtPayload | null;
    const customerId =
      user?.role === 'customer' ? user.sub : undefined;
    return this.supportService.create(dto, customerId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('support')
  findAll() {
    return this.supportService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('support')
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('support')
  update(@Param('id') id: string, @Body() dto: UpdateSupportTicketDto) {
    return this.supportService.update(id, dto);
  }
}
