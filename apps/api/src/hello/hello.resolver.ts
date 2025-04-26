import { Resolver, Query } from '@nestjs/graphql';
import { HelloService } from './hello.service';
import { Hello } from '../models/hello.model';

@Resolver(() => Hello)
export class HelloResolver {
  constructor(private readonly helloService: HelloService) {}

  @Query(() => Hello)
  getHello(): Hello {
    return this.helloService.getHello();
  }
}
