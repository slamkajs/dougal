/**
 * @module dougal
 */
(function () {
  'use strict';

  angular.module('dougal', [])
    .factory('Model', ModelFactory);

  ModelFactory.$inject = ['$q'];
  function ModelFactory($q) {

    /**
     * (soon)
     *
     * @static
     * @function
     * @param options
     * @memberof module:dougal
     * @returns {ExtendedModel}
     */
    Model.extend = function (options) {
      function ExtendedModel(values) {
        if (options.initialize) {
          options.initialize.apply(this, arguments);
        } else {
          Model.call(this, values);
        }
      }

      ExtendedModel.prototype = _.create(Model.prototype, {
        $$options: options
      });

      _.each(options.attributes, function (attribute, key) {
        Object.defineProperty(ExtendedModel.prototype, key, {
          get: function () {
            if (attribute.$get) {
              return attribute.$get.call(this);
            } else {
              return this.$get(key);
            }
          },
          set: function (value) {
            if (attribute.$set) {
              return attribute.$set.call(this, value);
            } else {
              return this.$set(key, value);
            }
          }
        });
      });

      return ExtendedModel;
    };

    /**
     * (soon)
     *
     * @param values default values for the model
     * @class
     * @memberof module:dougal
     */
    function Model(values) {
      _.assign(this.$$values, values);
      this.$reset();
    }

    Model.prototype = {
      constructor: Model,

      /**
       * @example
       * var car = new Car({name: 'Super Car!'});
       * car.errors; // {}
       * car.name = '';
       * car.errors; // {name: 'Name cannot be empty'}
       */
      $errors: {},

      /**
       * Boolean property to indicate if a model has changed values.
       * @example
       * var car = new Car({name: 'Super Car!'});
       * car.$pristine; // true
       * car.name = 'New Name!';
       * car.$pristine; // false
       */
      $pristine: true,

      /**
       * Is true if all attributes are valid. Unlike [$hasError]{@link Model#$hasError}, it covers all values, changed
       * or not.
       */
      $valid: true,

      $$changed: {},
      $$previousValues: {},
      $$values: {},

      /**
       * Reverts the current changes to the last known state.
       *
       * @see Model#$reset
       * @example
       * var car = new Car({name: 'Super Car!'});
       * car.name = 'New Name!';
       * car.$clear();
       * car.name; // 'Super Car!';
       * car.$pristine; // true
       */
      $clear: function () {
        this.$$changed = {};
        this.$$values = _.clone(this.$$previousValues, true);
        this.$pristine = true;
        this.$validate();
      },

      /**
       * Returns the current value of an attribute from the model.
       *
       * @param key
       * @example car.get('name')
       */
      $get: function (key) {
        return this.$$values[key];
      },

      /**
       * Returns true only if the value was changed, and is now invalid. This function was designed for form validation,
       * where we do not want to spam the user with error messages until they actually change any value.
       *
       * @param key
       * @returns {boolean}
       * @example
       * var car = new Car({name: ''});
       * car.$hasError('name'); // false
       * car.name = '  ';
       * car.$hasError('name'); // true
       */
      $hasError: function (key) {
        return angular.isDefined(this.$$changed[key]) && angular.isDefined(this.$errors[key]);
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
       * Saves the current state as the last known.
       *
       * @see Model#$clear
       * @example
       * var car = new Car({name: 'Super Car!'});
       * car.name = 'New Name!';
       * car.$reset();
       * car.name; // 'New Name!';
       * car.$pristine; // true
       */
      $reset: function () {
        this.$$changed = {};
        this.$$previousValues = _.clone(this.$$values, true);
        this.$pristine = true;
        this.$validate();
      },

      /**
       * Set the value of an attribute from the model. Changing any value will set `$pristine` to false, even if you
       * revert to its original value.
       *
       * @param key
       * @param value
       * @example car.set('name', 'Super Car!')
       */
      $set: function (key, value) {
        this.$pristine = false;
        this.$$changed[key] = value;
        this.$$values[key] = value;
        this.$$validateAttribute(key);
      },

      /**
       * Validates the values of the model
       *
       * @param options
       * @returns {*}
       */
      $validate: function (options) {
        if (_.isString(options)) {
          return this.$$validateAttribute(options);
        }

        return $q.all(_.map(this.$$options.attributes, _.bind(function (value, key) {
          return this.$$validateAttribute(key);
        }, this)));
      },

      $$validateAttribute: function (key) {
        var validator = this.$$options.attributes[key].$validate || _.constant(true);
        return this.$$normalizeToPromise(validator.call(this, this.$$values[key]))
          .then(_.bind(function () {
            delete this.$errors[key];
          }, this))
          .catch(_.bind(function (errorMessage) {
            this.$errors[key] = errorMessage;
          }, this))
          .finally(_.bind(function () {
            this.$valid = _.isEmpty(this.$errors);
          }, this));
      }
    };

    return Model;
  }

})();
