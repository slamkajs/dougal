angular.module('dougal').factory('HttpStore', HttpStoreFactory);

HttpStoreFactory.$inject = ['$http', '$interpolate'];
function HttpStoreFactory($http, $interpolate) {
  /**
   * HTTP storage layer
   *
   * | Action | URL | Method |
   * |--------|-----|--------|
   * | Index | `/cars` | GET |
   * | Fetch | `/cars/:id` | GET |
   * | Create | `/cars` | POST |
   * | Update | `/cars/:id` | PUT |
   * | Delete | `/cars/:id` | DELETE |
   *
   * @param options
   * @class
   * @memberof module:dougal
   * @since 0.3.0
   */
  function HttpStore(options) {
    this.baseUrl = {
      index: $interpolate(options.baseUrl),
      fetch: $interpolate(options.baseUrl + '/{{' + options.idAttribute + '}}')
    };
  }

  HttpStore.prototype = {
    constructor: HttpStore,

    create: function (model) {
      return this.sync('POST', model);
    },

    fetch: function (model) {
      return this.http({
        url: this.url(model),
        method: 'GET'
      });
    },

    http: function (options) {
      return $http(options)
        .then(function (response) {
          return response.data;
        });
    },

    list: function (criteria) {
      return this.http({
        url: this.baseUrl.index(criteria),
        method: 'GET',
        params: _.omit(criteria, this.baseUrl.index.expressions)
      });
    },

    sync: function (method, model) {
      return this.http({
        data: model.$toJson(),
        method: method,
        url: this.url(model)
      });
    },

    update: function (model) {
      return this.sync('PUT', model);
    },

    /**
     * @returns {String} URL for the model using Angular's `$interpolate` and the model's attributes.
     * @param model
     * @see {@link module:dougal.Model#$toJson|$toJson()}
     * @example
     * store.url(new Car()); // /cars
     * store.url(new Car({id: 123})); // /cars/123
     * // works with all attributes:
     * partsStore.url(new CarPart({carId: 123, id: 456}));
     * // /cars/123/parts/456 => baseUrl: /cars/{{carId}}/parts/{{id}}
     * @since 0.3.0
     */
    url: function (model) {
      if (model.$isNew()) {
        return this.baseUrl.index(model.$toJson());
      } else {
        return this.baseUrl.fetch(model.$toJson());
      }
    }
  };

  return HttpStore;
}
