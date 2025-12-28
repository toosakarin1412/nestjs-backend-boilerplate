import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find({
      select: ['user_uuid', 'email', 'role', 'phone', 'avatar'],
    });
  }

  findOne(id: string) {
    return this.usersRepository.findOneBy({ user_uuid: id });
  }

  findOneByUsername(username: string) {
    return this.usersRepository.findOneBy({ email: username });
  }

  findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const salt = randomBytes(16);
      const saltHex = salt.toString('hex');
      updateUserDto.password = await argon2.hash(updateUserDto.password, { salt });
      (updateUserDto as any).salt = saltHex;
    }
    await this.usersRepository.update({ user_uuid: id }, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.usersRepository.delete({ user_uuid: id });
    return { deleted: true };
  }
}
