import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
    select: false, //cuando se haga un find no devolvera la contraseña que no queremos mostrar
  })
  email: string;

  @Column('text', {})
  password: string;

  @Column('text', {})
  fullName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];
}
