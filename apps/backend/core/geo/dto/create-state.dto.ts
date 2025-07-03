import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateStateDto {
  @ApiProperty({
    description: 'State name',
    example: 'California',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'State code',
    example: 'CA',
    maxLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  code!: string;

  @ApiProperty({
    description: 'Country ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  countryId!: number;
}
