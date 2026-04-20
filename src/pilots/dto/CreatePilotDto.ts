import { IsBoolean, IsNumber, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreatePilotDto {

    @IsString()
    @MinLength(2)
    nombre: string;

    @IsString()
    @MinLength(2)
    escuderia: string;

    @IsPositive()
    @IsNumber()
    numero: number;

    @IsBoolean()
    activo: boolean;

    @IsPositive()
    @Min(0)
    campeonatos: number;

}