"use strict";

const expect = require("expect.js");

const helpers = require("./_helpers");

describe("update", () => {
  it("throws given a config with missing/invalid key", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true };
    let update = {
      id: 0,
      name: "Entity_0",
      description: "An Updated Entity",
      metadata: {}
    };

    let threw = false;
    try {
      await nDB.update(config, "Entity_0", update);
    } catch (e) {
      threw = true;
    }
    expect(threw).to.be(true);

    config = { collection: "players", createMissing: true, key: false };
    threw = false;
    try {
      await nDB.update(config, "Entity_0", update);
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
    let update = {
      id: 0,
      name: "Entity_0",
      description: "An Updated Entity",
      metadata: {}
    };
    try {
      await nDB.update(config, "Entity_0", update);
    } catch (e) {
      expect().fail("Fetch with valid key should not have thrown");
    }

    config = { collection: "players", createMissing: true, key: "id" };
    update = {
      id: 0,
      name: "Entity_0",
      description: "An Re-Updated Entity",
      metadata: {}
    };
    try {
      await nDB.update(config, 0, update);
    } catch (e) {
      expect().fail("Fetch with valid key should not have thrown");
    }
  });

  it("upserts when updating non-existant documents", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    let update = {
      id: 99,
      name: "UpsertMe",
      description: "An Upserted Enity",
      metadata: {}
    };

    await nDB.update(config, "UpsertMe", update);

    const entity = await nDB.fetch(config, "UpsertMe");
    expect(entity).to.be.an("object");
    expect(entity.id).to.be(99);
    expect(entity.name).to.be("UpsertMe");
  });

  it("updates existing data", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    let config = { collection: "players", createMissing: true, key: "name" };
    let update = {
      id: 0,
      name: "Entity_0",
      description: "An Updated Enity",
      metadata: {updated: true}
    };

    await nDB.update(config, "Entity_0", update);

    const entity = await nDB.fetch(config, "Entity_0");
    expect(entity).to.be.an("object");
    expect(entity.id).to.be(0);
    expect(entity.name).to.be("Entity_0");
    expect(entity.metadata).to.be.an('object');
    expect(entity.metadata.updated).to.be(true);
  })
});
