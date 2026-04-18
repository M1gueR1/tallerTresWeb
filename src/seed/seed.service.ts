import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car } from '../cars/entities/car.entity';

const SEED_CARS = [
  { nombre: 'Carro Uno', modelo: 'Ferrari R1',   anio: 2006, frase: 'Siempre voy a ganar' },
  { nombre: 'Carro Dos', modelo: 'Lamborghini uRUS',   anio: 2010, frase: 'El lambo el mejor' },
  { nombre: 'Carro Tres', modelo: 'BMW I3',   anio: 1999, frase: 'Buen Aleman' },
  { nombre: 'Carro Cuatro', modelo: 'Audi GT',   anio: 2012, frase: 'Cuatro anillos del audi' },
  { nombre: 'Carro Cinco', modelo: 'Tesla Model Y',   anio: 2015, frase: 'Moderno y nuevo' },
];

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Car.name) private readonly carModel: Model<Car>,
  ) {}

  async runSeed() {
    await this.carModel.deleteMany({});
    await this.carModel.insertMany(SEED_CARS);

    return { message: 'Seed ejecutado correctamente', inserted: SEED_CARS.length };
  }
}