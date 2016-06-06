describe('dougal.HttpStore', function () {

  var Car, HttpStore, store, $httpBackend, $rootScope;

  beforeEach(module('dougal'));

  beforeEach(inject(function ($injector) {
    Car = $injector.get('BasicCar');
    HttpStore = $injector.get('HttpStore');
    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');

    store = new HttpStore({
      baseUrl: '/cars',
      idAttribute: 'id'
    });
  }));

  it('should be defined', function () {
    expect(store).toBeDefined();
  });

  describe('create', function () {
    it('should perform a POST request', function () {
      $httpBackend.expectPOST('/cars', {name: 'Super Car!'})
        .respond({id: 1, name: 'Super Car!'});
      var car = new Car({name: 'Super Car!'});
      store.create(car)
        .then(function (response) {
          expect(response).toEqual({id: 1, name: 'Super Car!'})
        })
        .catch(fail);
      $httpBackend.flush();
    });
  });

  describe('fetch', function () {
    it('should perform a GET request', function () {
      $httpBackend.expectGET('/cars/1')
        .respond({id: 1, name: 'Super Car!'});
      var car = new Car({id: 1});
      store.fetch(car)
        .then(function (response) {
          expect(response).toEqual({id: 1, name: 'Super Car!'})
        })
        .catch(fail);
      $httpBackend.flush();
    });
  });

  describe('list', function () {
    xit('should perform a GET request', function () {
    }).pend('TODO');
  });

  describe('update', function () {
    it('should perform a PUT request', function () {
      $httpBackend.expectPUT('/cars/1', {id: 1, name: 'Super Car!'})
        .respond({id: 1, name: 'Super Car!'});
      var car = new Car({id: 1, name: 'Super Car!'});
      store.update(car)
        .then(function (response) {
          expect(response).toEqual({id: 1, name: 'Super Car!'})
        })
        .catch(fail);
      $httpBackend.flush();
    });
  });

});
