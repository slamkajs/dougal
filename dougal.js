/**
 * Dougal v0.2.0
 * (c) 2016 AOL
 * Licence: Apache-2.0
 */
(function () { 'use strict';

/**
 * Default Angular module for Dougal
 *
 * @module dougal
 * @example
 * angular.module('your.app', ['dougal']);
 * @since 0.1.0
 */
angular.module('dougal', []);

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

  return Collection;
}

angular.module('dougal').run(extendModel);

extendModel.$inject = ['Collection', 'HttpStore', 'Model'];
function extendModel(Collection, HttpStore, Model) {

  /**
   * Creates a new model that inherits from the {@link module:dougal.Model|Model} class.
   *
   * @static
   * @function
   * @param options {Object}
   * `attributes` (Object) describes each attribute of the model with the following options:
   * * `$get`
   * * `$set`
   * * `$validate`
   *
   * `baseUrl` (String)
   *
   * `idAttribute` (String) overrides the attribute used for {@link module:dougal.Model#$id|$id}
   *
   * `initialize` (Function)
   * @memberof module:dougal
   * @returns {ExtendedModel}
   * @since 0.1.0
   */
  Model.extend = function (options) {
    function ExtendedModel(values) {
      if (options.initialize) {
        options.initialize.apply(this, arguments);
      } else {
        Model.call(this, values);
      }
    }

    options.idAttribute = options.idAttribute || 'id';

    ExtendedModel.prototype = _.create(Model.prototype, {
      $$idAttribute: options.idAttribute,
      $$options: options,
      $$store: new HttpStore(options)
    });

    _.assign(ExtendedModel, {
      /**
       * (soon)
       * @static
       * @memberof module:dougal.Model
       * @returns {Promise} The promise resolves to an instance of {@link module:dougal.Collection|Collection}
       */
      all: function () {
        return ExtendedModel.prototype.$$store.list({}).then(function (data) {
          return new Collection({
            model: ExtendedModel,
            data: data
          });
        });
      },

      /**
       * (soon)
       * @static
       * @param id {any}
       * @memberof module:dougal.Model
       * @returns {Promise} The promise resolves to an instance of {@link module:dougal.Model|Model}
       */
      find: function (id) {
        var model = new ExtendedModel();
        model.$set(options.idAttribute, id);
        return model.$fetch();
      },

      /**
       * (soon)
       * @static
       * @memberof module:dougal.Model
       * @returns {Promise} The promise resolves to an instance of {@link module:dougal.Collection|Collection}
       */
      where: function (options) {
        return ExtendedModel.prototype.$$store.list(options).then(function (data) {
          return new Collection({
            model: ExtendedModel,
            data: data
          });
        });
      }
    });

    _.each(options.attributes, function (attribute, key) {
      Object.defineProperty(ExtendedModel.prototype, key, {
        get: function () {
          function $super() {
            return this.$get(key);
          }

          if (attribute.$get) {
            return attribute.$get.call(this, _.bind($super, this));
          } else {
            return $super.call(this);
          }
        },
        set: function (value) {
          function $super(value) {
            return this.$set(key, value);
          }

          if (attribute.$set) {
            return attribute.$set.call(this, value, _.bind($super, this));
          } else {
            return $super.call(this, value);
          }
        }
      });
    });

    return ExtendedModel;
  };
}

angular.module('dougal').factory('Model', ModelFactory);

ModelFactory.$inject = ['$q'];
function ModelFactory($q) {

  /**
   * Default constructor. Should never be called directly, but through an implementation using
   * {@link module:dougal.Model.extend|Model.extend()}.
   *
   * @protected
   * @param values {Object} default values for the model
   * @class
   * @memberof module:dougal
   * @since 0.1.0
   */
  function Model(values) {
    /**
     * @example
     * var car = new Car({name: 'Super Car!'});
     * car.errors; // {}
     * car.name = '';
     * car.errors; // {name: 'Name cannot be empty'}
     * @since 0.1.0
     */
    this.$errors = {};

    /**
     * Boolean property to indicate if a model has changed values.
     * @example
     * var car = new Car({name: 'Super Car!'});
     * car.$pristine; // true
     * car.name = 'New Name!';
     * car.$pristine; // false
     * @since 0.1.0
     */
    this.$pristine = true;

    /**
     * Is true if all attributes are valid. Unlike [$hasError]{@link Model#$hasError}, it covers all values, changed
     * or not.
     * @since 0.1.0
     */
    this.$valid = true;

    this.$$changed = {};
    this.$$previousValues = {};
    this.$$values = {};

    this.$parse(values);
  }

  Model.prototype = {
    constructor: Model,

    /**
     * Reverts the current changes to the last known state.
     *
     * @see {@link module:dougal.Model#$reset|$reset()}
     * @example
     * var car = new Car({name: 'Super Car!'});
     * car.name = 'New Name!';
     * car.$clear();
     * car.name; // 'Super Car!';
     * car.$pristine; // true
     * @since 0.1.0
     */
    $clear: function () {
      this.$$changed = {};
      this.$$values = _.clone(this.$$previousValues, true);
      this.$errors = {};
      this.$pristine = true;
    },

    /**
     * @since 0.3.0
     */
    $fetch: function () {
      return this.$$store.fetch(this)
        .then(_.bind(function (data) {
          this.$parse(data);
          return this;
        }, this));
    },

    /**
     * @returns current value of an attribute from the model
     *
     * @param key {String}
     * @example car.$get('name')
     * @since 0.1.0
     */
    $get: function (key) {
      return this.$$values[key];
    },

    /**
     * @returns {boolean} true if the value is invalid
     *
     * @param key {String}
     * @example
     * var car = new Car({name: ''});
     * car.$hasError('name'); // false
     * car.name = '  ';
     * car.$hasError('name'); // true
     * @since 0.1.0
     */
    $hasError: function (key) {
      return angular.isDefined(this.$errors[key]);
    },

    /**
     * @returns a unique ID for that model. By default, the `id` attribute, but can be overriden by the `idAttribute`
     * option in [extend]{@link Model.extend}.
     * @since 0.1.1
     */
    $id: function () {
      return this.$$values[this.$$idAttribute];
    },

    /**
     * @returns {boolean} true if the model has an ID
     * @example
     * new Car({}).$isNew();        // true
     * new Car({id: 123}).$isNew(); // false
     * @since 0.1.1
     */
    $isNew: function () {
      return angular.isUndefined(this.$id());
    },

    $$normalizeToPromise: function (value) {
      return $q.when(value).then(function (value) {
        if (value === true) {
          return true;
        } else {
          return $q.reject(value);
        }
      });
    },

    /**
     * (soon)
     *
     * @param values
     * @since 0.2.0
     */
    $parse: function (values) {
      _.assign(this.$$values, values);
      this.$reset();
    },

    /**
     * Saves the current state as the last known.
     *
     * @see {@link module:dougal.Model#$clear|$clear()}
     * @example
     * var car = new Car({name: 'Super Car!'});
     * car.name = 'New Name!';
     * car.$reset();
     * car.name; // 'New Name!';
     * car.$pristine; // true
     * @since 0.1.0
     */
    $reset: function () {
      this.$$changed = {};
      this.$$previousValues = _.clone(this.$$values, true);
      this.$errors = {};
      this.$pristine = true;
    },

    /**
     * Saves modifications made to the given model.
     *
     * @returns {Promise}
     * @since 0.2.0
     */
    $save: function () {
      return this.$validate()
        .then(_.bind(function () {
          function callback(data) {
            this.$parse(data);
            return this;
          }

          if (this.$isNew()) {
            return this.$$store.create(this).then(_.bind(callback, this));
          } else {
            return this.$$store.update(this).then(_.bind(callback, this));
          }
        }, this));
    },

    /**
     * Set the value of an attribute from the model. Changing any value will set `$pristine` to false and trigger a
     * validation call, even if you revert to its original value.
     *
     * @param key {String}
     * @param value
     * @example car.$set('name', 'Super Car!')
     * @since 0.1.0
     */
    $set: function (key, value) {
      this.$pristine = false;
      this.$$changed[key] = value;
      this.$$values[key] = value;
      this.$$validateAttribute(key);
    },

    /**
     * @returns {object} a copy of the object attributes
     * @example
     * new Car({id: 123, name: 'Super Car!', color: 'blue'}).toJson();
     * // {id: 123, name: 'Super Car!', color: 'blue'}
     * @since 0.2.0
     */
    $toJson: function () {
      return _.pick(this.$$values, _.keys(this.$$options.attributes));
    },

    /**
     * Validates the values of the model
     *
     * @param options
     * @returns {Promise}
     * @since 0.1.0
     */
    $validate: function (options) {
      if (_.isString(options)) {
        return this.$$validateAttribute(options);
      }

      return this.$$validateAllAttributes();
    },

    $$validateAllAttributes: function () {
      return $q.all(_.map(this.$$options.attributes, _.bind(function (value, key) {
        return this.$$validateAttribute(key);
      }, this))).catch(_.bind(function () {
        return $q.reject(this.$errors);
      }, this));
    },

    $$validateAttribute: function (key) {
      var validator = this.$$options.attributes[key].$validate || _.constant(true);
      return this.$$normalizeToPromise(validator.call(this, this.$$values[key]))
        .then(_.bind(function () {
          delete this.$errors[key];
        }, this))
        .catch(_.bind(function (errorMessage) {
          this.$errors[key] = errorMessage;
          return $q.reject(errorMessage);
        }, this))
        .finally(_.bind(function () {
          this.$valid = _.isEmpty(this.$errors);
        }, this));
    }
  };

  return Model;
}

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
        params: criteria
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


})();