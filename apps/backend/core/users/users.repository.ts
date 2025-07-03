import { EntityManager, Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { User } from './entities/user.entity';

export interface UserRepository extends Repository<User> {
  createUser(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'uuid'>,
    company: Company,
    manager?: EntityManager,
  ): Promise<User>;
  getUsersByEmailAndCompany(
    email: string,
    company: Company,
  ): Promise<User | null>;
  getUsersById(userId: number): Promise<User | null>;
}

export const customUserRepositoryMethods = {
  async createUser(
    this: Repository<User>,
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'uuid'>,
    company: Company,
    manager?: EntityManager,
  ): Promise<User> {
    const user = new User();
    user.email = data.email;
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.title = data.title;
    user.company = company;
    user.department = data.department;
    user.phone = data.phone;
    user.middleName = data.middleName;
    user.notes = data.notes;
    user.phone = data.phone;
    user.bestWayToContact = data.bestWayToContact;
    user.city = data.city;
    user.state = data.state;
    user.country = data.country;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return manager ? manager.save(user) : this.save(user);
  },

  async getUsersByEmailAndCompany(
    this: Repository<User>,
    email: string,
    company: Company,
  ): Promise<User | null> {
    return this.findOne({ where: { email, company } });
  },

  async getUsersById(
    this: Repository<User>,
    userId: number,
  ): Promise<User | null> {
    return this.findOne({ where: { id: userId }, relations: ['company'] });
  },
};
