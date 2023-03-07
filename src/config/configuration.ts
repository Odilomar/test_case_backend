import { config } from 'dotenv';
import { env } from 'process';

/**
 * Configurações e variáveis de ambiente
 */
export default (): Configuration => {
  config();

  return {
    postgres: {
      dev: {
        host: env.DB_HOST,
        port: parseInt(env.DB_PORT),
        user: env.DB_USER,
        pass: env.DB_PASS,
        db: env.DB_NAME,
      },
      test: {
        host: env.TEST_DB_HOST,
        port: parseInt(env.TEST_DB_PORT),
        user: env.TEST_DB_USER,
        pass: env.TEST_DB_PASS,
        db: env.TEST_DB_NAME,
      },
    },
    environment: {
      nodeEnv: env.NODE_ENV,
      port: parseInt(env.PORT),
    },
    typeorm: {
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      logging: process.env.TYPEORM_LOGGING === 'true',
      logger: process.env.TYPEORM_LOGGER,
      entities: process.env.TYPEORM_ENTITIES,
    },
    github: {
      auth: process.env.GITHUB_API_TOKEN,
    },
  };
};

/**
 * Tipos da configuração
 */
type Configuration = {
  postgres: {
    dev: {
      host: string;
      port: number;
      user: string;
      pass: string;
      db: string;
    };
    test: {
      host: string;
      port: number;
      user: string;
      pass: string;
      db: string;
    };
  };
  environment: {
    nodeEnv: string;
    port: number;
  };
  typeorm: {
    synchronize: boolean;
    logging: boolean;
    logger: string;
    entities: string;
  };
  github: {
    auth: string;
  };
};
