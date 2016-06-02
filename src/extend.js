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
        return ExtendedModel.prototype.$$store.list({}).then(function (response) {
          return new Collection({
            model: ExtendedModel,
            data: response.data
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