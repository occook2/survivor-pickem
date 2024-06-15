import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret, // TODO: Update secrets implementation. Look at PEM-encoded public key for production
    });
  }

  async validate(payload: any) {
    /*
        This function automatically assumes that if a validated JWT is present, then the user can use an API.
        Further business logic can be added to check if this userId has had access revoked, etc. to further 
        security within the production website
    */
    return { userId: payload.sub, username: payload.username };
  }
}