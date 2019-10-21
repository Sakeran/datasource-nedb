"use strict";

const expect = require("expect.js");

const helpers = require("./_helpers");

describe("fetchAll", () => {
  it("returns an empty array on empty datasets by default", async () => {
    const nDB = helpers.Instance();

    const config = { collection: "players", createMissing: true };
    const entities = await nDB.fetchAll(config);

    expect(entities).to.be.an(Array);
    expect(entities).to.be.empty();
  });

  it("throws if fetchAllObj is set without a set key", async () => {
    const nDB = helpers.Instance();

    const config = {
      collection: "players",
      createMissing: true,
      fetchAllObj: true
    };
    let threw = true;
    try {
      await nDB.fetchAll(config);
      threw = false;
    } catch (e) {}
    expect(threw).to.be(true);
  });

  it("returns an empty object on empty datasets when fetchAllObj is set", async () => {
    const nDB = helpers.Instance();

    const config = {
      collection: "players",
      createMissing: true,
      fetchAllObj: true,
      key: "name"
    };
    const entities = await nDB.fetchAll(config);

    expect(entities).to.be.an("object");
    expect(Object.keys(entities)).to.be.empty();
  });

  it("returns documents as an array by default", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 3, "players");

    const config = { collection: "players" };
    const entities = await nDB.fetchAll(config);

    expect(entities).to.be.an(Array);
    expect(entities).to.have.length(3);
  });

  it("returns documents as an object if fetchAllObj is set with a valid key", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 3, "players");

    const config = {
      collection: "players",
      createMissing: true,
      fetchAllObj: true,
      key: "name"
    };
    const entities = await nDB.fetchAll(config);

    expect(entities).to.be.an("object");
    expect(Object.keys(entities)).to.have.length(3);
    expect(entities).to.have.property("Entity_0");
    expect(entities).to.have.property("Entity_1");
    expect(entities).to.have.property("Entity_2");
  });

  it("stringifies fetchAllObj keys if the value is not a string", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 3, "players");

    const config = {
      collection: "players",
      createMissing: true,
      fetchAllObj: true,
      key: "id"
    };
    const entities = await nDB.fetchAll(config);

    expect(entities).to.be.an("object");
    expect(Object.keys(entities)).to.have.length(3);
    expect(entities).to.have.property("0");
    expect(entities).to.have.property("1");
    expect(entities).to.have.property("2");
  });
});
