import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { IsRecordOfNumberArrays } from 'src/common/validators/is-record-of-string-arrays';
import { parseCharacteristics } from 'src/common/validators/parse-characteristics';

export class CreateFilterDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Brand IDs, either a single number or an array',
    required: false,
    type: [Number],
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  brands?: number | number[];

  @ApiProperty({ example: 5, description: 'Subcategory ID', required: true })
  @Type(() => Number)
  @IsNumber()
  subcategory!: number;

  @ApiProperty({ example: 12, description: 'Subsubcategory ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subsubcategory?: number;

  @ApiProperty({
    example: [10, 11, 12],
    description: 'Subsubcategory ID, either a single number or an array',
    required: false,
    type: [Number],
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  subsubcategories?: number | number[];

  @ApiProperty({ example: 100, description: 'Minimum price', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_price?: number;

  @ApiProperty({ example: 500, description: 'Maximum price', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_price?: number;

  @ApiProperty({ example: 4, description: 'Rating', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rating?: number;

  @ApiProperty({
    example: { color: [1, 2], size: [3] },
    description: 'Characteristics (key: array of ID values)',
    required: false,
    type: 'object' as any,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseCharacteristics(value), { toClassOnly: true })
  @IsRecordOfNumberArrays()
  characteristics?: Record<string, number[]>;

  @ApiProperty({ example: 'price_asc', description: 'Sort', required: false })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({ example: 1, description: 'Page number', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}
