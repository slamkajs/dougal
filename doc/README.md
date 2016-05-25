<div id="nav">
### Dougal.js

* [GitHub Repository](https://github.com/aol/dougal)

### Getting started

* [Introduction](#getting-started)

### Model

* [extend](#model-extend)
* [constructor](#model-constructor)
* [$get](#model-get)
* [$pristine](#model-pristine)
* [$set](#model-set)

</div>
<div id="doc">

<h2 id="getting-started">Getting Started</h2>

(soon)

<h2 id="model">Model</h2>

(soon)

<h3 id="model-extend">extend</h3>

Use `extend` to create a new model.

    var Car = Model.extend({
      properties: {
        name: {},
        color: {}
      }
    });

Each property will have a getter and setter automatically created.

<h3 id="model-constructor">constructor</h3>

(soon)

<h3 id="model-get">$get</h3>

Get the current value of an attribute from the model. For example: `car.get('name')`

<h3 id="model-pristine">$pristine</h3>

Boolean property to indicate if a model has changed values.

    var car = new Car({name: 'Super Car!'});
    car.$pristine; // true
    car.name = 'New Name!';
    car.$pristine; // false

<h3 id="model-set">$set</h3>

Set the value of an attribute from the model. For example: `car.set('name', 'Super Car!')`

Changing any value will set `$pristine` to false, even if you revert to its original value.

</div>
