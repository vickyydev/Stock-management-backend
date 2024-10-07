import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,  // Token expiration is enforced
      secretOrKey: configService.get<string>('JWT_SECRET'),  // Fetch the JWT secret from env config
    });
  }

  // The payload is the decoded JWT token. It contains information about the user
  async validate(payload: { sub: string; username: string }) {
    if (!payload || !payload.sub || !payload.username) {
      throw new UnauthorizedException('Invalid token');
    }

    // You can return a more detailed object if necessary, e.g., fetching user roles or permissions here
    return { userId: payload.sub, username: payload.username };
  }
}
