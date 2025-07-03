import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from 'src/modules/companies/entities/company.entity';
import { City } from 'src/modules/geo/entities/city.entity';
import { Country } from 'src/modules/geo/entities/country.entity';
import { State } from 'src/modules/geo/entities/state.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Unique('UQ_users_email_company', ['email', 'company'])
export class User {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id!: number;

  @ApiProperty({
    description: 'UUID for the user - used for external identification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ default: () => 'gen_random_uuid()' })
  uuid!: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @Column('varchar', { name: 'email', length: 320 })
  email!: string;

  @ApiProperty({
    description: 'The company this user belongs to',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Acme Corporation' },
    },
  })
  @ManyToOne(() => Company, company => company.users)
  @JoinColumn([{ name: 'company_id', referencedColumnName: 'id' }])
  company!: Company;

  @ApiProperty({
    description: 'Job title of the user',
    example: 'Senior Legal Counsel',
  })
  @Column('varchar', { name: 'title', length: 255 })
  title!: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @Column('varchar', { name: 'first_name', length: 255 })
  firstName!: string;

  @ApiProperty({
    description: 'Middle name of the user',
    example: 'Robert',
    nullable: true,
  })
  @Column('varchar', {
    name: 'middle_name',
    nullable: true,
    length: 255,
  })
  middleName!: string | null;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @Column('varchar', { name: 'last_name', length: 255 })
  lastName!: string;

  @ApiProperty({
    description: 'Department the user works in',
    example: 'Legal',
  })
  @Column('varchar', { name: 'department', length: 255 })
  department!: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+1 (555) 123-4567',
    nullable: true,
  })
  @Column('varchar', { name: 'phone', length: 255, nullable: true })
  phone!: string;

  @ApiProperty({
    description: 'Preferred contact method',
    example: 'Email preferred, available on phone after 2pm',
    nullable: true,
  })
  @Column('varchar', {
    name: 'best_way_to_contact',
    nullable: true,
    length: 255,
  })
  bestWayToContact!: string | null;

  @ApiPropertyOptional({
    description: 'Additional notes about the user',
    example: 'Key contact for IP matters',
    nullable: true,
  })
  @Column('text', { name: 'notes', nullable: true })
  notes?: string | null;

  @ApiPropertyOptional({
    description: 'The city where the user is located',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Los Angeles' },
    },
  })
  @ManyToOne(() => City, city => city.users)
  @JoinColumn([{ name: 'city_id', referencedColumnName: 'id' }])
  city?: City;

  @ApiProperty({
    description: 'The country where the user is located',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'United States' },
      shortname: { type: 'string', example: 'USA' },
    },
  })
  @ManyToOne(() => Country, country => country.users)
  @JoinColumn([{ name: 'country_id', referencedColumnName: 'id' }])
  country!: Country;

  @ApiProperty({
    description: 'The state/province where the user is located',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'California' },
    },
  })
  @ManyToOne(() => State, state => state.users)
  @JoinColumn([{ name: 'state_id', referencedColumnName: 'id' }])
  state!: State;

  @ApiPropertyOptional({
    description: 'The user who created this user',
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'number', example: 1 },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
    },
  })
  @ManyToOne('User', { nullable: true })
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'id' }])
  createdBy?: User;

  @ApiProperty({
    description: 'The date and time the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'The date and time the user was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'The date and time the user was deleted',
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
