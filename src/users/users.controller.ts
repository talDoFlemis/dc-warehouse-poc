import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private userService: UsersService) {}
  @UseGuards(AuthenticatedGuard)
  @Get("profile")
  profile(@Request() req) {
    return req.session.user;
  }

  @Roles(['admin'])
  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @Roles(['admin'])
  @Get(':username')
  getUserByUsername(@Param('username') username: string) {
    return this.userService.findOne(username);
  }
}
