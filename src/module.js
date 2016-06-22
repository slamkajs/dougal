var angular = require('angular');

/**
 * Default Angular module for Dougal
 *
 * @module dougal
 * @example
 * angular.module('your.app', ['dougal']);
 * @since 0.1.0
 */
angular.module('dougal', []);

module.exports = {
  Collection: require('./collection'),
  HttpStore: require('./httpStore'),
  Model: require('./model')
};
