import { IsBoolean, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CreatePilotDto {

    @IsString()
    nombre: string;

    @IsString()
    escuderia: string;

    @IsPositive()
    @IsNumber()
    numero: number;

    @IsBoolean()
    activo: boolean;

    @IsPositive()
    campeonatos: number;

}