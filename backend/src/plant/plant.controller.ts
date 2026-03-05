import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete, 
  Body, 
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Plant } from './entities/plant.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('plants')
@Controller('plants')
@UseGuards(JwtAuthGuard)
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Get()
  @ApiOperation({ summary: 'Get all plants with pagination and filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Plants retrieved successfully' })
  async getAllPlants(@Query() paginationQuery: PaginationQueryDto): Promise<{
    items: Plant[];
    total: number;
  }> {
    return this.plantService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plant by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Plant retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Plant not found' })
  async getPlantById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
  ): Promise<Plant> {
    return this.plantService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new plant' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Plant created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async createPlant(@Body() createPlantDto: CreatePlantDto): Promise<Plant> {
    return this.plantService.create(createPlantDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update existing plant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Plant updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Plant not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async updatePlant(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updatePlantDto: UpdatePlantDto
  ): Promise<Plant> {
    return this.plantService.update(id, updatePlantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete plant' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Plant deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Plant not found' })
  async deletePlant(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
  ): Promise<void> {
    await this.plantService.delete(id);
  }

  @Get('health/:status')
  @ApiOperation({ summary: 'Get plants by health status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Plants retrieved successfully' })
  async getPlantsByHealthStatus(
    @Param('status') healthStatus: string,
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<{
    items: Plant[];
    total: number;
  }> {
    return this.plantService.findByHealthStatus(healthStatus, paginationQuery);
  }
}