describe('dougal.Collection', function () {

  var Collection, Car, cars, $httpBackend, $rootScope;

  beforeEach(module('dougal'));

  beforeEach(inject(function ($injector) {
    Collection = $injector.get('Collection');
    Car = $injector.get('BasicCar');
    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');

    cars = new Collection({model: Car});
  }));

  it('should be defined', function () {
    expect(cars).toBeDefined();
  });

  it('should accept values by default', function () {
    car = new Collection({
      model: Car,
      data: [{id: 1, name: 'Super Car!'}]
    });
    expect(car.length).toBe(1);
    expect(car[0].name).toEqual('Super Car!');
  });

  describe('clear', function () {
    it('should clear the collection', function () {
      cars.push(new Car());
      cars.clear();
      expect(cars.length).toBe(0);
    });
  });

  describe('parse', function () {
    it('should parse a JSON array in cars', function () {
      cars.parse([
        {id: 1, name: 'Super Car!'},
        {id: 2, name: 'Another Car!'}
      ]);
      expect(cars[0] instanceof Car).toBe(true);
      expect(cars[1] instanceof Car).toBe(true);
      expect(_.map(cars, 'name')).toEqual(['Super Car!', 'Another Car!']);
    });
  });

  describe('toJson()', function () {
    it('should format to JSON', function () {
      expect(cars.toJson()).toEqual([]);
      cars.push(new Car({id: 1, name: 'Super Car!'}));
      expect(cars.toJson()).toEqual([{id: 1, name: 'Super Car!'}]);
    });
  });

});
