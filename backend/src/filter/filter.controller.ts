import { Controller, Get, Query } from '@nestjs/common';
import { FilterService } from './filter.service';
import { FilterDto } from './dto/filter.dto';

@Controller('api/products')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Get('filter')
  getFiltered(@Query() query: FilterDto) {
    return this.filterService.getProducts(query);
  }

  @Get('filter-meta')
  getFilterMeta(@Query() query: FilterDto) {
    return this.filterService.getFilterMeta(query);
  }
}
