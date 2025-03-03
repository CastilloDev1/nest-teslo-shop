import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login.user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {

    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);
      delete user.password;

      return user;

    } catch (error) {
      this.handlerDBErrors(error);
    }

  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true }
    });
    
    if( !user ) throw new UnauthorizedException('Credentials are not valid (email)');

    if ( !bcrypt.compareSync(password, user.password) ) throw new UnauthorizedException('Credentials are not valid (password)');

    return user;

    //TODO: Retornar el JWT

  }

  private handlerDBErrors( error ): never {
    if ( error.code === '23505' ) throw new BadRequestException( error.detail );
    throw new InternalServerErrorException('please, check in logs');
  }

}
