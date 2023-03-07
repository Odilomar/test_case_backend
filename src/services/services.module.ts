import { Module } from '@nestjs/common';
import { GithubService } from './github/github.service';
import { ClearDatabaseService } from './clear-database/clear-database.service';

@Module({
  providers: [GithubService, ClearDatabaseService],
  exports: [GithubService],
})
export class ServicesModule {}
