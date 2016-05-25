(function () {
  'use strict';

  angular.module('dougal', [])
    .factory('Model', ModelFactory);

  ModelFactory.$inject = [];
  function ModelFactory() {

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
            return this.$get(key);
          },
          set: function (value) {
            return this.$set(key, value);
          }
        });
      });

      return ExtendedModel;
    };

    function Model(values) {
      _.assign(this.$$values, values);
      this.$reset();
    }

    Model.prototype = {
      constructor: Model,

      $pristine: true,

      $$changed: {},
      $$previousValues: {},
      $$values: {},

      $get: function (key) {
        return this.$$values[key];
      },

      $reset: function () {
        this.$$changed = {};
        this.$$previousValues = _.clone(this.$$values, true);
        this.$pristine = true;
      },

      $set: function (key, value) {
        this.$pristine = false;
        this.$$changed[key] = value;
        this.$$values[key] = value;
      }
    };

    return Model;
  }

})();
