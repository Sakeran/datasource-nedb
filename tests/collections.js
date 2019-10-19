"use strict";

const NeDBDataSource = require("../src/NeDBDataSource");
const expect = require("expect.js");
const path = require("path");
const fs = require("fs");

const helpers = require("./_helpers");

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

it("creates a datasource file upon")
