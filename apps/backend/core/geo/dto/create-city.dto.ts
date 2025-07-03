import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({
    description: 'City name',
    example: 'Los Angeles',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'State ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  stateId!: number;
}
