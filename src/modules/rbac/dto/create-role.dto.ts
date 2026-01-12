
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false, type: [Number] })
    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    permissions?: number[];
}
