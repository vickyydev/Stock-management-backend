import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';

export class CreateStockDto {
  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  purchasePrice: number;

  @IsOptional()
  @IsNumber()
  currentPrice?: number;

  @IsOptional()
  @IsDate()
  lastUpdated?: Date;
}

export class UpdateStockDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  currentPrice?: number;

  @IsOptional()
  @IsDate()
  lastUpdated?: Date;
}