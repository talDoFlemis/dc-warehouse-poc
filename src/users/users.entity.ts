type Role = 'admin' | 'viewer' | 'writer';

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
};
