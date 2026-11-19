import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { ArchivosModule } from '../archivos/archivos.module.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ArchivosModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AdminGuard],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
