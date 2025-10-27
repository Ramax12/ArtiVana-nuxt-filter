import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FilterService } from './filter.service';
import { FilterController } from './filter.controller';
import { Product } from 'src/modules/product/product.model';
import { Category } from 'src/modules/categories/models/category.model';
import { Brand } from 'src/modules/dictionaries/models/brand.model';
import { CharGeneral } from 'src/modules/dictionaries/models/char-general.model';
import { CharGeneralOption } from 'src/modules/dictionaries/models/char-general-option.model';
import { CharExtra } from 'src/modules/dictionaries/models/char-extra.model';
import { CharExtraOption } from 'src/modules/dictionaries/models/char-extra-option.model';

@Module({
  imports: [SequelizeModule.forFeature([Product, Category, Brand, CharGeneral, CharGeneralOption, CharExtra, CharExtraOption])],
  providers: [FilterService],
  controllers: [FilterController],
})
export class FilterModule {}
