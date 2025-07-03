import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'No active risks found in the system',
  })
  message!: string;

  @ApiProperty({
    description: 'Error identifier',
    example: 'risks/not-found',
  })
  error!: string;

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2024-07-14T15:30:45.123Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Request path that triggered the error',
    example: '/dashboard/critical-risk-heatmap', // Updated example path
  })
  path!: string;
}
