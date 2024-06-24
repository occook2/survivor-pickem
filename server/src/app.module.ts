import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    UsersModule, 
    AuthModule, 
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: process.env.NODE_ENV === 'test' ? 'sqlite' : 'mysql',
        database: process.env.NODE_ENV === 'test' ? ':memory:' : 'test',
        host: process.env.NODE_ENV === 'test' ? undefined : 'localhost',
        port: process.env.NODE_ENV === 'test' ? undefined : 3306,
        username: process.env.NODE_ENV === 'test' ? undefined : 'root',
        password: process.env.NODE_ENV === 'test' ? undefined : 'root',
        entities: [User],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
