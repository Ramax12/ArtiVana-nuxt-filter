# ArtiVana · Filter Snippet

Модуль фильтрации и отображения каталога товаров, реализованный на **NestJS** (backend) и **Nuxt 4** + **Pinia** (frontend). Проект демонстрирует продуманную архитектуру фильтров, работу с данными из базы через **Sequelize** и чистую модульную организацию кода с тестовым покрытием.

## 🎯 Цель

Создать гибкий и переиспользуемый модуль фильтрации для e-commerce приложений, который:
- эффективно обрабатывает фильтры по категориям, брендам, характеристикам, цене и рейтингу;
- формирует метаданные фильтров для фронтенда;
- обеспечивает отзывчивый и интерактивный интерфейс с плавной анимацией и удобной пагинацией;
- демонстрирует навыки проектирования клиент-серверного взаимодействия и типизации данных.

## ⚙️ Технические особенности

- **Backend**: NestJS + Sequelize, строгая типизация DTO, раздельная логика контроллера/сервиса, нормализация данных.
- **Frontend**: Nuxt 4 (Composition API), Pinia store, модульные компоненты и тесты для каждой ключевой части интерфейса.
- **Testing**: Unit-тесты для логики фильтров, компонентов и утилит.
- **Utility Layer**: Мапперы, нормализаторы и вспомогательные функции для чистой структуры данных, а также документация API через Swagger, которая автоматически отражает все DTO, их типы, nullable-поля и примеры значений.

---

> Код выложен исключительно в ознакомительных целях.


## 📁 Структура репозитория

### 🧩 Frontend

| Файл | Описание |
|------|----------|
| `components/card/BaseInput.vue` | Инпут для карточки товара: ввод/вывод количества и добавление в корзину |
| `components/card/BaseInput.test.ts` | Тесты логики BaseInput.vue |
| `components/card/CardVertical.vue` | Карточка товара в вертикальном виде |
| `components/card/CardVertical.test.ts` | Тесты логики CardVertical.vue |
| `components/card/ImagesSlider.vue` | Слайдер изображений товара для карточке |
| `components/card/Tooltip.vue` | Копирование артикула товара с подсказкой |
| `components/common/AnimateNumber.vue` | Анимация числовых значений (например, цен) |
| `components/common/AnimateNumber.test.ts` | Тесты логики AnimateNumber.vue |
| `components/common/BaseInput.vue` | Универсальный кастомный input |
| `components/common/BaseInput.test.ts` | Тесты логики BaseInput.vue |
| `components/common/OptionSelector.vue` | Кастомный checkbox/radio-компонент |
| `components/common/RangeSlider.vue` | Кастомный range-слайдер для выбора диапазона |
| `components/common/RangeSlider.test.ts` | Тесты логики RangeSlider.vue |
| `components/filter/Filters.vue` | Основной компонент фильтров товаров |
| `components/filter/Filters.test.ts` | Тесты логики Filters.vue |
| `components/filter/Filtration.vue` | Обёртка фильтров для десктопной версии |
| `components/filter/Heading.vue` | Верхний контейнер фильтра |
| `components/filter/Heading.test.ts` | Тесты логики Heading.vue |
| `components/filter/List.vue` | Список карточек товаров |
| `components/filter/Main.vue` | Главная обёртка модуля фильтрации |
| `components/filter/Pagination.vue` | Компонент пагинации для фильтрации |
| `components/filter/RangeInput.vue` | Двойной input для ручного ввода ценового диапазона |
| `components/filter/RangeInput.test.ts` | Тесты логики RangeInput.vue |
| `components/filter/SelectedFilters.vue` | Отображение активных (выбранных) фильтров |
| `components/filter/SelectedFilters.test.ts` | Тесты логики SelectedFilters.vue |
| `pages/catalog/[subcategory]/index.vue` | Страница фильтрации товаров по подкатегории |
| `pages/catalog/[subcategory]/[subsubcategory]/index.vue` | Страница фильтрации товаров по подподкатегории |
| `stores/filter.ts` | Хранилище Pinia для управления состоянием фильтра |
| `stores/filter.test.ts` | Тесты логики filter.ts |
| `typescript/interfaces.ts` | Интерфейсы для моделей данных фильтра, товаров и компонентов |
| `typescript/types.ts` | Типы TypeScript для проекта |
| `utils/price-format.ts` | Утилита форматирования цен с разделением пробелами |
| `utils/price-format.test.ts` | Тесты логики price-format.ts |
| `utils/word-ending.ts` | Утилита для склонения окончаний слов |

---

### 🧱 Backend

| Файл | Описание |
|------|----------|
| `src/modules/filter/dto/create-filter.dto.ts` | DTO-класс для валидации и типизации входящих параметров фильтра (категории, диапазон цен, сортировка и т.д.) |
| `src/modules/filter/dto/filter-meta.dto.ts` | DTO-классы для типизации метаданных фильтров каталога (стандартные фильтры, характеристики, количество товаров) |
| `src/modules/filter/filter.controller.ts` | Контроллер, обрабатывающий HTTP-запросы для фильтрации товаров. Делегирует бизнес-логику сервису |
| `src/modules/filter/filter.module.ts` | NestJS-модуль, объединяющий контроллер, сервис и DTO для фильтрации данных |
| `src/modules/filter/filter.service.ts` | Сервис, реализующий всю бизнес-логику фильтрации товаров. Загружает данные с базы (товары, категории, характеристики, бренды), нормализует их и формирует результаты фильтрации по заданным параметрам FilterDto. Поддерживает фильтры по категориям, брендам, подкатегориям, характеристикам, ценовому диапазону и рейтингу. Также вычисляет статистику (количество товаров, диапазон цен, рейтинг) и подготавливает метаданные фильтров для фронтенда. |
| `src/mappers/category.mapper.ts` | Маппер для преобразования данных категорий из базы в формат, удобный для фронтенда. |
| `src/mappers/product.mapper.ts` | Маппер для нормализации и подготовки данных товаров (атрибуты, цены, изображения и т.д.). |
| `src/typescript/interfaces.ts` | Интерфейсы для моделей данных, используемых в фильтрах, товарах |
| `src/typescript/types.ts` | Типы TypeScript для проекта |
| `src/utils/normalize-product.ts` | Утилита для приведения данных товара из базы к интерфейсу IProduct: нормализует поля, фильтрует массивы и приводит типы к ожидаемому формату. |

Визуал: https://artivana-nuxt.vercel.app/catalog/studio-equipment/lighting
