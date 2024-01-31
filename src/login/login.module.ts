import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { LoginService } from './login.service';

@Module({
  imports: [ConfigModule],
  providers: [LoginService]
})
export class LoginModule { }
