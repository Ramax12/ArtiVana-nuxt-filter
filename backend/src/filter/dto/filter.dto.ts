import { IsOptional, IsNumber, IsString } from 'class-validator';
import { IsRecordOfNumberArrays } from 'src/common/validators/is-record-of-string-arrays';
import { parseCharacteristics } from 'src/common/validators/parse-characteristics';
import { Type, Transform, TransformFnParams } from 'class-transformer';

export class FilterDto {
  @IsOptional() @Type(() => Number) @IsNumber({}, { each: true }) brands?: number | number[];

  @Type(() => Number) @IsNumber() subcategory!: number;
  @IsOptional() @Type(() => Number) @IsNumber() subsubcategory?: number;

  @IsOptional() @Type(() => Number) @IsNumber({}, { each: true }) subsubcategories?: number | number[];

  @IsOptional() @Type(() => Number) @IsNumber() min_price?: number;
  @IsOptional() @Type(() => Number) @IsNumber() max_price?: number;

  @IsOptional() @Type(() => Number) @IsNumber() rating?: number;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseCharacteristics(value), { toClassOnly: true })
  @IsRecordOfNumberArrays()
  characteristics?: Record<string, number[]>;

  @IsOptional() @IsString() sort?: string;

  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
}
