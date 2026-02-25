import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StandardResponseInterceptor } from './interceptors/standard-response.interceptor';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './config/dbconfig';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }),
  TypeOrmModule.forRoot(dbConfig),
    UsersModule,
    AuthModule,
    RbacModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads','avatar'), // Path to your 'uploads' folder
      serveRoot: '/uploads/avatar', // URL prefix to access the files (e.g., http://localhost:3000/uploads/avatar/imagename.png)
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: StandardResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule { }
