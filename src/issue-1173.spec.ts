import { EntityManager, MikroORM } from "@mikro-orm/core";
import { MongoHighlighter } from "@mikro-orm/mongo-highlighter";
import { v4 } from "uuid";
import { Profile } from "./entities/profile.entity";
import { User } from "./entities/user.entity";

declare global {
  var MONGO_URI: string;
  var MONGO_DB_NAME: string;
}

describe("issue #1173", () => {
  let orm: MikroORM;
  let em: EntityManager;
  let user: User;

  beforeAll(async () => {
    orm = await MikroORM.init({
      type: "mongo",
      clientUrl: global.MONGO_URI,
      dbName: global.MONGO_DB_NAME,
      entities: [User, Profile],
      debug: true,
      highlighter: new MongoHighlighter(),
      driverOptions: { pkFactory: { createPk: v4 } },
    });
    em = orm.em.fork({ clear: true, useContext: false });

    user = em.create(User, {
      profile: { username: "joe", emailAddress: "foo@bar.com" },
    });
    await em.persistAndFlush(user);
  });

  afterAll(async () => {
    await orm.close();
  });

  it("updates only the modified properties of an embedded object", async () => {
    user.profile.username = "john";
    await em.flush();

    /**
     * The logged query looks like this:
     * db.getCollection('user').updateMany(
     *  { id: 'f39c9e44-fc23-4a7e-bf57-14e39245a8f9' },
     *  { '$set': { profile: { username: 'john', emailAddress: 'foo@bar.com' } } },
     *  { session: undefined }
     * );
     *
     * It should be:
     * db.getCollection('user').updateMany(
     *  { id: 'f39c9e44-fc23-4a7e-bf57-14e39245a8f9' },
     *  { '$set': { 'profile.username': 'john' } },
     *  { session: undefined }
     * );
     *
     * Because only the path 'profile.username' changed.
     */

    const result = await em.findOneOrFail(User, { _id: user._id });
    expect(result.profile.username).toEqual("john");
  });
});
