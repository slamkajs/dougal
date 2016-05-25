/**
 * Dougal v0.1.0
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
     * @param options {Object}
     * `attributes` (Object) describes each attribute of the model with the following options:
     * * `$get`
     * * `$set`
     * * `$validate`
     *
     * `idAttribute` (String) overrides the attribute used for {@link Model#$id}
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

      _.assign(this.$$values, values);
      this.$reset();
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
        this.$pristine = true;
        this.$validate();
      },

      /**
       * Returns the current value of an attribute from the model.
       *
       * @param key
       * @example car.get('name')
       * @since 0.1.0
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
       * @since 0.1.0
       */
      $hasError: function (key) {
        return angular.isDefined(this.$$changed[key]) && angular.isDefined(this.$errors[key]);
      },

      /**
       * Returns a unique ID for that model. By default, returns the `id` attribute, but can be overriden by the
       * `idAttribute` option in [extend]{@link Model.extend}.
       * @since 0.2.0
       */
      $id: function () {
        return this.$$values[this.$$options.idAttribute || 'id'];
      },

      /**
       * @returns {boolean}
       * @example
       * new Car({}).$isNew();        // true
       * new Car({id: 123}).$isNew(); // false
       * @since 0.2.0
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
        this.$pristine = true;
        this.$validate();
      },

      /**
       * Set the value of an attribute from the model. Changing any value will set `$pristine` to false, even if you
       * revert to its original value.
       *
       * @param key
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
       * Validates the values of the model
       *
       * @param options
       * @returns {*}
       * @since 0.1.0
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
