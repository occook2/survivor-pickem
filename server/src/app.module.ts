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
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [ User ],
      autoLoadEntities: true,
      synchronize: true, // TODO: This should not be set to true, otherwise production data can be lost
    }),
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
