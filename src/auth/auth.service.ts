import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcryptjs from "bcryptjs";
import { CreateUserDto, RegisterDto, LoginDto, UpdateUserDto} from './dto/index';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      //* 1. Encriptar la contraseña
      const { password, ...userData} = createUserDto;
      const newUser = new this.userModel({
        ...userData,
        password: await bcryptjs.hash(password, 10),
      });

      //* 2. Guardar el nuevo usuario
      await newUser.save();

      //* 2.1 Eliminar la contraseña del objeto de respuesta (opcional)
      const { password: _, ...userJson } = newUser.toJSON();
      
      //* 3. Generar un token de autenticación
      

      return userJson;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`Email ${createUserDto.email} already exists`);
      }
      throw new InternalServerErrorException('Something terrible happened!!!');
    }
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.create(registerDto);

    return {
      user: user,
      token: this.getJwtToken({ id: user._id }),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials - email');
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials - password');
    }

    const { password: _, ...userJson } = user.toJSON();

    return {
      user: userJson,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    const { password: _, ...userJson } = user.toJSON();
    return userJson;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
