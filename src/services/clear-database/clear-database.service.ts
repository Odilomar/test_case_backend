import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ClearDatabaseService {
  constructor(private dataSource: DataSource) {}

  public async cleanDatabase(): Promise<void> {
    try {
      const entities = this.dataSource.entityMetadatas;
      const tableNames = entities
        .map((entity) => `"${entity.tableName}"`)
        .join(', ');

      await this.dataSource.query(
        `TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`,
      );
      console.log('[TEST DATABASE]: Clean');
    } catch (error) {
      throw new Error(`ERROR: Cleaning test database: ${error}`);
    }
  }
}
