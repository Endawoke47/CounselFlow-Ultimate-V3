import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({
    description: 'Country name',
    example: 'United States',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Country code (2 characters)',
    example: 'US',
    minLength: 2,
    maxLength: 2,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  code!: string;
}
