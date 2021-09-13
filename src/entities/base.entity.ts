import { BaseEntity as MikroBaseEntity, PrimaryKey } from "@mikro-orm/core";
import { IMongoDocument } from "../interfaces/mongo-document.interface";

export abstract class BaseEntity<
  T extends IMongoDocument
> extends MikroBaseEntity<T, "_id"> {
  @PrimaryKey() _id!: string;
}
