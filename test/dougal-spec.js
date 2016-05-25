describe('dougal.Model', function () {

  var Model, Car, testCar;

  beforeEach(module('dougal'));

  beforeEach(inject(function ($injector) {
    Model = $injector.get('Model');

    Car = Model.extend({
      attributes: {
        name: {},
        color: {}
      }
    });

    testCar = new Car({
      name: 'Super Car!'
    });
  }));

  describe('constructor', function () {
    it('should create a new instance of the model', function () {
      expect(testCar instanceof Car).toBe(true);
    });

    it('should allow to pass a custom constructor', function () {
      var customConstructor = false;
      var CustomModel = Model.extend({
        initialize: function () {
          customConstructor = true;
          Model.apply(this, arguments);
        }
      });
      var instance = new CustomModel();
      expect(customConstructor).toBe(true);
      expect(instance instanceof CustomModel).toBe(true);
      expect(instance instanceof Model).toBe(true);
    })
  });

  describe('$get', function () {
    it('should get the value', function () {
      expect(testCar.name).toEqual('Super Car!');
    });
  });

  describe('$set', function () {
    it('should set the value', function () {
      testCar.name = 'New value';
      expect(testCar.name).toEqual('New value');
      expect(testCar.$pristine).toBe(false);
    });
  });

  describe('$reset', function () {
    it('should reset the $pristine state', function () {
      testCar.name = 'New value';
      testCar.$reset();
      expect(testCar.$pristine).toBe(true);
    });
  });

});
