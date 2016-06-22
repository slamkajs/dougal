var _ = require('lodash'),
    angular = require('angular');

angular.module('dougal').factory('Collection', CollectionFactory);

CollectionFactory.$inject = [];
function CollectionFactory() {

  /**
   * Overrides native JS arrays with Dougal specific functions
   *
   * @example
   * var cars = new Collection({Model: Car});
   * cars.push(someCar);
   * cars[0]; // someCar
   *
   * @param options {Object}
   * * `model`
   * * `data` (optional)
   * @constructor
   * @memberof module:dougal
   * @since 0.3.0
   */
  function Collection(options) {
    Array.call(this);

    this.Model = options.model;

    if (options.data) {
      this.parse(options.data);
    }
  }

  Collection.prototype = _.create(Array.prototype, {

    /**
     * @instance
     * @memberof module:dougal.Collection
     * @since 0.3.0
     */
    clear: function () {
      this.length = 0;
    },

    /**
     * @instance
     * @param data {Array}
     * @memberof module:dougal.Collection
     * @since 0.3.0
     */
    parse: function (data) {
      this.clear();
      _.each(data, _.bind(function (values) {
        this.push(new this.Model(values));
      }, this));
    },

    /**
     * @instance
     * @memberof module:dougal.Collection
     * @since 0.3.0
     */
    toJson: function () {
      return _.map(this, function (model) {
        return model.$toJson();
      });
    }
  });

  module.exports = Collection;

  return Collection;
}
