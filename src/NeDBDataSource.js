"use strict";
const path = require("path");

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
}

module.exports = NeDBDataSource;
