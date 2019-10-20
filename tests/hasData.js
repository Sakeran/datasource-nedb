"use strict";

const expect = require("expect.js");

const helpers = require("./_helpers");

describe("hasData", () => {
  it("doesn't throw given an empty datastore", async () => {
    const nDB = helpers.Instance();
    const config = { collection: "players", createMissing: true };

    try {
      await nDB.hasData(config);
    } catch (e) {
      expect().fail("Threw given an empty datastore.");
    }
  });

  it("doesn't throw given a populated datastore", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    const config = { collection: "players", createMissing: true };

    try {
      await nDB.hasData(config);
    } catch (e) {
      expect().fail("Threw given an empty datastore.");
    }
  });

  it("returns false given an empty Datastore", async () => {
    const nDB = helpers.Instance();

    const config = { collection: "players", createMissing: true };
    const hasData = await nDB.hasData(config);
    expect(hasData).to.be(false);
  });

  it("returns true given a populated Datastore", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 1, "players");

    const config = { collection: "players", createMissing: true };
    const hasData = await nDB.hasData(config);
    expect(hasData).to.be(true);
  });
});
