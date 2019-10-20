"use strict";

const expect = require("expect.js");

const helpers = require("./_helpers");

describe("fetch", () => {
  it("throws given a config with missing/invalid key", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true };
    let threw = false;
    try {
      await nDB.fetch(config, "Entity_0");
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be(true);

    config = { collection: "players", createMissing: true, key: false };
    threw = false;
    try {
      await nDB.fetch(config, "Entity_0");
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be(true);
  });

  it("doesn't throw given a config with a valid key", async () => {
    // Note - this behavior assumes the queried data exists.

    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    try {
      await nDB.fetch(config, "Entity_0");
    } catch (e) {
      expect().fail("Fetch with valid key should not have thrown");
    }

    config = { collection: "players", createMissing: true, key: "id" };
    try {
      await nDB.fetch(config, 0);
    } catch (e) {
      expect().fail("Fetch with valid key should not have thrown");
    }
  });

  it("throws when fetching a non-existant document", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    let threw = false;
    try {
      await nDB.fetch(config, "Entity_100");
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be(true);
  });

  it("doesn't throw when fetching existant documents", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    try {
      await nDB.fetch(config, "Entity_0");
    } catch (e) {
      expect().fail("Fetching existant document should not have thrown.");
    }
  });

  it("returns the correct document when fetching existant data", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 2, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    let entity = await nDB.fetch(config, "Entity_0");

    expect(entity).to.be.an("object");
    expect(entity.id).to.be(0);
    expect(entity.name).to.be("Entity_0");
    expect(entity.description).to.be.a("string");
    expect(entity.metadata).to.be.an("object");

    config = { collection: "players", createMissing: true, key: "id" };
    entity = await nDB.fetch(config, 1);

    expect(entity).to.be.an("object");
    expect(entity.id).to.be(1);
    expect(entity.name).to.be("Entity_1");
    expect(entity.description).to.be.a("string");
    expect(entity.metadata).to.be.an("object");
  });
});
