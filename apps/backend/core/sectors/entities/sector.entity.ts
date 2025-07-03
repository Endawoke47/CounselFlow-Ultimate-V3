import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from 'src/modules/companies/entities/company.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sectors')
export class Sector {
  @ApiProperty({
    description: 'The unique identifier of the sector',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The name of the sector',
    example: 'Technology',
  })
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @ApiProperty({
    description: 'The companies that belong to the sector',
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Acme Corporation' },
      },
    },
  })
  @ManyToMany(() => Company, company => company.sectors)
  companies!: Company[];

  @ApiProperty({
    description: 'The date and time the sector was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the sector was last updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the sector was deleted',
    example: '2021-01-01T00:00:00.000Z',
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt?: Date | null;
}
