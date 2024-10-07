import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock, StockDocument } from '../stock/stock.schema';
import { CreateStockDto, UpdateStockDto } from '../stock/dto/create-stock.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @InjectModel(Stock.name) private stockModel: Model<StockDocument>,
    private configService: ConfigService
  ) {}

  async create(createStockDto: CreateStockDto, userId: string): Promise<Stock> {
    try {
  
      const quote = await this.getStockQuote(createStockDto.symbol);
      const currentPrice = parseFloat(quote['05. price']);

      const newStock = new this.stockModel({
        ...createStockDto,
        userId,
        currentPrice,
        lastUpdated: new Date(), 
      });

      return newStock.save();
    } catch (error) {
      this.logger.error(`Failed to create stock: ${error.message}`);
      throw new Error('Failed to fetch initial stock price');
    }
  }

  async findAll(userId: string): Promise<Stock[]> {
    return this.stockModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<Stock> {
    const stock = await this.stockModel.findOne({ _id: id, userId }).exec();
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto, userId: string): Promise<Stock> {
    const updatedStock = await this.stockModel.findOneAndUpdate(
      { _id: id, userId },
      updateStockDto,
      { new: true }
    ).exec();

    if (!updatedStock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return updatedStock;
  }

  async remove(id: string, userId: string): Promise<Stock> {
    const deletedStock = await this.stockModel.findOneAndDelete({ _id: id, userId }).exec();
    if (!deletedStock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return deletedStock;
  }

  async getStockQuote(symbol: string): Promise<any> {
    const apiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      throw new Error('Alpha Vantage API key is not configured');
    }

    try {
      const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
      const quote = response.data['Global Quote'];
      if (!quote) {
        throw new NotFoundException(`Quote for symbol ${symbol} not found`);
      }
      return quote;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException(`Quote for symbol ${symbol} not found`);
      }
      this.logger.error(`Failed to fetch stock quote for ${symbol}: ${error.message}`);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) 
  async handleCron() {
    this.logger.debug('Running cron job to update stock prices...');

    const stocks = await this.stockModel.find().exec();

    for (const stock of stocks) {
      try {
        const quote = await this.getStockQuote(stock.symbol);
        const currentPrice = parseFloat(quote['05. price']);

        await this.stockModel.findByIdAndUpdate(stock._id, {
          currentPrice,
          lastUpdated: new Date(),
        });

        this.logger.debug(`Updated ${stock.symbol} price to ${currentPrice}`);
      } catch (error) {
        this.logger.error(`Failed to update price for ${stock.symbol}: ${error.message}`);
      }
    }
  }

  async updateStockPrices(userId: string): Promise<void> {
    const stocks = await this.findAll(userId);
    for (const stock of stocks) {
      try {
        const quote = await this.getStockQuote(stock.symbol);
        const updatedStock: UpdateStockDto = {
          currentPrice: parseFloat(quote['05. price']),
          lastUpdated: new Date(),
        };
        await this.update(stock._id.toString(), updatedStock, userId);
      } catch (error) {
        this.logger.error(`Failed to update stock ${stock.symbol}: ${error.message}`);
      }
    }
  }
}
