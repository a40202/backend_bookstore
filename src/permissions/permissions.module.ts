import { Global, Module } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Global()
@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsGuard],
  exports: [PermissionsService, PermissionsGuard],
})
export class PermissionsModule {}
