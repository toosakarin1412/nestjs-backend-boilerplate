import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe', description: 'User full name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'user@example.com', description: 'User email' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', description: 'User password' })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: 'user', description: 'User role' })
    @IsNumber()
    @IsNotEmpty()
    role: number;

    @ApiProperty({ example: '+1234567890', description: 'User phone number', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: 'path/to/avatar.jpg', description: 'User avatar path', required: false })
    @IsString()
    @IsOptional()
    avatar?: string;
}
