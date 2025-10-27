import { Controller, Get, Query } from '@nestjs/common';
import { FilterService } from './filter.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductResponseDto } from 'src/modules/product/dto/product-response.dto';
import { FilterMetaDto } from './dto/filter-meta.dto';

@ApiTags('Filter')
@Controller('api/products')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @ApiOperation({ summary: 'Get products' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  @Get('filter')
  getFiltered(@Query() query: CreateFilterDto) {
    return this.filterService.getProducts(query);
  }

  @ApiOperation({ summary: 'Get filters and total products' })
  @ApiResponse({ status: 200, type: FilterMetaDto })
  @Get('filter-meta')
  getFilterMeta(@Query() query: CreateFilterDto) {
    return this.filterService.getFilterMeta(query);
  }
}
