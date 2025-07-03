import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateCountryDto } from './create-country.dto';

export class UpdateCountryDto extends PartialType(CreateCountryDto) {
  @ApiProperty({
    description: 'Country ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  id!: number;
}
