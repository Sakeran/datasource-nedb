"use strict";
const path = require("path");
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
  }

  hasData(config = {}) {}

  fetchAll(config = {}) {}

  fetch(config = {}, id) {}

  replace(config = {}, data) {}

  update(config = {}, id, data) {}

  /**
   * Given the loader config object, return the path
   * to the NeDB datasource
   * @param {object} config loader config
   * @throws If the collection name is invalid
   * @throws If the collection path resolves to a directory
   */
  resolveCollectionPath(config) {
    const { collection } = config;
    if (!collection) {
      throw Error("NeDB Loader does not specify collection path");
    }

    if (typeof collection !== "string") {
      throw new Error("NeDB Loader collection option must be a string");
    }

    if (collection !== sanitize(collection)) {
      throw new Error(`NeDB Loader collection name "${collection}" is invalid`);
    }

    return path.resolve(
      this.path,
      collection + (collection.endsWith(".db") ? "" : ".db")
    );
  }
}

module.exports = NeDBDataSource;
