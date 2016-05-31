angular.module('dougal').factory('Model', ModelFactory);

ModelFactory.$inject = ['HttpStore', '$q'];
function ModelFactory(HttpStore, $q) {

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
      $$options: options
    });

    ExtendedModel.prototype.$$store = new HttpStore(options);

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
          function callback(response) {
            this.$parse(response.data);
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
