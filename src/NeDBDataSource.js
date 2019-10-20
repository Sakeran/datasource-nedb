"use strict";
const path = require("path");
const fs = require("fs");
const Datasource = require("nedb");
const sanitize = require("sanitize-filename");

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

  hasData(config = {}) {}

  fetchAll(config = {}) {}

  fetch(config = {}, id) {}

  replace(config = {}, data) {}

  update(config = {}, id, data) {}

  /**
   * Define a NeDB Datasource object and store a reference to it.
   * @param {object} config
   * @param {boolean} [config.createMissing=false] If true, will create a missing .db file
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
}

module.exports = NeDBDataSource;
