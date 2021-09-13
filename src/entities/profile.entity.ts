import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class Profile {
  @Property() username!: string;
  @Property() emailAddress!: string;
}
