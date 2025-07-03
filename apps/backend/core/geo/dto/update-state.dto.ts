import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateStateDto } from './create-state.dto';

export class UpdateStateDto extends PartialType(CreateStateDto) {
  @ApiProperty({
    description: 'State ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  id!: number;
}
