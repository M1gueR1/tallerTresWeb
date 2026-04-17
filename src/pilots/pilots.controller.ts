import { PilotsService } from './pilots.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { CreatePilotDto } from './dto/CreatePilotDto';
import { UpdatePilotDto } from './dto/UpdatePilotDto';

@Controller('pilots')
export class PilotsController {
  constructor(private readonly pilotsService: PilotsService) {}

    @Get()
    findAll() {
      return this.pilotsService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.pilotsService.findOne(id);
    }
  
    @Post()
    create(@Body() createCarDto: CreatePilotDto) {
      return this.pilotsService.create(createCarDto);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePilotDto: UpdatePilotDto) {
      return this.pilotsService.update(id, updatePilotDto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseMongoIdPipe) id: string) {
      return this.pilotsService.remove(id);
    }
}
