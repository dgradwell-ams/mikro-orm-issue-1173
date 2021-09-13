import { Config as JestConfig } from "@jest/types";
import NodeEnvironment from "jest-environment-node";
import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoMemoryServerOpts } from "mongodb-memory-server-core/lib/MongoMemoryServer";
import { v4 } from "uuid";

export type MongoDbEnvironmentConfig = JestConfig.ProjectConfig & {
  testEnvironmentOptions?:
    | JestConfig.ProjectConfig["testEnvironmentOptions"]
    | MongoMemoryServerOpts;
};

let mongod: MongoMemoryServer | null = null;

export default class MongoDbEnvironment extends NodeEnvironment {
  private readonly mongod: MongoMemoryServer;

  constructor(config: MongoDbEnvironmentConfig) {
    super(config);

    if (this.runInBand) {
      if (!mongod) {
        mongod = new MongoMemoryServer(config.testEnvironmentOptions);
      }

      this.mongod = mongod;
    } else {
      this.mongod = new MongoMemoryServer(config.testEnvironmentOptions);
    }

    this.global.MONGOD = this.mongod;
  }

  public async setup(): Promise<void> {
    await this.mongod.start();
    this.global.MONGO_URI = this.mongod.getUri();
    this.global.MONGO_DB_NAME = this.mongod.opts.instance?.dbName || v4();

    await super.setup();
  }

  public async teardown(): Promise<void> {
    if (!this.runInBand) {
      await this.mongod.stop();
    }

    await super.teardown();
  }

  private get runInBand(): boolean {
    // '-i' is an alias for '--runInBand'
    // https://jestjs.io/docs/en/cli#runinband
    return process.argv.includes("--runInBand") || process.argv.includes("-i");
  }
}

module.exports = MongoDbEnvironment;
