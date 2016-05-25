(function () {
  'use strict';

  angular.module('dougal', [])
    .factory('Model', ModelFactory);

  ModelFactory.$inject = [];
  function ModelFactory() {

    function Model() {
    }

    return Model;
  }

})();
