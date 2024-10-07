import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Res, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StockService } from './stock.service';
import { CreateStockDto, UpdateStockDto } from '../stock/dto/create-stock.dto';
import { successResponse, errorResponse } from 'src/utils/response.util';
import { Response } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
  };
}

@Controller('stocks')
@UseGuards(AuthGuard('jwt'))
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  async create(@Request() req: RequestWithUser, @Body() createStockDto: CreateStockDto, @Res() res: Response) {
    try {
      const stock = await this.stockService.create(createStockDto, req.user.userId);
      return res.status(HttpStatus.CREATED).json(successResponse('Stock created successfully', stock));
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse('Failed to create stock', error.message));
    }
  }

  @Get()
  async findAll(@Request() req: RequestWithUser, @Res() res: Response) {
    try {
      const stocks = await this.stockService.findAll(req.user.userId);
      return res.status(HttpStatus.OK).json(successResponse('Stocks fetched successfully', stocks));
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse('Failed to fetch stocks', error.message));
    }
  }

  @Get(':id')
  async findOne(@Request() req: RequestWithUser, @Param('id') id: string, @Res() res: Response) {
    try {
      const stock = await this.stockService.findOne(id, req.user.userId);
      return res.status(HttpStatus.OK).json(successResponse('Stock fetched successfully', stock));
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json(errorResponse(`Stock with ID ${id} not found`, error.message));
    }
  }

  @Put(':id')
  async update(@Request() req: RequestWithUser, @Param('id') id: string, @Body() updateStockDto: UpdateStockDto, @Res() res: Response) {
    try {
      const updatedStock = await this.stockService.update(id, updateStockDto, req.user.userId);
      return res.status(HttpStatus.OK).json(successResponse('Stock updated successfully', updatedStock));
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse(`Failed to update stock with ID ${id}`, error.message));
    }
  }

  @Delete(':id')
  async remove(@Request() req: RequestWithUser, @Param('id') id: string, @Res() res: Response) {
    try {
      const deletedStock = await this.stockService.remove(id, req.user.userId);
      return res.status(HttpStatus.OK).json(successResponse('Stock deleted successfully', deletedStock));
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json(errorResponse(`Failed to delete stock with ID ${id}`, error.message));
    }
  }

  @Get('quote/:symbol')
  async getStockQuote(@Param('symbol') symbol: string, @Res() res: Response) {
    try {
      const quote = await this.stockService.getStockQuote(symbol);
      return res.status(HttpStatus.OK).json(successResponse('Stock quote fetched successfully', quote));
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json(errorResponse(`Failed to fetch quote for symbol ${symbol}`, error.message));
    }
  }

  @Post('update-prices')
  async updateStockPrices(@Request() req: RequestWithUser, @Res() res: Response) {
    try {
      await this.stockService.updateStockPrices(req.user.userId);
      return res.status(HttpStatus.OK).json(successResponse('Stock prices updated successfully'));
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse('Failed to update stock prices', error.message));
    }
  }
}
