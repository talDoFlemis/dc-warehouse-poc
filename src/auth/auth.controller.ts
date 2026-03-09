import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { type User } from 'src/users/users.entity';
import { AuthenticatedGuard } from './authenticated.guard';
import { LogoutDto } from './dtos/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  signIn(@Request() req): User {
    req.session.user = req.user;
    return req.user;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  logout(@Request() req) {
    req.session.destroy();

    let dto = new LogoutDto();
    dto.message = 'User logged out';
    return dto;
  }
}
