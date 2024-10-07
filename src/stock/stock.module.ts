import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { Stock, StockSchema } from './stock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Stock.name, schema: StockSchema }]),
    ConfigModule,
  ],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}