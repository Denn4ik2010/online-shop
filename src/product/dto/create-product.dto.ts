import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { ToNumber, Trim, ToNumberArray } from '../../decorators';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(100)
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  @MaxLength(500)
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @Min(0)
  readonly price: number;

  @IsNotEmpty()
  @ToNumberArray()
  readonly categoryIds: number[];
}
