import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { State } from './state.entity';

@Entity('countries')
export class Country {
  @ApiProperty({
    description: 'The unique identifier of the country',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The name of the country',
    example: 'United States',
  })
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @ApiProperty({
    description: 'The short code of the country (ISO)',
    example: 'USA',
  })
  @Column('varchar', { name: 'shortname', length: 3 })
  shortname!: string;

  @ApiProperty({
    description: 'States/provinces in this country',
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'California' },
      },
    },
  })
  @OneToMany(() => State, states => states.country)
  states!: State[];

  @ApiHideProperty()
  @OneToMany(() => Company, companies => companies.country)
  companies!: Company[];

  @ApiHideProperty()
  @OneToMany(() => User, users => users.country)
  users!: User[];

  @ApiProperty({
    description: 'The date and time the country was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the country was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the country was deleted',
    example: '2023-01-01T00:00:00.000Z',
    nullable: true,
  })
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamptz',
  })
  deletedAt?: Date | null;
}
