"use strict";

const expect = require("expect.js");

const helpers = require("./_helpers");

describe("remove", () => {
  it("throws given a config with missing/invalid key", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true };
    let threw = false;
    try {
      await nDB.remove(config, "Entity_0");
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be(true);

    config = { collection: "players", createMissing: true, key: false };
    threw = false;
    try {
      await nDB.remove(config, "Entity_0");
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be(true);
  });

  it("doesn't throw given a config with a valid key", async () => {
    // Note - this behavior assumes the queried data exists.

    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 2, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    try {
      await nDB.remove(config, "Entity_0");
    } catch (e) {
      expect().fail("Remove with valid key should not have thrown");
    }

    config = { collection: "players", createMissing: true, key: "id" };
    try {
      await nDB.remove(config, 1);
    } catch (e) {
      expect().fail("Remove with valid key should not have thrown");
    }
  });

  it("throws when removing a non-existant document", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    let threw = false;
    try {
      await nDB.remove(config, "Entity_100");
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be(true);
  });

  it("doesn't throw when removing existant documents", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    try {
      await nDB.remove(config, "Entity_0");
    } catch (e) {
      expect().fail("Removing existant document should not have thrown.");
    }
  });

  it("removes the correct document when removing existant data", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 2, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    await nDB.remove(config, "Entity_0");

    let found = false;
    try {
      const doc = await nDB.fetch(config, "Entity_0");
      found = !!doc;
    } catch (e) {}

    if (found) expect().fail("Didn't remove entity by name.");

    config = { collection: "players", createMissing: true, key: "id" };
    await nDB.remove(config, 1);

    found = false;
    try {
      const doc = await nDB.fetch(config, 1);
      found = !!doc;
    } catch (e) {}

    if (found) expect().fail("Didn't remove entity by id.");
  });
});
