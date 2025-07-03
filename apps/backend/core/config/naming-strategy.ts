import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

export class CustomNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  /**
   * Override the junction table naming strategy to use the pattern: entityA_entityB
   */
  joinTableName(firstTableName: string, secondTableName: string): string {
    // Convert table names to snake_case if they aren't already
    const first = snakeCase(firstTableName);
    const second = snakeCase(secondTableName);

    // Create the junction table name in the format: first_second
    return `${first}_${second}`;
  }
}
