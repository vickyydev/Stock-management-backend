import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockDocument = Stock & Document;

@Schema()
export class Stock {
  _id: Types.ObjectId;

  @Prop({ required: true})
  symbol: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  purchasePrice: number;

  @Prop()
  currentPrice: number;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop({ required: true })
  userId: string;
}

export const StockSchema = SchemaFactory.createForClass(Stock);