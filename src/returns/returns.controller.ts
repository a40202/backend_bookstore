import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReturnStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { PublicUser } from '../common/types';
import { CreateReturnDto } from './dto/create-return.dto';
import { ReturnsService } from './returns.service';

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  create(@CurrentUser() user: PublicUser, @Body() dto: CreateReturnDto) {
    return this.returnsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: PublicUser) {
    return this.returnsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.returnsService.findOne(id, user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: ReturnStatus;
      adminNote?: string;
      refundAmount?: number;
    },
  ) {
    return this.returnsService.updateStatus(
      id,
      body.status,
      body.adminNote,
      body.refundAmount,
    );
  }
}
