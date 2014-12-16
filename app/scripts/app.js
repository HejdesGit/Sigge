/**
 * scripts/app.js
 *
 * This is a sample CommonJS module.
 * Take a look at http://browserify.org/ for more info
 */

var Howler = require('howler');
var $ = require('jquery');

'use strict';


module.exports = (function () {
  var animals = [
      "Lejon",
      "Elefant",
      "Delfiner",
      "Anka",
      "Bjorn",
      "Far",
      "Gorilla",
      "Gris",
      "Hast",
      "Hona",
      "Katt",
      "Ko",
      "Kyckling",
      "Pingvin",
      "Sal",
      "Uggla"

    ],
    count = 0,
    previous = undefined,
    running = false;

  var config = {
    urls: 'sound/alla.mp3'
  };

  var sound = new Howl({
    urls: [config.urls],
    sprite: {
      0: [0, 3400],
      1: [3400, 4000],
      2: [7600, 3000],
      3: [10500, 3000],
      4: [13500,  3500],
      5: [17000,  2500],
      6: [19500, 3500],
      7: [23000, 3000 ],
      8: [26500,  3500],
      9: [30000,  4000],
      10: [34500, 4900],
      11: [39000,  4200],
      12: [43500, 4500],
      13: [48000, 4400],
      14: [52000,  4500],
      15: [57000,  5500]
    },
    onend: function () {
      running = false;
      nextAnimal();
    }
  });


  function nextAnimal() {
    count = randomAnimal();
    $(".animal img").attr('src', "images/" + animals[count] + ".jpg");
  }

  function randomAnimal() {
    var randomAnimal;
    randomAnimal = getAnimal();
    while (randomAnimal === previous) {
      randomAnimal = getAnimal();
    }
    previous = randomAnimal;
    return randomAnimal;
  }

  function getAnimal() {
    return Math.floor(Math.random() * animals.length);
  }

  function Init() {
    $(".animal").click(function (event) {
      event.stopPropagation();
      event.preventDefault();
      if (!running) {
        running = true;
        sound.play(count.toString());
      }
    });
    nextAnimal();
  }

  return {
    Init: Init
  };
}());
