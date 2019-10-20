const expect = require("expect.js");

const helpers = require("./_helpers");

describe("resolveEntityKey", () => {
  it("Doesn't throw ever", () => {
    const nDB = helpers.Instance();

    let config = { collection: "players", createMissing: true };
    expect(nDB.resolveEntityKey)
      .withArgs(config)
      .not.to.throwError();

    config = { collection: "players", createMissing: true, key: null };
    expect(nDB.resolveEntityKey)
      .withArgs(config)
      .not.to.throwError();

    config = { collection: "players", createMissing: true, key: [] };
    expect(nDB.resolveEntityKey)
      .withArgs(config)
      .not.to.throwError();

    config = { collection: "players", createMissing: true, key: {} };
    expect(nDB.resolveEntityKey)
      .withArgs(config)
      .not.to.throwError();

    config = { collection: "players", createMissing: true, key: true };
    expect(nDB.resolveEntityKey)
      .withArgs(config)
      .not.to.throwError();

    config = { collection: "players", createMissing: true, key: 10 };
    expect(nDB.resolveEntityKey)
      .withArgs(config)
      .not.to.throwError();

    config = { collection: "players", createMissing: true, key: "validKey" };
    expect(nDB.resolveEntityKey)
      .withArgs(config)
      .not.to.throwError();
  });

  it("returns null given a non-string key name", () => {
    const nDB = helpers.Instance();

    let config = { collection: "players", createMissing: true };
    expect(nDB.resolveEntityKey(config)).to.be(null);

    config = { collection: "players", createMissing: true, key: null };
    expect(nDB.resolveEntityKey(config)).to.be(null);

    config = { collection: "players", createMissing: true, key: [] };
    expect(nDB.resolveEntityKey(config)).to.be(null);

    config = { collection: "players", createMissing: true, key: { a: 1 } };
    expect(nDB.resolveEntityKey(config)).to.be(null);

    config = { collection: "players", createMissing: true, key: true };
    expect(nDB.resolveEntityKey(config)).to.be(null);
  });

  it("returns a valid key string exactly", () => {
    const nDB = helpers.Instance();

    let config = { collection: "players", createMissing: true, key: "name" };
    expect(nDB.resolveEntityKey(config)).to.be("name");

    config = { collection: "players", createMissing: true, key: "valid_key" };
    expect(nDB.resolveEntityKey(config)).to.be("valid_key");
  });
});
