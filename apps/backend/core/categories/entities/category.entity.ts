import { TCategoryItem } from '1pd-types';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
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

@Entity('categories')
export class Category implements TCategoryItem {
  @ApiProperty({
    description: 'The unique identifier of the category',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The name of the category',
    example: 'Technology',
  })
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @ApiHideProperty()
  @ManyToMany(() => Company, company => company.categories)
  companies!: Company[];

  @ApiProperty({
    description: 'The date and time the category was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the category was last updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the category was deleted',
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
