# datasource-nedb

[NeDB](https://github.com/louischatriot/nedb) DataSource for the Ranvier game engine.

A loader configured with this DataSource will hold its entire dataset in memory, making it suitable for small to medium-sized datasets that see regular read/write operations. It is less suitable for loading Ranvier definintions from bundles (which tend to be read once), though this is also supported.

## DataSource Configuration

A single **NeDBDataSource** instance can hold any number of datastores (loader types) in memory at once. To install, configure the DataStore in the `ranvier.json` configuration file:

### Example

```js
{
  "dataSources": {
    "NeDB": {
      "require": {"./path/to/NeDBDataSource"}
      "config": {
        // 'Path' is required to specify the directory where the datastores will
        // be saved. The path is relative to the root path defined at startup.
        // If no path is set, data will be saved to the root directory.
        "path": "data/db"
      }
    }
  }
}
```

## EntityLoader Configuration

One EntityLoader should be configured for each type of data you wish to store. Configure the EntityLoaders in the `ranvier.json` configuration file. Afterwards, they can be interacted with using the Ranvier EntityLoader interface.

### Important Settings

The most important configuration settings is `collection`, which specifies the name of the datastore the Loader will operate on. Almost as important is the `key` setting, which specifies the field name that identifies each record. The `key` setting is required if you want to use the EntityLoader's `fetch`, `update`, or `remove` methods.

If the Loader's `fetchAll` method should return an object (required in some cases by Ranvier core), set the `fetchAllObj` setting to `true`. This requires that `key` be set in order to determine which field is used for the object's keys. This will also modify the behavior of the `replace` method, requiring its input to be an object instead of an array.

See a complete list of options below.

### Example

```js
{
  "entitySources": {
    // Example A: A hypothetical datastore for bug reports.
    // No key is defined, so we can only get everything all
    // once with `fetchAll`.
    "bugs": {
      "source": "NeDB",
      "config": {
        // Store the data in "bugReports.db"
        "collection": "bugReports"
      }
    }

    // Example B: Simple In-Game BBS.
    // Each board will have its own name (ex. 'General', 'Wizards', etc),
    // so we'll set the key to 'name', allowing us to access one at a time.
    "bbs": {
      "source": "NeDB",
      "config": {
        "collection": "bbs",
        "key": "name"
      }
    }

    // Example C: Accounts Loader
    // Ranvier requires that 'fetchAll' return an object here.
    // Ranvier accounts are keyed by username.
    "accounts": {
      "source": "NeDB",
      "config": {
        "collection": "accounts",
        // Set 'fetchAllObj' to use the return-object behavior.
        "fetchAllObj": true
        // Remember that 'key' is required when using 'fetchAllObj'.
        "key": "username",
      }
    }

    // Example D: Bundle Items Loader
    // Loading from bundles with this DataSource isn't especially
    // efficient, but it is possible to do.
    // This will load one datastore per installed bundle.
    // Items are keyed by id.
    // The datastore will also live in a separate bundle directory.
    "items": {
      "source": "NeDB",
      "config": {
        // Note - this will refer to 'items.db' in some bundle directory,
        // NOT in the DataSource's default path.
        "collection": "items",
        "key": "id",
         // bundlePath is resolved from the root directory.
         // Similar to DataSources like YamlDataSource, [BUNDLE]
         // and [AREA] tokens will be replaced with the current
         // bundle and area names during runtime.
        "bundlePath": "bundles/[BUNDLE]/areas/[AREA]"
      }
    }
  }
}
```

### Entity Loader Settings

NeDB EntityLoaders may be configured with the following settings:

- config.collection: **(required)** Name of the datastore the loader will read and write to.

- config.key: Name of the field used to uniquely identify entries in the given datastore. The datastore itself does not enforce uniqueness of the key, but usage may be inconsistent if it is not. **(required to use `fetch`, `update`, and `remove` methods)**

- config.createMissing: By default, the EntityLoader will throw an error if the 'collection.db' file is not present at the expected path. If set to `true`, the file and any necessary directories will be created when loaded.

- config.fetchAllObj: By default, `fetchAll` will return an array of all entries in the datastore. If set to `true`, `fetchAll` will return an object mapping each entry's key to the entry itself. This requires that `config.key` be set, and any entries that do not have the specified key will not be returned. If set, the `replace` method will expect an object of similar structure as its input.

- config.bundlePath: If set, specifies an alternate path to the datastore. The path is resolved from the root directory specified by Ranvier's `DataLoaderRegistry.load` method. The path may include the '[BUNDLE]' and '[AREA]' tokens, which will be replaced with bundle and area names during the bundle loading process. This setting can also be used to define any custom path to a datastore.