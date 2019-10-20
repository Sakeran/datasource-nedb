"use strict";

const NeDBDataSource = require("../src/NeDBDataSource");

const tmp = require("tmp");
tmp.setGracefulCleanup();

// Helper functions for testing.

/**
 * Return a random file path for a NeDB datasource.
 */
exports.DSFile = () => tmp.fileSync().name;

/**
 * Return a random directory path where a NeDB datasource might be located.
 */
exports.DSDir = () => tmp.dirSync({ unsafeCleanup: true }).name;

/**
 * Return a new NeDBDataSource instance configured to a random
 * root path.
 */

exports.Instance = () => new NeDBDataSource({}, exports.DSDir());

/**
 * Create a sample (hydrated) entity document for testing.
 */
exports.Entity = ({
  id = 0,
  name = "Entity",
  description = "An Entity",
  metadata = {}
}) => ({
  id,
  name,
  description,
  metadata
});

/**
 * Creates an array of entity documents for testing.
 */
exports.Entities = (...entities) =>
  entities.map((e, i) => {
    if (!e.id) {
      e.id = i;
    }
    if (!e.name) {
      e.name = `Entity_${i}`;
    }
    return exports.Entity(e);
  });

/**
 * Creates and populates a datastore in the given datasource
 */
exports.Populate = async (nDB, count = 1, collection = "players") => {
  const config = { collection, createMissing: true };
  let datastore = await nDB.loadCollection(config);

  let entities = [];
  count = Math.max(1, count);
  for (let i = 0; i < count; i++) {
    entities.push({});
  }
  entities = exports.Entities(...entities);

  return await new Promise((resolve, reject) => {
    datastore.insert(entities, err => {
      if (err) return reject(err);
      return resolve();
    });
  });
};
