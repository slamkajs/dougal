describe('dougal.Model', function () {

  var Model, Car, Collection, BasicCar, testCar, defaultOptions, $httpBackend, $rootScope;

  beforeEach(module('dougal'));

  beforeEach(inject(function ($injector) {
    BasicCar = $injector.get('BasicCar');
    Collection = $injector.get('Collection');
    Model = $injector.get('Model');
    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');

    defaultOptions = _.clone(BasicCar.prototype.$$options, true);
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

  describe('all', function () {
    it('should get all instances', function () {
      $httpBackend.expectGET('/cars')
        .respond([
          {id: 1, name: 'Super Car!'},
          {id: 2, name: 'Another Car!'}
        ]);
      var cars;
      Car.all().then(function (response) {
        cars = response;
      });
      $httpBackend.flush();
      expect(cars instanceof Collection).toBe(true);
      expect(cars.length).toBe(2);
      expect(_.map(cars, 'name')).toEqual(['Super Car!', 'Another Car!']);
    });
  });

  describe('find', function () {
    it('should load a single model', function () {
      $httpBackend.expectGET('/cars/1')
        .respond({id: 1, name: 'Super Car!'});
      Car.find(1).then(function (car) {
        testCar = car;
      });
      $httpBackend.flush();
      expect(testCar.$toJson()).toEqual({id: 1, name: 'Super Car!'});
      expect(testCar.$pristine).toBe(true);
    });
  });

  describe('where', function () {
    it('should load multiple models matching a criteria', function () {
      $httpBackend.expectGET('/cars?status=ACTIVE')
        .respond([
          {id: 1, name: 'Super Car!'},
          {id: 2, name: 'Another Car!'}
        ]);
      var cars;
      Car.where({status: 'ACTIVE'}).then(function (response) {
        cars = response;
      });
      $httpBackend.flush();
      expect(cars instanceof Collection).toBe(true);
      expect(cars.length).toBe(2);
      expect(cars[0].name).toEqual('Super Car!');
    });
  });

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

  describe('$fetch', function () {
    it('should fetch data for a single model', function () {
      $httpBackend.expectGET('/cars/1')
        .respond({id: 1, name: 'Super Car!'});
      testCar = new Car({id: 1});
      testCar.$fetch();
      $httpBackend.flush();
      expect(testCar.$toJson()).toEqual({id: 1, name: 'Super Car!'});
      expect(testCar.$pristine).toBe(true);
    });
  });

  describe('$get', function () {
    it('should get the value', function () {
      expect(testCar.name).toEqual('Super Car!');
    });

    it('should allow to override the getter', function () {
      defaultOptions.attributes.name.$get = function ($super) {
        expect(this.$$values.name).toEqual('Super Car!');
        expect($super()).toEqual('Super Car!');
        return 'custom getter';
      };
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
      defaultOptions.attributes.name.$set = function (name, $super) {
        expect(this.$$values.name).toEqual('Super Car!');
        $super(_.trim(name));
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
