"use strict";

const tmp = require("tmp");

// Helper functions for testing.

/**
 * Return a random file path for a NeDB datasource.
 */
exports.DSFile = () => tmp.fileSync().name;

/**
 * Return a random directory path where a NeDB datasource might be located.
 */
exports.DSDir = () => tmp.dirSync().name;
