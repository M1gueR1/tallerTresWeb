import { PartialType } from '@nestjs/mapped-types';
import { CreatePilotDto } from './CreatePilotDto';

export class UpdatePilotDto extends PartialType(CreatePilotDto) {}
