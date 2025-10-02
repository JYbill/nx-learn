import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { CommonCls } from "@nx-learn/common";
import { validate } from "class-validator";
import { UserValidator } from "../validator/user.validator.js";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Get()
  async getData() {
    console.log(new CommonCls());
    const obj = new UserValidator();
    obj.name = "xqv";
    obj.email = "baidu.com"
    obj.post = {
      title: "xxxxxxxxxxxx",
      content: "123"
    }
    const res = await validate(obj);
    console.log("res", res);
    return this.appService.getData();
  }
}
