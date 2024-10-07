import { Controller, Post, Request, UseGuards, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { successResponse, errorResponse } from 'src/utils/response.util';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }, @Res() res: Response) {
    try {
      await this.authService.register(body.username, body.password);
      return res.status(HttpStatus.CREATED).json(successResponse('Registration successful'));
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse('Registration failed', error.message));
    }
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Res() res: Response) {
    try {
      const token = await this.authService.login(req.user);
      res.setHeader('Authorization', `Bearer ${token.access_token}`);
      return res.status(HttpStatus.OK).json(successResponse('Login successful', { token }));
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(errorResponse('Login failed', error.message));
    }
  }
}
