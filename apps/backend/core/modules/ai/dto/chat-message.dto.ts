import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ description: 'The user message' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Additional context for the conversation', required: false })
  @IsOptional()
  @IsObject()
  context?: any;

  @ApiProperty({ description: 'User ID for personalization', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Conversation ID for thread continuity', required: false })
  @IsOptional()
  @IsString()
  conversationId?: string;
}