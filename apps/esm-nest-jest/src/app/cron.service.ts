import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class CronService {
  @Cron("*/10 * * * * *")
  async testCron1() {
    console.log("debug every 10s");
  }
}
