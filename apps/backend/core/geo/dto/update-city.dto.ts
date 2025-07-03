import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateCityDto } from './create-city.dto';

export class UpdateCityDto extends PartialType(CreateCityDto) {
  @ApiProperty({
    description: 'City ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  id!: number;
}
