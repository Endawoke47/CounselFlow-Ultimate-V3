import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectorDto {
  @ApiProperty({ description: 'The name of the sector', example: 'Technology' })
  @IsString()
  @MinLength(1)
  name!: string;
}
