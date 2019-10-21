"use strict";

const expect = require("expect.js");

const helpers = require("./_helpers");

const replacements = helpers.Entities(
  {
    id: 10,
    name: "New_Entity_10",
    description: "A Replaced Entity",
    metadata: {}
  },
  {
    id: 11,
    name: "New_Entity_11",
    description: "A Replaced Entity",
    metadata: {}
  },
  {
    id: 12,
    name: "New_Entity_12",
    description: "A Replaced Entity",
    metadata: {}
  }
);

// Note - We assume 'name' is the keyed value for this set,
// but the 'replace' method doesn't actually care what the
// key is. We do use it to fetch the data in some tests, however.
const replacementsObj = replacements.reduce((acc, el) => {
  acc[el.name] = el;
  return acc;
}, {});

describe("replace", () => {
  it("throws if the given dataset is not an array (default)", async () => {
    const nDB = helpers.Instance();

    let config = { collection: "players", createMissing: true };
    let threw = true;
    try {
      await nDB.replace(config, {});
      threw = false;
    } catch (e) {}
    expect(threw).to.be(true);
  });

  it("throws if fetchAllObj is set and the given dataset is not an object", async () => {
    const nDB = helpers.Instance();

    let config = {
      collection: "players",
      createMissing: true,
      fetchAllObj: true
    };
    let threw = true;
    try {
      await nDB.replace(config, replacements);
      threw = false;
    } catch (e) {}
    expect(threw).to.be(true);
  });

  it("doesn't throw if the dataset is an array", async () => {
    const nDB = helpers.Instance();

    let config = { collection: "players", createMissing: true };
    let threw = true;
    try {
      await nDB.replace(config, replacements);
      threw = false;
    } catch (e) {}
    expect(threw).to.be(false);
  });

  it("doesn't throw if fetchAllObj is set and the given dataset is an object", async () => {
    const nDB = helpers.Instance();

    let config = {
      collection: "players",
      createMissing: true,
      fetchAllObj: true
    };
    let threw = true;
    try {
      await nDB.replace(config, replacementsObj);
      threw = false;
    } catch (e) {}
    expect(threw).to.be(false);
  });

  it("replaces the entire dataset (default)", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 2, "players");

    const config = { collection: "players", createMissing: true };
    const initialFetch = await nDB.fetchAll(config);

    expect(initialFetch).to.have.length(2);
    const initialNames = initialFetch.map(e => e.name);
    expect(initialNames).to.contain("Entity_0");
    expect(initialNames).to.contain("Entity_1");

    await nDB.replace(config, replacements);
    const replacementFetch = await nDB.fetchAll(config);

    expect(replacementFetch).to.have.length(3);
    const replacementNames = replacementFetch.map(e => e.name);
    expect(replacementNames).to.contain("New_Entity_10");
    expect(replacementNames).to.contain("New_Entity_11");
    expect(replacementNames).to.contain("New_Entity_12");
  });

  it("replaces the entire dataset (fetchAllObj)", async () => {
    const nDB = helpers.Instance();
    await helpers.Populate(nDB, 2, "players");

    const config = {
      collection: "players",
      createMissing: true,
      fetchAllObj: true,
      key: "name"
    };
    const initialFetch = await nDB.fetchAll(config);

    expect(Object.keys(initialFetch)).to.have.length(2);
    const initialNames = Object.values(initialFetch).map(e => e.name);
    expect(initialNames).to.contain("Entity_0");
    expect(initialNames).to.contain("Entity_1");

    await nDB.replace(config, replacementsObj);
    const replacementFetch = await nDB.fetchAll(config);

    expect(Object.keys(replacementFetch)).to.have.length(3);
    const replacementNames = Object.values(replacementFetch).map(e => e.name);
    expect(replacementNames).to.contain("New_Entity_10");
    expect(replacementNames).to.contain("New_Entity_11");
    expect(replacementNames).to.contain("New_Entity_12");
  });
});
