import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { TenantsModule } from './tenants/tenants.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [DatabaseModule, TenantsModule, MembersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
