"use strict";

const NeDBDataSource = require("../src/NeDBDataSource");
const expect = require("expect.js");
const path = require("path");

const helpers = require("./_helpers");

describe("NeDBDataSource creation", () => {
  it("throws when not given a rootPath", () => {
    expect(() => new NeDBDataSource()).to.throwError();
  });

  it("throws when given an invalid path config", () => {
    const root = helpers.DSDir();
    expect(() => new NeDBDataSource({ path: true }, root)).to.throwError();
    expect(
      () => new NeDBDataSource({ path: { no: "objects" } }, root)
    ).to.throwError();
    expect(
      () => new NeDBDataSource({ path: ["no/arrays"] }, root)
    ).to.throwError();
  });

  it("doesn't throw when given a valid path config", () => {
    const root = helpers.DSDir();
    expect(
      () => new NeDBDataSource({ path: "data/db" }, root)
    ).to.not.throwError();
    expect(
      () => new NeDBDataSource({ path: "data/db" }, root)
    ).to.not.throwError();
  });

  it("uses the rootPath by itself with no path config", () => {
    const root = helpers.DSDir();
    const nDS = new NeDBDataSource({}, root);

    expect(nDS.path).to.be(path.resolve(root));
  });

  it("uses the path config when provided", () => {
    const root = helpers.DSDir();
    const dbPath = "data/db";
    const nDS = new NeDBDataSource({ path: dbPath }, root);

    expect(nDS.path).to.be(path.resolve(root, dbPath));
  });
});
