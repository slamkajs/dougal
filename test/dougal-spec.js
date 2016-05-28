describe('dougal.Model', function () {

  var Model, Car, testCar, defaultOptions, $httpBackend, $rootScope;

  beforeEach(module('dougal'));

  beforeEach(inject(function ($injector) {
    Model = $injector.get('Model');
    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');

    defaultOptions = {
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
    };
    instantiateModel(defaultOptions);
  }));

  function instantiateModel(options) {
    Car = Model.extend(options);

    testCar = new Car({
      name: 'Super Car!',
      id: 1
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
    it('should have an error if the value is invalid', function () {
      testCar = new Car({name: ' '});
      testCar.$$validateAttribute('name');
      $rootScope.$digest();
      expect(testCar.$valid).toBe(false);
      expect(testCar.$hasError('name')).toBe(true);
    });
  });

  describe('$id', function () {
    it('should expose a unique ID', function () {
      expect(testCar.$id()).toBe(1);
    });

    it('should allow to override the id attribute', function () {
      defaultOptions.idAttribute = 'name';
      instantiateModel(defaultOptions);
      expect(testCar.$id()).toEqual('Super Car!');
    });
  });

  describe('$isNew', function () {
    it('should not be new', function () {
      expect(testCar.$isNew()).toBe(false);
    });

    it('should be new', function () {
      testCar = new Car();
      expect(testCar.$isNew()).toBe(true);
    });
  });

  describe('$reset', function () {
    it('should reset the $pristine state', function () {
      testCar.name = 'New value';
      testCar.$reset();
      expect(testCar.$pristine).toBe(true);
    });
  });

  describe('$save', function () {
    it('should save an existing car', function () {
      $httpBackend.expectPUT('/cars/1', {id: 1, name: 'New Name!'})
        .respond({id: 1, name: 'New Name!'});
      testCar.name = 'New Name!';
      testCar.$save();
      $httpBackend.flush();
      expect(testCar.name).toBe('New Name!');
      expect(testCar.$pristine).toBe(true);
    });

    it('should save a new car', function () {
      $httpBackend.expectPOST('/cars', {name: 'Super Car!'})
        .respond({id: 1, name: 'Super Car!'});
      testCar = new Car({name: 'Super Car!'});
      testCar.$save();
      $httpBackend.flush();
      expect(testCar.$id()).toBe(1);
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

  describe('$toJson', function () {
    it('should prepare a JSON-friendly version of the model', function () {
      expect(testCar.$toJson()).toEqual({id: 1, name: 'Super Car!'});
    });
  });

  describe('$url', function () {
    it('should provide the correct URLs', function () {
      expect(testCar.$url()).toEqual('/cars/1');
      testCar.id = undefined;
      expect(testCar.$url()).toEqual('/cars');
    });
  });

  describe('$validate', function () {
    it('should validate a single attribute', function () {
      testCar.name = ' ';
      testCar.$validate('name').then(function () {
        fail('it should not resolve the promise');
      });
      $rootScope.$digest();
      expect(testCar.$errors).toEqual({
        name: 'Name is required'
      });
      expect(testCar.$valid).toBe(false);
    });

    it('should validate all attributes', function () {
      testCar.name = ' ';
      testCar.$validate().then(function () {
        fail('it should not resolve the promise');
      });
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
