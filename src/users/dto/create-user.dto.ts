export class CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  role: 'customer' | 'staff';
}
