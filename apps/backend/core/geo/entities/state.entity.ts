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
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { City } from './city.entity';
import { Country } from './country.entity';

@Entity('states')
export class State {
  @ApiProperty({
    description: 'The unique identifier of the state/province',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The name of the state/province',
    example: 'California',
  })
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @ApiProperty({
    description: 'The country this state/province belongs to',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'United States' },
      shortname: { type: 'string', example: 'USA' },
    },
  })
  @ManyToOne(() => Country, country => country.states)
  @JoinColumn([{ name: 'country_id', referencedColumnName: 'id' }])
  country!: Country;

  @ApiProperty({
    description: 'Cities in this state/province',
    type: 'array',
    isArray: true,
    items: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Los Angeles' },
      },
    },
  })
  @OneToMany(() => City, city => city.state)
  cities!: City[];

  @ApiHideProperty()
  @OneToMany(() => Company, company => company.state)
  companies!: Company[];

  @ApiHideProperty()
  @OneToMany(() => User, user => user.state)
  users!: User[];

  @ApiProperty({
    description: 'The date and time the state/province was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the state/province was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the state/province was deleted',
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
