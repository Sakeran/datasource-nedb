"use strict";
const path = require("path");
const fs = require("fs");
const Datasource = require("nedb");
const sanitize = require("sanitize-filename");

/**
 * Data Source using NeDB for persistance
 *
 * @property {object} config Initial config object
 * @property {string} rootPath Initial root path
 * @property {string} path Location where datastores will be saved by default
 * @property {Map<string, Datastore>} datasources Internal store for datastores
 */
class NeDBDataSource {
  constructor(config = {}, rootPath) {
    if (!rootPath || typeof rootPath !== "string") {
      throw new Error("No rootPath passed to NeDBDataSource constructor");
    }

    if (config.path && typeof config.path !== "string") {
      throw new Error(
        "Invalid 'path' option passed to NeDBDataSource constructor"
      );
    }

    this.config = config;
    this.rootPath = rootPath;
    this.path = path.resolve(rootPath, config.path || "");

    this.datasources = new Map();
  }

  /**
   * Resolves to true if the specified collection has data.
   * @param {object} config
   * @return {Promise<boolean>}
   */
  async hasData(config = {}) {
    const collection = await this.loadCollection(config);

    return await new Promise((resolve, reject) => {
      collection.count({}, (err, count) => {
        if (err) return reject(err);
        return resolve(count > 0);
      });
    });
  }

  /**
   * Resolves to the specified collection's entire dataset.
   * Returns an array, or an object if config.fetchAllObj is set.
   * @param {object} config
   * @return {Promise<Array|Object>}
   * @throws {Error} If config.fetchAllObj is set without a key
   */
  async fetchAll(config = {}) {
    const collection = await this.loadCollection(config);

    const { fetchAllObj } = config;
    let key;
    if (fetchAllObj) {
      key = this.resolveEntityKey(config);
      if (!key) {
        throw new Error(
          "No key configured for NeDBDataSource 'fetchAll' action (in fetchAllObj mode)"
        );
      }
    }

    const entries = await new Promise((resolve, reject) => {
      collection.find({}, { _id: 0 }, (err, docs) => {
        if (err) return reject(err);
        return resolve(docs);
      });
    });

    if (!fetchAllObj) return entries;

    // TODO - We currently don't have defined behaviors for duplicate keys,
    // or for documents with no key.
    const objEntries = {};

    entries.forEach(entry => {
      let entryKey = entry[key];
      if (entryKey === undefined) return;
      if (typeof entryKey !== "string") entryKey = JSON.stringify(entryKey);
      objEntries[entryKey] = entry;
    });

    return objEntries;
  }

  /**
   * Resolves to a single document in the specified dataset,
   * selected by matching the given id against the specified
   * key field.
   * @param {object} config
   * @param {*} id
   * @return {Promise<object>}
   * @throws {Error} if no key is set
   * @throws {Error} if no matching document exists
   */
  async fetch(config = {}, id) {
    const key = this.resolveEntityKey(config);
    if (!key)
      throw new Error("No key configured for NeDBDataSource 'fetch' action");

    const datasource = await this.loadCollection(config);

    const query = {};
    query[key] = id;

    return await new Promise((resolve, reject) => {
      datasource.findOne(query, { _id: 0 }, (err, doc) => {
        if (err) return reject(err);
        if (!doc)
          return reject(
            new Error(`Document with key/value {${key}: ${id}} not found.`)
          );
        return resolve(doc);
      });
    });
  }

  /**
   * Replaces the entire dataset with the given data.
   *
   * @param {object} config
   * @param {Array|object} data
   * @return {Promise}
   * @throws {Error} if not passed an array (by default)
   * @throws {Error} if not passed an object with config.fetchAllObj set
   */
  async replace(config = {}, data) {
    const collection = await this.loadCollection(config);

    const { fetchAllObj } = config;

    if (fetchAllObj) {
      if (!(typeof data === "object" && data.constructor === Object)) {
        throw new Error(
          "Non-object passed to NeDBDataSource 'replace' action (in fetchAllObj mode)"
        );
      }
    } else {
      if (!Array.isArray(data)) {
        throw new Error("Non-Array passed to NeDBDataSource 'replace' action");
      }
    }

    await new Promise((resolve, reject) => {
      collection.remove({}, { multi: true }, err => {
        if (err) return reject(err);
        return resolve();
      });
    });

    let dataset = fetchAllObj ? Object.values(data) : data;

    return await new Promise((resolve, reject) => {
      collection.insert(dataset, err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  /**
   * Updates a single document in the dataset, upserting
   * the document if it doesn't exist.
   * @param {object} config
   * @param {*} id
   * @param {object} data
   * @return {Promise}
   * @throws {Error} if no key is set
   */
  async update(config = {}, id, data) {
    const key = this.resolveEntityKey(config);
    if (!key)
      throw new Error("No key configured for NeDBDataSource 'update' action");

    const datasource = await this.loadCollection(config);

    const query = {};
    query[key] = id;

    return await new Promise((resolve, reject) => {
      datasource.update(query, data, { upsert: true }, err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  /**
   * Removes a single document in the dataset, selected by
   * matching the given id against the specified key field.
   * @param {object} config
   * @param {*} id
   * @return {Promise}
   */
  async remove(config = {}, id) {
    const key = this.resolveEntityKey(config);
    if (!key)
      throw new Error("No key configured for NeDBDataSource 'fetch' action");

    const datasource = await this.loadCollection(config);

    const query = {};
    query[key] = id;

    return await new Promise((resolve, reject) => {
      datasource.remove(query, {}, (err, numRemoved) => {
        if (err) return reject(err);
        if (numRemoved === 0)
          return reject(
            new Error(`Document with key/value {${key}: ${id}} not found.`)
          );
        return resolve();
      });
    });
  }

  /**
   * Define a NeDB Datasource object and store a reference to it.
   * @param {object} config
   * @param {boolean} [config.createMissing=false] If true, will create a missing .db file
   * @return {Promise<Datastore>}
   * @throws {Error} If config.createMissing is false, and no .db file is present.
   */
  async loadCollection(config) {
    // Create a key for our datasources map.
    const key = this.resolveDatasourceKey(config);

    // Datasources in this map are considered current and loaded.
    let datasource = this.datasources.get(key);
    if (datasource) return datasource;

    const collectionPath = this.resolveCollectionPath(config);
    const { createMissing } = config;

    // If the datasource file doesn't exist, throw unless
    // the loader config says otherwise.
    if (!createMissing && !fs.existsSync(collectionPath)) {
      throw new Error(
        `Datasource file "${collectionPath}" could not be found.`
      );
    }

    try {
      datasource = await new Promise((resolve, reject) => {
        const ds = new Datasource({
          filename: collectionPath,
          autoload: true,
          onload: err => {
            if (err) return reject(err);
            return resolve(ds);
          }
        });
      });
    } catch (e) {
      throw e;
    }

    this.datasources.set(key, datasource);
    return datasource;
  }

  /**
   * Given the loader config object, return the path
   * to the NeDB datasource
   * @param {object} config loader config
   * @return {string}
   * @throws {Error}If the collection name is invalid
   * @throws {Error} If the collection path resolves to a directory
   */
  resolveCollectionPath(config) {
    const { collection, bundlePath, area, bundle } = config;
    if (!collection) {
      throw Error("NeDB Loader does not specify collection path");
    }

    if (typeof collection !== "string") {
      throw new Error("NeDB Loader collection option must be a string");
    }

    if (collection !== sanitize(collection)) {
      throw new Error(`NeDB Loader collection name "${collection}" is invalid`);
    }

    // Add '.db' extention if not already specified.
    const collectionFilename =
      collection + (collection.endsWith(".db") ? "" : ".db");

    if (!bundlePath) {
      // Use the default path.
      return path.resolve(this.path, collectionFilename);
    }

    // Load from a bundle, or some other path relative to the root.

    if (bundlePath.includes("[AREA]") && !area) {
      throw new Error("No area configured for bundle path with [AREA]");
    }

    if (bundlePath.includes("[BUNDLE]") && !bundle) {
      throw new Error("No bundle configured for bundle path with [BUNDLE]");
    }

    return require("path")
      .join(this.rootPath, bundlePath, collectionFilename)
      .replace("[AREA]", area)
      .replace("[BUNDLE]", bundle);
  }

  /**
   * Return a map key for the datasource indicated by the given loader
   * config.
   * @param {object} config
   * @return {string}
   */
  resolveDatasourceKey(config) {
    const { bundle, area, collection } = config;
    return `${bundle || "_"}:${area || "_"}:${collection}`;
  }

  /**
   * Returns the Entity/Document key indicated by the given loader config.
   * If config.key is not set to a valid string, the loader will be
   * unable to use the 'fetch' and 'update' methods.
   * @param {*} config
   * @return {string|null}
   */
  resolveEntityKey(config) {
    const { key } = config;

    if (typeof key !== "string") return null;
    return key;
  }
}

module.exports = NeDBDataSource;
