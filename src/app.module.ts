import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {PrismaModule} from './prisma/prisma.module';
import {AuthModule} from './auth/auth.module';
import {UrlModule} from './url/url.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UrlModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
