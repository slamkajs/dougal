angular.module('dougal').factory('BasicCar', function (Model) {
  return Model.extend({
    attributes: {
      name: {
        $validate: function (name) {
          return _.trim(name).length > 0 || 'Name is required';
        }
      },
      color: {},
      id: {}
    },
    baseUrl: '/cars'
  });
});