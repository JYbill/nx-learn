import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { ScheduleModule } from "@nestjs/schedule";
import { CronService } from "./cron.service.js";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, CronService],
})
export class AppModule {}
