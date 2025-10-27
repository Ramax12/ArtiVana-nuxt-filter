import { ApiProperty } from '@nestjs/swagger';

export class FilterDataItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Acrylic' })
  name!: string;

  @ApiProperty({ example: 25 })
  count!: number;
}

export class FilterDataItemCharacteristicsDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Color' })
  name!: string;

  @ApiProperty({ example: 'Red' })
  value!: string;

  @ApiProperty({ type: [FilterDataItemDto] })
  options!: FilterDataItemDto[];
}

export class FilterDataPriceDto {
  @ApiProperty({ example: [0, 500] })
  base_range!: [number, number];

  @ApiProperty({ example: [100, 300] })
  range!: [number, number];
}

export class FilterDataRatingDto {
  @ApiProperty({ example: 4 })
  count!: number;
}

export class FilterDataStandardDto {
  @ApiProperty({ type: [FilterDataItemDto] })
  subsubcategories!: FilterDataItemDto[];

  @ApiProperty({ type: [FilterDataItemDto] })
  brands!: FilterDataItemDto[];

  @ApiProperty({ type: FilterDataPriceDto })
  price!: FilterDataPriceDto;

  @ApiProperty({ type: FilterDataRatingDto })
  rating!: FilterDataRatingDto;
}

export class FilterDataDto {
  @ApiProperty({ type: FilterDataStandardDto })
  standard!: FilterDataStandardDto;

  @ApiProperty({ type: [FilterDataItemCharacteristicsDto] })
  characteristics!: FilterDataItemCharacteristicsDto[];
}

export class FilterMetaDto {
  @ApiProperty({ example: 120 })
  count!: number;

  @ApiProperty({ type: FilterDataDto })
  filters!: FilterDataDto;
}
