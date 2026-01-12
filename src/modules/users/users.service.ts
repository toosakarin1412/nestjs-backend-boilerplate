import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly rbacService: RbacService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const roleName = createUserDto.role;
    const role = await this.rbacService.findRoleByName(roleName);

    // Create payload compatible with User entity
    const userPayload = {
      ...createUserDto,
      role: role
    };

    const user = this.usersRepository.create(userPayload);
    const savedUser = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, salt, ...result } = savedUser;
    return result;
  }

  findAll() {
    return this.usersRepository.find({
      select: ['user_uuid', 'email', 'phone', 'avatar'],
      relations: ['role']
    });
  }

  findOne(id: string) {
    return this.usersRepository.findOne({
      where: { user_uuid: id },
      relations: ['role']
    });
  }

  findOneWithPermissions(id: string) {
    return this.usersRepository.findOne({
      where: { user_uuid: id },
      relations: ['role', 'role.permissions']
    });
  }

  findOneByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { email: username },
      relations: ['role']
    });
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['role']
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updateData: any = { ...updateUserDto };

    if (updateUserDto.role) {
      const role = await this.rbacService.findRoleByName(updateUserDto.role);
      updateData.role = role;
    }

    if (updateUserDto.password) {
      const salt = randomBytes(16);
      const saltHex = salt.toString('hex');
      updateData.password = await argon2.hash(updateUserDto.password, { salt });
      updateData.salt = saltHex;
    }

    // TypeORM update with entity object for relation works, but let's be safe
    // Since update expects DeepPartial<User>, and role is Role, it should be fine.
    // However, if we just pass updateData which has role: Role, it might complain if DTO type inference confuses it.
    // Let's cast it or rely on JS simply passing the object.

    // Note: update method doesn't update relations in some TypeORM versions unless using save.
    // Ideally we should fetch, merge, and save.

    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, updateData);

    return this.usersRepository.save(user);
  }

  async remove(id: string) {
    await this.usersRepository.delete({ user_uuid: id });
    return { deleted: true };
  }

  async updateAvatar(id: string, avatarPath: string) {
    await this.usersRepository.update({ user_uuid: id }, { avatar: avatarPath });
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      user_uuid: user.user_uuid,
      avatar: user.avatar,
    };
  }
}
