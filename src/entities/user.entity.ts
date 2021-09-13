import { Embedded, Entity } from "@mikro-orm/core";
import { BaseEntity } from "./base.entity";
import { Profile } from "./profile.entity";

@Entity()
export class User extends BaseEntity<User> {
  @Embedded({ entity: () => Profile, object: true }) profile!: Profile;
}
