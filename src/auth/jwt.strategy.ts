import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: Boolean(process.env.IGNORE_EXPIRATION),
      secretOrKey: String(process.env.JWT_SECRET),
    });
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email };
  }
}
