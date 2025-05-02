import { Query, Resolver } from '@nestjs/graphql';
import { HelloResponseDto } from './dto/hello-response.dto';
import { HelloService } from './hello.service';

@Resolver(() => HelloResponseDto)
export class HelloResolver {
  constructor(private readonly helloService: HelloService) {}

  @Query(() => HelloResponseDto)
  hello(): HelloResponseDto {
    return { message: this.helloService.getHello() };
  }
}
