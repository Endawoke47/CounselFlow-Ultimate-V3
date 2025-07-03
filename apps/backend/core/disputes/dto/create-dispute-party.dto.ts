import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DisputePartyRole } from '../entities/dispute-party.entity';

export class CreateDisputePartyDto {
  @ApiProperty({
    description: 'The ID of the company',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({
    description: 'The role of the party in the dispute',
    enum: DisputePartyRole,
    enumName: 'DisputePartyRole',
    example: DisputePartyRole.DEFENDANT,
  })
  @IsEnum(DisputePartyRole)
  @IsNotEmpty()
  role!: DisputePartyRole;
}
