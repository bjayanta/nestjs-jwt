import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private saltOrRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async findAll() {
    const users = await this.usersRepository.find();
    return users;
  }

  async create(createUserDto: CreateUserDto) {
    const password = await bcrypt.hash(
      createUserDto.password,
      this.saltOrRounds,
    );

    const newUser = new User({ ...createUserDto, password });

    await this.entityManager.save(newUser);

    return newUser;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneByOrFail({ id });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.entityManager.update(User, id, updateUserDto);
    const user = await this.findOne(id);

    return user;
  }

  async remove(id: number) {
    return this.usersRepository.delete(id);
  }
}
