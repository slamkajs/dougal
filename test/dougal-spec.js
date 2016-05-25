describe('dougal.Model', function () {

  var Model;

  beforeEach(module('dougal'));

  beforeEach(inject(function ($injector) {
    Model = $injector.get('Model');
  }));

  it('should instantiate', function () {
    expect(Model).toBeDefined();
  });

});
