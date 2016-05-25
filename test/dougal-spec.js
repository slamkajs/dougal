describe('dougal.Model', function () {

  var Model, Car, testCar, defaultOptions, $rootScope;

  beforeEach(module('dougal'));

  beforeEach(inject(function ($injector) {
    Model = $injector.get('Model');
    $rootScope = $injector.get('$rootScope');

    defaultOptions = {
      attributes: {
        name: {
          $validate: function (name) {
            return _.trim(name).length > 0 || 'Name is required';
          }
        },
        color: {}
      }
    };
    instantiateModel(defaultOptions)
  }));

  function instantiateModel(options) {
    Car = Model.extend(options);

    testCar = new Car({
      name: 'Super Car!'
    });
    $rootScope.$digest();
  }

  describe('constructor', function () {
    it('should create a new instance of the model', function () {
      expect(testCar instanceof Car).toBe(true);
    });

    it('should allow to pass a custom constructor', function () {
      var customConstructor = false;
      defaultOptions.initialize = function () {
        customConstructor = true;
        Model.call(this);
      };
      instantiateModel(defaultOptions);
      expect(customConstructor).toBe(true);
    })
  });

  describe('$clear', function () {
    it('should cancel any change', function () {
      testCar.name = 'New value';
      testCar.$clear();
      expect(testCar.name).toEqual('Super Car!');
      expect(testCar.$pristine).toBe(true);
    });
  });

  describe('$get', function () {
    it('should get the value', function () {
      expect(testCar.name).toEqual('Super Car!');
    });

    it('should allow to override the getter', function () {
      defaultOptions.attributes.name.$get = _.constant('custom getter');
      instantiateModel(defaultOptions);
      expect(testCar.name).toEqual('custom getter');
    });
  });

  describe('$hasError', function () {
    it('should have an error if the value has changed and is invalid', function () {
      testCar = new Car({name: ''});
      $rootScope.$digest();
      expect(testCar.$valid).toBe(false);
      expect(testCar.$hasError('name')).toBe(false);
      testCar.name = ' ';
      $rootScope.$digest();
      expect(testCar.$valid).toBe(false);
      expect(testCar.$hasError('name')).toBe(true);
    });
  });

  describe('$reset', function () {
    it('should reset the $pristine state', function () {
      testCar.name = 'New value';
      testCar.$reset();
      expect(testCar.$pristine).toBe(true);
    });
  });

  describe('$set', function () {
    it('should set the value', function () {
      testCar.name = 'New value';
      expect(testCar.name).toEqual('New value');
      expect(testCar.$pristine).toBe(false);
    });

    it('should allow to override the setter', function () {
      defaultOptions.attributes.name.$set = function (name) {
        Model.prototype.$set.call(this, 'name', _.trim(name));
      };
      instantiateModel(defaultOptions);
      testCar.name = '  New value  ';
      expect(testCar.name).toEqual('New value');
    });
  });

  describe('$validate', function () {
    it('should validate a single attribute', function () {
      testCar.name = ' ';
      testCar.$validate('name');
      $rootScope.$digest();
      expect(testCar.$errors).toEqual({
        name: 'Name is required'
      });
      expect(testCar.$valid).toBe(false);
    });

    it('should validate all attributes', function () {
      testCar.name = ' ';
      testCar.$validate();
      $rootScope.$digest();
      expect(testCar.$errors).toEqual({
        name: 'Name is required'
      });
      expect(testCar.$valid).toBe(false);
    });

    it('should validate values by default', function () {
      testCar.$validate('color');
      $rootScope.$digest();
      expect(testCar.$errors.color).toBeUndefined();
      expect(testCar.$valid).toBe(true);
    });
  });

});
