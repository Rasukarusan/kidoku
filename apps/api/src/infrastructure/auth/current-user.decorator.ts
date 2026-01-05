import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) =>
    GqlExecutionContext.create(context).getContext().req.user,
);
