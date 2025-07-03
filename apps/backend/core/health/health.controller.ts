import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check system health' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          example: {
            database: { status: 'up' },
            disk: { status: 'up' },
            memory_heap: { status: 'up' },
            memory_rss: { status: 'up' },
          },
        },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'System is unhealthy' })
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database', { connection: this.dataSource }),

      // Disk storage check - verifies that storage usage is below 90%
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),

      // Memory heap check - verifies that heap usage is below 300MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Memory RSS check (Resident Set Size) - verifies that RSS usage is below 300MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }
}
