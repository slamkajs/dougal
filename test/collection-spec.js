describe('dougal.Collection', function () {

  var $rootScope, Collection, Car, cars;

  beforeEach(module('dougal'));

  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    Collection = $injector.get('Collection');
    Car = $injector.get('BasicCar');

    cars = new Collection({model: Car});
  }));

  it('should be defined', function () {
    expect(cars).toBeDefined();
  });

  it('should accept values by default', function () {
    var cars = new Collection({
      model: Car,
      data: [{id: 1, name: 'Super Car!'}]
    });
    $rootScope.$digest();
    expect(cars.length).toBe(1);
    expect(cars[0].name).toEqual('Super Car!');
  });

  describe('clear', function () {
    it('should clear the collection', function () {
      cars.push(new Car());
      cars.clear();
      expect(cars.length).toBe(0);
    });
  });

  describe('parse', function () {
    var sampleResponse = [
      {id: 1, name: 'Super Car!'},
      {id: 2, name: 'Another Car!'}
    ];

    it('should parse a JSON array in cars', function () {
      cars.parse(sampleResponse);
      $rootScope.$digest();
      expect(cars[0] instanceof Car).toBe(true);
      expect(cars[1] instanceof Car).toBe(true);
      expect(_.map(cars, 'name')).toEqual(['Super Car!', 'Another Car!']);
    });

    it('should allow to parse data with different structures', function () {
      // equivalent to pass parseList through Model.extend
      cars.Model.prototype.$$options.parseList = function (response) {
        return response.data;
      };
      cars.parse({data: sampleResponse});
      $rootScope.$digest();
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
