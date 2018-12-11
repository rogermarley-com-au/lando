'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

// Builder
module.exports = {
  name: 'mysql',
  config: {
    // Versions
    version: '5.7',
    supported: ['8.0', '5.7'],
    patchesSupported: true,
    legacy: [],
    // Config
    confSrc: __dirname,
    creds: {
      database: 'database',
      password: 'mysql',
      user: 'mysql',
    },
    healthcheck: 'mysql -uroot --silent --execute "SHOW DATABASES;"',
    port: '3306',
    defaultFiles: {
      config: path.join(__dirname, 'my_custom.cnf'),
    },
    remoteFiles: {
      config: '/opt/bitnami/mysql/conf/my_custom.cnf',
    },
  },
  parent: '_database',
  builder: (parent, config) => class LandoMySql extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Build the default stuff here
      const mysql = {
        image: `bitnami/mysql:${options.version}`,
        command: '/entrypoint.sh /run.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          MYSQL_DATABASE: options.creds.database,
          MYSQL_PASSWORD: options.creds.password,
          MYSQL_USER: options.creds.user,
        },
        volumes: [
          `${options.defaultFiles.config}:${options.remoteFiles.config}`,
          `data_${options.name}:/bitnami/mysql/data`,
        ],
      };
      // Send it downstream
      super(id, options, {
        services: _.set({}, options.name, mysql),
        volumes: _.set({}, `data_${options.name}`, {}),
      });
    };
  },
};