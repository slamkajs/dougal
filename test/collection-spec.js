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

  describe('clear', function () {
    // TODO
  });

  describe('parse', function () {
    // TODO
  });

});
