import { Injectable } from '@nestjs/common';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@acme.sh',
      password: 'senha',
      role: 'admin',
      createdAt: new Date(),
    },
    {
      id: 2,
      username: 'viewer',
      email: 'viewer@acme.sh',
      password: 'senha',
      role: 'viewer',
      createdAt: new Date(),
    },
    {
      id: 3,
      username: 'writer',
      email: 'writer@acme.sh',
      password: 'senha',
      role: 'writer',
      createdAt: new Date(),
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }
}
