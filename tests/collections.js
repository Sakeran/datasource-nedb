"use strict";

const expect = require("expect.js");
const path = require("path");
const fs = require("fs");
const Datasource = require("nedb");

const helpers = require("./_helpers");

describe("resolveCollectionPath", () => {
  it("throws given a config with a invalid collection name", () => {
    const nDB = helpers.Instance();

    let config = {};
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();

    config = { collection: "" };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();

    config = { collection: 3 };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();

    config = { collection: null };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();
  });

  it("throws given a collection name that is not pre-sanitized", () => {
    const nDB = helpers.Instance();

    let config = { collection: ".." };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();

    config = { collection: "  " };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();

    config = { collection: "another/directory/data" };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();

    config = { collection: "../data" };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();

    config = { collection: "data/**" };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();
  });

  it("doesn't throw given a valid collection name", () => {
    const nDB = helpers.Instance();

    let config = { collection: "players" };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.not.throwError();

    config = { collection: "_players" };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.not.throwError();

    config = { collection: "players4" };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.not.throwError();
  });

  it("resolves a valid collection name correctly", () => {
    const nDB = helpers.Instance();

    let config = { collection: "players" };
    expect(nDB.resolveCollectionPath(config)).to.be(
      path.resolve(nDB.path, "players.db")
    );

    config = { collection: "players.db" };
    expect(nDB.resolveCollectionPath(config)).to.be(
      path.resolve(nDB.path, "players.db")
    );

    config = { collection: "_tmp_accounts" };
    expect(nDB.resolveCollectionPath(config)).to.be(
      path.resolve(nDB.path, "_tmp_accounts.db")
    );
  });

  it("throws when given a custom bundle path and no data", () => {
    const nDB = helpers.Instance();

    let config = {
      collection: "bundleData",
      bundlePath: "bundles/[BUNDLE]/misc"
    };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();

    config = {
      collection: "npcs",
      area: "test-area",
      bundlePath: "bundles/[BUNDLE]/areas/[AREA]/"
    };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();

    config = {
      collection: "npcs",
      bundlePath: "bundles/[BUNDLE]/areas/[AREA]/"
    };
    expect(nDB.resolveCollectionPath.bind(nDB))
      .withArgs(config)
      .to.throwError();
  });

  it("resolves a custom bundle path with collection name", () => {
    const nDB = helpers.Instance();

    let config = {
      collection: "bundleData",
      bundle: "examples",
      bundlePath: "bundles/[BUNDLE]/misc"
    };
    let collectionPath = nDB.resolveCollectionPath(config);
    expect(collectionPath).to.be(
      path.resolve(nDB.rootPath, "bundles/examples/misc/bundleData.db")
    );

    config = {
      collection: "npcs",
      area: "test-area",
      bundle: "examples",
      bundlePath: "bundles/[BUNDLE]/areas/[AREA]/"
    };
    collectionPath = nDB.resolveCollectionPath(config);
    expect(collectionPath).to.be(
      path.resolve(nDB.rootPath, "bundles/examples/areas/test-area/npcs.db")
    );
  });
});

describe("loadCollection", () => {
  it("generates a datasource key based on loader config", () => {
    const nDB = helpers.Instance();

    let config = { collection: "players" };
    expect(nDB.resolveDatasourceKey(config)).to.be("_:_:players");

    config = { collection: "miscData", bundle: "examples" };
    expect(nDB.resolveDatasourceKey(config)).to.be("examples:_:miscData");

    config = { collection: "miscData", bundle: "examples", area: "test-area" };
    expect(nDB.resolveDatasourceKey(config)).to.be(
      "examples:test-area:miscData"
    );
  });

  it("creates a missing datasource if 'createMissing' is true", async () => {
    const nDB = helpers.Instance();

    let config = { collection: "players", createMissing: true };
    let collectionPath = nDB.resolveCollectionPath(config);
    expect(fs.existsSync(collectionPath)).to.be(false);

    try {
      await nDB.loadCollection(config);
    } catch (e) {
      expect.fail("loadCollection operation failed");
    }

    expect(fs.existsSync(collectionPath)).to.be(true);
  });

  it("throws on a missing datasource if 'createMissing' is false (default)", async () => {
    const nDB = helpers.Instance();

    let config = { collection: "players", createMissing: false };
    let collectionPath = nDB.resolveCollectionPath(config);
    expect(fs.existsSync(collectionPath)).to.be(false);

    try {
      await nDB.loadCollection(config);
      expect.fail("Should have thrown on missing datasource");
    } catch (e) {}

    expect(fs.existsSync(collectionPath)).to.be(false);

    config = { collection: "players" };
    collectionPath = nDB.resolveCollectionPath(config);
    expect(fs.existsSync(collectionPath)).to.be(false);

    try {
      await nDB.loadCollection(config);
      expect.fail("Should have thrown on missing datasource");
    } catch (e) {}

    expect(fs.existsSync(collectionPath)).to.be(false);
  });

  it("returns a reference to a NeDB Datasource", async () => {
    const nDB = helpers.Instance();

    let config = { collection: "players", createMissing: true };
    const datasource = await nDB.loadCollection(config);

    expect(datasource).to.be.a(Datasource);
  });

  it("contains a collection of loaded datasources", async () => {
    const nDB = helpers.Instance();
    expect(nDB.datasources).to.be.a(Map);
    expect(nDB.datasources.size).to.be(0);

    let config = { collection: "players", createMissing: true };
    await nDB.loadCollection(config);

    expect(nDB.datasources.size).to.be(1);

    const key = nDB.resolveDatasourceKey(config);
    expect(nDB.datasources.has(key)).to.be(true);
  });

  it("doesn't load a datasource more than once", async () => {
    const nDB = helpers.Instance();
    expect(nDB.datasources).to.be.a(Map);
    expect(nDB.datasources.size).to.be(0);

    let config = { collection: "players", createMissing: true };

    const ds1 = await nDB.loadCollection(config);
    expect(ds1).to.be.a(Datasource);
    expect(nDB.datasources.size).to.be(1);
    
    
    const ds2 = await nDB.loadCollection(config);
    expect(ds2).to.be.a(Datasource);
    expect(nDB.datasources.size).to.be(1);

    expect(ds1).to.be(ds2);
  });
});
