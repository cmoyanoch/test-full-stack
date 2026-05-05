import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFavoriteDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pokemonId!: number;

  @IsString()
  @MaxLength(100)
  pokemonName!: string;

  @IsString()
  @MaxLength(2048)
  imageUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateFavoriteNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string | null;
}
