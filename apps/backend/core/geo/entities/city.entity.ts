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
import { State } from './state.entity';

@Entity('cities')
export class City {
  @ApiProperty({
    description: 'The unique identifier of the city',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'The name of the city',
    example: 'Los Angeles',
  })
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @ApiProperty({
    description: 'The state/province this city belongs to',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'California' },
    },
  })
  @ManyToOne(() => State, state => state.cities)
  @JoinColumn([{ name: 'state_id', referencedColumnName: 'id' }])
  state!: State;

  @ApiHideProperty()
  @OneToMany(() => Company, company => company.city)
  companies!: Company[];

  @ApiHideProperty()
  @OneToMany(() => User, (user: User) => user.city)
  users!: User[];

  @ApiProperty({
    description: 'The date and time the city was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the city was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the city was deleted',
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
