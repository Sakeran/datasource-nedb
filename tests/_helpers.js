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
