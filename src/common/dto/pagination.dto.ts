import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'how many rows do you need',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) //es lo mismo que el enable implicit conversions pero directo en el dto
  limit?: number;

  @ApiProperty({
    default: 2,
    description: 'how many rows do you want to skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
