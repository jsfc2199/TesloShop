import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const RawHeaders = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const headers: string[] = req.rawHeaders;
    if (!headers)
      throw new InternalServerErrorException('Raw Headers not found');
    return headers;
  },
);
