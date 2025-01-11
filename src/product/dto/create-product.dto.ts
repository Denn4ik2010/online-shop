import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ToNumber, Trim, ToNumberArray } from '../../decorators';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(100)
  title!: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(500)
  description!: string;

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @Min(0)
  price!: number;

  @IsNotEmpty()
  @IsArray()
  @ToNumberArray()
  categoryIds!: number[];
}
