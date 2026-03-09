import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EquipmentsModule } from './equipments/equipments.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [AuthModule, UsersModule, EquipmentsModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
