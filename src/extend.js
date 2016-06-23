angular.module('dougal').run(extendModel);

extendModel.$inject = ['Collection', 'HttpStore', 'Model'];
function extendModel(Collection, HttpStore, Model) {

  /**
   * Creates a new model that inherits from the {@link module:dougal.Model|Model} class.
   *
   * #### Attributes properties
   * **`$get`** custom getter for the attribute. The `$super` parameter is for convenient overriding.
   *
   * ```javascript
   * $get: function ($super) {
   *   return '+' + $super() + '+';
   * }
   * ```
   *
   * **`$set`** custom setter for the attribute. The `$super` parameter is for convenient overriding.
   *
   * ```javascript
   * $set: function (value, $super) {
   *   $super(_.trim(value));
   * }
   * ```
   *
   * **`$validate`** validation method for the attribute.
   * For complex validations, can return a promise.
   * For simple validations, can return `true` or a string/an object if not.
   *
   * ```javascript
   * $validate: function (value) {
   *   return someCheck(value) ? true : 'The value is invalid because <reason>';
   *   // or
   *   var deferred = $q.defer();
   *   if (someCheck(true)) {
   *     deferred.resolve();
   *   } else {
   *     deferred.reject('The value is invalid because <reason>');
   *   }
   *   return deferred.promise;
   * }
   * ```
   *
   * @static
   * @function
   * @param options {Object}
   * `attributes` (Object) describes each attribute of the model. See above for details.
   *
   * `baseUrl` (String) will be interpolated with the model's attributes
   *
   * `idAttribute` (String) overrides the attribute used for {@link module:dougal.Model#$id|$id}
   *
   * `initialize` (Function) constructor inheritance
   *
   * `parseList` (Function) Called (if present) before collection parsing. See {@link module:dougal.Collection#parse}.
   *
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
       * Retrieves all instances of the model
       *
       * @static
       * @memberof module:dougal.Model
       * @returns {Promise} The promise resolves to an instance of {@link module:dougal.Collection|Collection}
       * @example
       * Car.all().then(function (cars) {
       *   cars.length; // 1
       *   instanceof cars[0]; // Car
       * });
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
       * Find an instance by ID
       *
       * @static
       * @param id {any}
       * @memberof module:dougal.Model
       * @returns {Promise} The promise resolves to an instance of {@link module:dougal.Model|Model}
       * @example
       * Car.find(1).then(function (car) {
       *   instanceof car; // Car
       * });
       * // Equivalent:
       * var car = new Car({id: 1});
       * car.$fetch();
       */
      find: function (id) {
        var model = new ExtendedModel();
        model.$set(options.idAttribute, id);
        return model.$fetch();
      },

      /**
       * Searches for instances matching `options`
       * @static
       * @param options {any}
       * @memberof module:dougal.Model
       * @returns {Promise} The promise resolves to an instance of {@link module:dougal.Collection|Collection}
       * @example
       * Car.where({some: 'filter'}).then(function (cars) {
       *   cars.length; // 1
       *   instanceof cars[0]; // Car
       * });
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
