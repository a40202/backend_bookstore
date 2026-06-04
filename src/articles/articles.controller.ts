import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { Article } from '../common/types';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('published')
  findPublished() {
    return this.articlesService.findPublished();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('articles')
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('articles')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('articles')
  create(
    @Body()
    data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    return this.articlesService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('admin', 'staff')
  @RequirePermissions('articles')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    return this.articlesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}
