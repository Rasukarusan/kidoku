import { Injectable } from '@nestjs/common';
import { Hello } from '../models/hello.model';

@Injectable()
export class HelloService {
  getHello(): Hello {
    const hello = new Hello();
    hello.message = 'Hello World!';
    return hello;
  }
}
