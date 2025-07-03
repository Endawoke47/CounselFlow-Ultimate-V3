import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ClaimStatus } from '../entities/dispute-claim.entity';

export class CreateDisputeClaimDto {
  @ApiProperty({
    description: 'Type or category of the claim',
    example: 'Breach of Contract',
  })
  @IsString()
  @IsNotEmpty()
  claimType!: string;

  @ApiPropertyOptional({
    description: 'Initial status of the claim',
    enum: ClaimStatus,
    example: ClaimStatus.PENDING,
    default: ClaimStatus.PENDING,
  })
  @IsEnum(ClaimStatus)
  @IsOptional()
  status?: ClaimStatus = ClaimStatus.PENDING;
}
