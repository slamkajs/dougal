# Dougal

[![Bower](https://img.shields.io/bower/v/dougal.svg?maxAge=2592000)](https://github.com/aol/dougal/releases)
[![npm](https://img.shields.io/npm/v/dougal.svg?maxAge=2592000)](https://www.npmjs.com/package/dougal)
[![Build status](https://img.shields.io/travis/aol/dougal/master.svg?maxAge=2592000)](https://travis-ci.org/aol/dougal)
[![Coveralls branch](https://img.shields.io/coveralls/aol/dougal/master.svg?maxAge=2592000)](https://coveralls.io/github/aol/dougal)

The missing M of MVC for Angular.js applications, based on ActiveRecord and Backbone patterns.

[GitHub](https://github.com/aol/dougal) |
[Documentation](http://aol.github.io/dougal/) |
[Report issue](https://github.com/aol/dougal/issues)

## Getting started

Install Dougal using bower:

    $ bower install dougal --save

Include it in your HTML file:

```html
<script src="bower_components/dougal/dougal.js"></script>
```

Add `dougal` to the list of module dependencies in your Angular application:

```javascript
angular.module('your.app', ['dougal']);
```

Create your own model:

```javascript
angular.module('your.app').factory('Car', function (Model) {
  return Model.extend({
    attributes: {
      name: {
        $validate: function (name) {
          return _.trim(name).length > 0 || 'Name is required';
        }
      },
      id: {}
    },
    baseUrl: '/cars'
  });
});
```

Use the model in your controller:

```javascript
angular.module('your.app').controller('CarController', function (Car) {
  this.car = new Car();
});
```

```html
<div ng-controller="CarController as vm">
  <input ng-model="vm.car.name" />
  <p class="error" ng-show="vm.car.$hasError('name')">
    {{ vm.car.$errors.name }}
  </p>
</div>
```

And voilà!

## Contribute

    $ gulp test
