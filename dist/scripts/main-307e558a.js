(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * scripts/main.js
 *
 * This is the starting point for your application.
 * Take a look at http://browserify.org/ for more info
 */

'use strict';

var App = require('./app.js');

App.Init();

},{"./app.js":2}],2:[function(require,module,exports){
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
      1: [3400, 4100],
      2: [7600, 3000],
      3: [10500, 3000],
      4: [13500, 3500],
      5: [17000, 2500],
      6: [19500, 3500],
      7: [23000, 3000],
      8: [26500, 3500],
      9: [30000, 4000],
      10: [34500, 4600],
      11: [39000, 4200],
      12: [43200, 4500],
      13: [48000, 4400],
      14: [52500, 4500],
      15: [57000, 5500]
    },
    onend: function () {
      running = false;
      nextAnimal();
    }
  });


  function nextAnimal() {
    count = randomAnimal();
    //$(".animal img").attr('src', "images/" + animals[count] + ".jpg");
    //$("body").css( "background", "url(images/" + animals[count] + ".jpg) no-repeat center center fixed;");
    var imag = 'images/' + animals[count] + '.jpg';
    $('body').css('background', 'url("' + imag + '") no-repeat center center fixed');
    $('body').css('-webkit-background-size', 'cover');
    $('body').css('-moz-background-size', 'cover');
    $('body').css(' -o-background-size', 'cover');
    $('body').css('background-size', 'cover');
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
    $("html").click(function (event) {
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

},{"howler":3,"jquery":"jquery"}],3:[function(require,module,exports){
/*!
 *  howler.js v1.1.25
 *  howlerjs.com
 *
 *  (c) 2013-2014, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {
  // setup
  var cache = {};

  // setup the audio context
  var ctx = null,
    usingWebAudio = true,
    noAudio = false;
  try {
    if (typeof AudioContext !== 'undefined') {
      ctx = new AudioContext();
    } else if (typeof webkitAudioContext !== 'undefined') {
      ctx = new webkitAudioContext();
    } else {
      usingWebAudio = false;
    }
  } catch(e) {
    usingWebAudio = false;
  }

  if (!usingWebAudio) {
    if (typeof Audio !== 'undefined') {
      try {
        new Audio();
      } catch(e) {
        noAudio = true;
      }
    } else {
      noAudio = true;
    }
  }

  // create a master gain node
  if (usingWebAudio) {
    var masterGain = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }

  // create global controller
  var HowlerGlobal = function(codecs) {
    this._volume = 1;
    this._muted = false;
    this.usingWebAudio = usingWebAudio;
    this.ctx = ctx;
    this.noAudio = noAudio;
    this._howls = [];
    this._codecs = codecs;
    this.iOSAutoEnable = true;
  };
  HowlerGlobal.prototype = {
    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        if (usingWebAudio) {
          masterGain.gain.value = vol;
        }

        // loop through cache and change volume of all nodes that are using HTML5 Audio
        for (var key in self._howls) {
          if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
            // loop through the audio nodes
            for (var i=0; i<self._howls[key]._audioNode.length; i++) {
              self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume;
            }
          }
        }

        return self;
      }

      // return the current global volume
      return (usingWebAudio) ? masterGain.gain.value : self._volume;
    },

    /**
     * Mute all sounds.
     * @return {Howler}
     */
    mute: function() {
      this._setMuted(true);

      return this;
    },

    /**
     * Unmute all sounds.
     * @return {Howler}
     */
    unmute: function() {
      this._setMuted(false);

      return this;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    _setMuted: function(muted) {
      var self = this;

      self._muted = muted;

      if (usingWebAudio) {
        masterGain.gain.value = muted ? 0 : self._volume;
      }

      for (var key in self._howls) {
        if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
          // loop through the audio nodes
          for (var i=0; i<self._howls[key]._audioNode.length; i++) {
            self._howls[key]._audioNode[i].muted = muted;
          }
        }
      }
    },

    /**
     * Check for codec support.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return this._codecs[ext];
    },

    /**
     * iOS will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _enableiOSAudio: function() {
      var self = this;

      // only run this on iOS if audio isn't already eanbled
      if (ctx && (self._iOSEnabled || !/iPhone|iPad|iPod/i.test(navigator.userAgent))) {
        return;
      }

      self._iOSEnabled = false;

      // call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS
      var unlock = function() {
        // create an empty buffer
        var buffer = ctx.createBuffer(1, 1, 22050);
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        // play the empty buffer
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // setup a timeout to check that we are unlocked on the next event loop
        setTimeout(function() {
          if ((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
            // update the unlocked state and prevent this check from happening again
            self._iOSEnabled = true;
            self.iOSAutoEnable = false;

            // remove the touch start listener
            window.removeEventListener('touchstart', unlock, false);
          }
        }, 0);
      };

      // setup a touch start listener to attempt an unlock in
      window.addEventListener('touchstart', unlock, false);

      return self;
    }
  };

  // check for browser codec support
  var audioTest = null;
  var codecs = {};
  if (!noAudio) {
    audioTest = new Audio();
    codecs = {
      mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''),
      opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
      ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
      wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
      aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
      m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')
    };
  }

  // allow access to the global audio controls
  var Howler = new HowlerGlobal(codecs);

  // setup the audio object
  var Howl = function(o) {
    var self = this;

    // setup the defaults
    self._autoplay = o.autoplay || false;
    self._buffer = o.buffer || false;
    self._duration = o.duration || 0;
    self._format = o.format || null;
    self._loop = o.loop || false;
    self._loaded = false;
    self._sprite = o.sprite || {};
    self._src = o.src || '';
    self._pos3d = o.pos3d || [0, 0, -0.5];
    self._volume = o.volume !== undefined ? o.volume : 1;
    self._urls = o.urls || [];
    self._rate = o.rate || 1;

    // allow forcing of a specific panningModel ('equalpower' or 'HRTF'),
    // if none is specified, defaults to 'equalpower' and switches to 'HRTF'
    // if 3d sound is used
    self._model = o.model || null;

    // setup event functions
    self._onload = [o.onload || function() {}];
    self._onloaderror = [o.onloaderror || function() {}];
    self._onend = [o.onend || function() {}];
    self._onpause = [o.onpause || function() {}];
    self._onplay = [o.onplay || function() {}];

    self._onendTimer = [];

    // Web Audio or HTML5 Audio?
    self._webAudio = usingWebAudio && !self._buffer;

    // check if we need to fall back to HTML5 Audio
    self._audioNode = [];
    if (self._webAudio) {
      self._setupAudioNode();
    }

    // automatically try to enable audio on iOS
    if (typeof ctx !== 'undefined' && ctx && Howler.iOSAutoEnable) {
      Howler._enableiOSAudio();
    }

    // add this to an array of Howl's to allow global control
    Howler._howls.push(self);

    // load the track
    self.load();
  };

  // setup all of the methods
  Howl.prototype = {
    /**
     * Load an audio file.
     * @return {Howl}
     */
    load: function() {
      var self = this,
        url = null;

      // if no audio is available, quit immediately
      if (noAudio) {
        self.on('loaderror');
        return;
      }

      // loop through source URLs and pick the first one that is compatible
      for (var i=0; i<self._urls.length; i++) {
        var ext, urlItem;

        if (self._format) {
          // use specified audio format if available
          ext = self._format;
        } else {
          // figure out the filetype (whether an extension or base64 data)
          urlItem = self._urls[i];
          ext = /^data:audio\/([^;,]+);/i.exec(urlItem);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(urlItem.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          } else {
            self.on('loaderror');
            return;
          }
        }

        if (codecs[ext]) {
          url = self._urls[i];
          break;
        }
      }

      if (!url) {
        self.on('loaderror');
        return;
      }

      self._src = url;

      if (self._webAudio) {
        loadBuffer(self, url);
      } else {
        var newNode = new Audio();

        // listen for errors with HTML5 audio (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror)
        newNode.addEventListener('error', function () {
          if (newNode.error && newNode.error.code === 4) {
            HowlerGlobal.noAudio = true;
          }

          self.on('loaderror', {type: newNode.error ? newNode.error.code : 0});
        }, false);

        self._audioNode.push(newNode);

        // setup the new audio node
        newNode.src = url;
        newNode._pos = 0;
        newNode.preload = 'auto';
        newNode.volume = (Howler._muted) ? 0 : self._volume * Howler.volume();

        // setup the event listener to start playing the sound
        // as soon as it has buffered enough
        var listener = function() {
          // round up the duration when using HTML5 Audio to account for the lower precision
          self._duration = Math.ceil(newNode.duration * 10) / 10;

          // setup a sprite if none is defined
          if (Object.getOwnPropertyNames(self._sprite).length === 0) {
            self._sprite = {_default: [0, self._duration * 1000]};
          }

          if (!self._loaded) {
            self._loaded = true;
            self.on('load');
          }

          if (self._autoplay) {
            self.play();
          }

          // clear the event listener
          newNode.removeEventListener('canplaythrough', listener, false);
        };
        newNode.addEventListener('canplaythrough', listener, false);
        newNode.load();
      }

      return self;
    },

    /**
     * Get/set the URLs to be pulled from to play in this source.
     * @param  {Array} urls  Arry of URLs to load from
     * @return {Howl}        Returns self or the current URLs
     */
    urls: function(urls) {
      var self = this;

      if (urls) {
        self.stop();
        self._urls = (typeof urls === 'string') ? [urls] : urls;
        self._loaded = false;
        self.load();

        return self;
      } else {
        return self._urls;
      }
    },

    /**
     * Play a sound from the current time (0 by default).
     * @param  {String}   sprite   (optional) Plays from the specified position in the sound sprite definition.
     * @param  {Function} callback (optional) Returns the unique playback id for this sound instance.
     * @return {Howl}
     */
    play: function(sprite, callback) {
      var self = this;

      // if no sprite was passed but a callback was, update the variables
      if (typeof sprite === 'function') {
        callback = sprite;
      }

      // use the default sprite if none is passed
      if (!sprite || typeof sprite === 'function') {
        sprite = '_default';
      }

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.play(sprite, callback);
        });

        return self;
      }

      // if the sprite doesn't exist, play nothing
      if (!self._sprite[sprite]) {
        if (typeof callback === 'function') callback();
        return self;
      }

      // get the node to playback
      self._inactiveNode(function(node) {
        // persist the sprite being played
        node._sprite = sprite;

        // determine where to start playing from
        var pos = (node._pos > 0) ? node._pos : self._sprite[sprite][0] / 1000;

        // determine how long to play for
        var duration = 0;
        if (self._webAudio) {
          duration = self._sprite[sprite][1] / 1000 - node._pos;
          if (node._pos > 0) {
            pos = self._sprite[sprite][0] / 1000 + pos;
          }
        } else {
          duration = self._sprite[sprite][1] / 1000 - (pos - self._sprite[sprite][0] / 1000);
        }

        // determine if this sound should be looped
        var loop = !!(self._loop || self._sprite[sprite][2]);

        // set timer to fire the 'onend' event
        var soundId = (typeof callback === 'string') ? callback : Math.round(Date.now() * Math.random()) + '',
          timerId;
        (function() {
          var data = {
            id: soundId,
            sprite: sprite,
            loop: loop
          };
          timerId = setTimeout(function() {
            // if looping, restart the track
            if (!self._webAudio && loop) {
              self.stop(data.id).play(sprite, data.id);
            }

            // set web audio node to paused at end
            if (self._webAudio && !loop) {
              self._nodeById(data.id).paused = true;
              self._nodeById(data.id)._pos = 0;

              // clear the end timer
              self._clearEndTimer(data.id);
            }

            // end the track if it is HTML audio and a sprite
            if (!self._webAudio && !loop) {
              self.stop(data.id);
            }

            // fire ended event
            self.on('end', soundId);
          }, duration * 1000);

          // store the reference to the timer
          self._onendTimer.push({timer: timerId, id: data.id});
        })();

        if (self._webAudio) {
          var loopStart = self._sprite[sprite][0] / 1000,
            loopEnd = self._sprite[sprite][1] / 1000;

          // set the play id to this node and load into context
          node.id = soundId;
          node.paused = false;
          refreshBuffer(self, [loop, loopStart, loopEnd], soundId);
          self._playStart = ctx.currentTime;
          node.gain.value = self._volume;

          if (typeof node.bufferSource.start === 'undefined') {
            node.bufferSource.noteGrainOn(0, pos, duration);
          } else {
            node.bufferSource.start(0, pos, duration);
          }
        } else {
          if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
            node.readyState = 4;
            node.id = soundId;
            node.currentTime = pos;
            node.muted = Howler._muted || node.muted;
            node.volume = self._volume * Howler.volume();
            setTimeout(function() { node.play(); }, 0);
          } else {
            self._clearEndTimer(soundId);

            (function(){
              var sound = self,
                playSprite = sprite,
                fn = callback,
                newNode = node;
              var listener = function() {
                sound.play(playSprite, fn);

                // clear the event listener
                newNode.removeEventListener('canplaythrough', listener, false);
              };
              newNode.addEventListener('canplaythrough', listener, false);
            })();

            return self;
          }
        }

        // fire the play event and send the soundId back in the callback
        self.on('play');
        if (typeof callback === 'function') callback(soundId);

        return self;
      });

      return self;
    },

    /**
     * Pause playback and save the current position.
     * @param {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pause(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = self.pos(null, id);

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;
          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else {
          activeNode.pause();
        }
      }

      self.on('pause');

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl}
     */
    stop: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.stop(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = 0;

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;

          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else if (!isNaN(activeNode.duration)) {
          activeNode.pause();
          activeNode.currentTime = 0;
        }
      }

      return self;
    },

    /**
     * Mute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    mute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.mute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = 0;
        } else {
          activeNode.muted = true;
        }
      }

      return self;
    },

    /**
     * Unmute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    unmute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.unmute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = self._volume;
        } else {
          activeNode.muted = false;
        }
      }

      return self;
    },

    /**
     * Get/set volume of this sound.
     * @param  {Float}  vol Volume from 0.0 to 1.0.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}     Returns self or current volume.
     */
    volume: function(vol, id) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        // if the sound hasn't been loaded, add it to the event queue
        if (!self._loaded) {
          self.on('play', function() {
            self.volume(vol, id);
          });

          return self;
        }

        var activeNode = (id) ? self._nodeById(id) : self._activeNode();
        if (activeNode) {
          if (self._webAudio) {
            activeNode.gain.value = vol;
          } else {
            activeNode.volume = vol * Howler.volume();
          }
        }

        return self;
      } else {
        return self._volume;
      }
    },

    /**
     * Get/set whether to loop the sound.
     * @param  {Boolean} loop To loop or not to loop, that is the question.
     * @return {Howl/Boolean}      Returns self or current looping value.
     */
    loop: function(loop) {
      var self = this;

      if (typeof loop === 'boolean') {
        self._loop = loop;

        return self;
      } else {
        return self._loop;
      }
    },

    /**
     * Get/set sound sprite definition.
     * @param  {Object} sprite Example: {spriteName: [offset, duration, loop]}
     *                @param {Integer} offset   Where to begin playback in milliseconds
     *                @param {Integer} duration How long to play in milliseconds
     *                @param {Boolean} loop     (optional) Set true to loop this sprite
     * @return {Howl}        Returns current sprite sheet or self.
     */
    sprite: function(sprite) {
      var self = this;

      if (typeof sprite === 'object') {
        self._sprite = sprite;

        return self;
      } else {
        return self._sprite;
      }
    },

    /**
     * Get/set the position of playback.
     * @param  {Float}  pos The position to move current playback to.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}      Returns self or current playback position.
     */
    pos: function(pos, id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.pos(pos);
        });

        return typeof pos === 'number' ? self : self._pos || 0;
      }

      // make sure we are dealing with a number for pos
      pos = parseFloat(pos);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (pos >= 0) {
          self.pause(id);
          activeNode._pos = pos;
          self.play(activeNode._sprite, id);

          return self;
        } else {
          return self._webAudio ? activeNode._pos + (ctx.currentTime - self._playStart) : activeNode.currentTime;
        }
      } else if (pos >= 0) {
        return self;
      } else {
        // find the first inactive node to return the pos for
        for (var i=0; i<self._audioNode.length; i++) {
          if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
            return (self._webAudio) ? self._audioNode[i]._pos : self._audioNode[i].currentTime;
          }
        }
      }
    },

    /**
     * Get/set the 3D position of the audio source.
     * The most common usage is to set the 'x' position
     * to affect the left/right ear panning. Setting any value higher than
     * 1.0 will begin to decrease the volume of the sound as it moves further away.
     * NOTE: This only works with Web Audio API, HTML5 Audio playback
     * will not be affected.
     * @param  {Float}  x  The x-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  y  The y-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  z  The z-position of the playback from -1000.0 to 1000.0
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl/Array}   Returns self or the current 3D position: [x, y, z]
     */
    pos3d: function(x, y, z, id) {
      var self = this;

      // set a default for the optional 'y' & 'z'
      y = (typeof y === 'undefined' || !y) ? 0 : y;
      z = (typeof z === 'undefined' || !z) ? -0.5 : z;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pos3d(x, y, z, id);
        });

        return self;
      }

      if (x >= 0 || x < 0) {
        if (self._webAudio) {
          var activeNode = (id) ? self._nodeById(id) : self._activeNode();
          if (activeNode) {
            self._pos3d = [x, y, z];
            activeNode.panner.setPosition(x, y, z);
            activeNode.panner.panningModel = self._model || 'HRTF';
          }
        }
      } else {
        return self._pos3d;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes.
     * @param  {Number}   from     The volume to fade from (0.0 to 1.0).
     * @param  {Number}   to       The volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback (optional) Fired when the fade is complete.
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fade: function(from, to, len, callback, id) {
      var self = this,
        diff = Math.abs(from - to),
        dir = from > to ? 'down' : 'up',
        steps = diff / 0.01,
        stepTime = len / steps;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.fade(from, to, len, callback, id);
        });

        return self;
      }

      // set the volume to the start position
      self.volume(from, id);

      for (var i=1; i<=steps; i++) {
        (function() {
          var change = self._volume + (dir === 'up' ? 0.01 : -0.01) * i,
            vol = Math.round(1000 * change) / 1000,
            toVol = to;

          setTimeout(function() {
            self.volume(vol, id);

            if (vol === toVol) {
              if (callback) callback();
            }
          }, stepTime * i);
        })();
      }
    },

    /**
     * [DEPRECATED] Fade in the current sound.
     * @param  {Float}    to      Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len     Time in milliseconds to fade.
     * @param  {Function} callback
     * @return {Howl}
     */
    fadeIn: function(to, len, callback) {
      return this.volume(0).play().fade(0, to, len, callback);
    },

    /**
     * [DEPRECATED] Fade out the current sound and pause when finished.
     * @param  {Float}    to       Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fadeOut: function(to, len, callback, id) {
      var self = this;

      return self.fade(self._volume, to, len, function() {
        if (callback) callback();
        self.pause(id);

        // fire ended event
        self.on('end');
      }, id);
    },

    /**
     * Get an audio node by ID.
     * @return {Howl} Audio node.
     */
    _nodeById: function(id) {
      var self = this,
        node = self._audioNode[0];

      // find the node with this ID
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].id === id) {
          node = self._audioNode[i];
          break;
        }
      }

      return node;
    },

    /**
     * Get the first active audio node.
     * @return {Howl} Audio node.
     */
    _activeNode: function() {
      var self = this,
        node = null;

      // find the first playing node
      for (var i=0; i<self._audioNode.length; i++) {
        if (!self._audioNode[i].paused) {
          node = self._audioNode[i];
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      return node;
    },

    /**
     * Get the first inactive audio node.
     * If there is none, create a new one and add it to the pool.
     * @param  {Function} callback Function to call when the audio node is ready.
     */
    _inactiveNode: function(callback) {
      var self = this,
        node = null;

      // find first inactive node to recycle
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
          // send the node back for use by the new play instance
          callback(self._audioNode[i]);
          node = true;
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      if (node) {
        return;
      }

      // create new node if there are no inactives
      var newNode;
      if (self._webAudio) {
        newNode = self._setupAudioNode();
        callback(newNode);
      } else {
        self.load();
        newNode = self._audioNode[self._audioNode.length - 1];

        // listen for the correct load event and fire the callback
        var listenerEvent = navigator.isCocoonJS ? 'canplaythrough' : 'loadedmetadata';
        var listener = function() {
          newNode.removeEventListener(listenerEvent, listener, false);
          callback(newNode);
        };
        newNode.addEventListener(listenerEvent, listener, false);
      }
    },

    /**
     * If there are more than 5 inactive audio nodes in the pool, clear out the rest.
     */
    _drainPool: function() {
      var self = this,
        inactive = 0,
        i;

      // count the number of inactive nodes
      for (i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused) {
          inactive++;
        }
      }

      // remove excess inactive nodes
      for (i=self._audioNode.length-1; i>=0; i--) {
        if (inactive <= 5) {
          break;
        }

        if (self._audioNode[i].paused) {
          // disconnect the audio source if using Web Audio
          if (self._webAudio) {
            self._audioNode[i].disconnect(0);
          }

          inactive--;
          self._audioNode.splice(i, 1);
        }
      }
    },

    /**
     * Clear 'onend' timeout before it ends.
     * @param  {String} soundId  The play instance ID.
     */
    _clearEndTimer: function(soundId) {
      var self = this,
        index = 0;

      // loop through the timers to find the one associated with this sound
      for (var i=0; i<self._onendTimer.length; i++) {
        if (self._onendTimer[i].id === soundId) {
          index = i;
          break;
        }
      }

      var timer = self._onendTimer[index];
      if (timer) {
        clearTimeout(timer.timer);
        self._onendTimer.splice(index, 1);
      }
    },

    /**
     * Setup the gain node and panner for a Web Audio instance.
     * @return {Object} The new audio node.
     */
    _setupAudioNode: function() {
      var self = this,
        node = self._audioNode,
        index = self._audioNode.length;

      // create gain node
      node[index] = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
      node[index].gain.value = self._volume;
      node[index].paused = true;
      node[index]._pos = 0;
      node[index].readyState = 4;
      node[index].connect(masterGain);

      // create the panner
      node[index].panner = ctx.createPanner();
      node[index].panner.panningModel = self._model || 'equalpower';
      node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]);
      node[index].panner.connect(node[index]);

      return node[index];
    },

    /**
     * Call/set custom events.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Function to call.
     * @return {Howl}
     */
    on: function(event, fn) {
      var self = this,
        events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(fn);
      } else {
        for (var i=0; i<events.length; i++) {
          if (fn) {
            events[i].call(self, fn);
          } else {
            events[i].call(self);
          }
        }
      }

      return self;
    },

    /**
     * Remove a custom event.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Listener to remove.
     * @return {Howl}
     */
    off: function(event, fn) {
      var self = this,
        events = self['_on' + event],
        fnString = fn ? fn.toString() : null;

      if (fnString) {
        // loop through functions in the event for comparison
        for (var i=0; i<events.length; i++) {
          if (fnString === events[i].toString()) {
            events.splice(i, 1);
            break;
          }
        }
      } else {
        self['_on' + event] = [];
      }

      return self;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all play instances attached to this sound.
     */
    unload: function() {
      var self = this;

      // stop playing any active nodes
      var nodes = self._audioNode;
      for (var i=0; i<self._audioNode.length; i++) {
        // stop the sound if it is currently playing
        if (!nodes[i].paused) {
          self.stop(nodes[i].id);
          self.on('end', nodes[i].id);
        }

        if (!self._webAudio) {
          // remove the source if using HTML5 Audio
          nodes[i].src = '';
        } else {
          // disconnect the output from the master gain
          nodes[i].disconnect(0);
        }
      }

      // make sure all timeouts are cleared
      for (i=0; i<self._onendTimer.length; i++) {
        clearTimeout(self._onendTimer[i].timer);
      }

      // remove the reference in the global Howler object
      var index = Howler._howls.indexOf(self);
      if (index !== null && index >= 0) {
        Howler._howls.splice(index, 1);
      }

      // delete this sound from the cache
      delete cache[self._src];
      self = null;
    }

  };

  // only define these functions when using WebAudio
  if (usingWebAudio) {

    /**
     * Buffer a sound from URL (or from cache) and decode to audio source (Web Audio API).
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var loadBuffer = function(obj, url) {
      // check if the buffer has already been cached
      if (url in cache) {
        // set the duration from the cache
        obj._duration = cache[url].duration;

        // load the sound into this object
        loadSound(obj);
        return;
      }
      
      if (/^data:[^;]+;base64,/.test(url)) {
        // Decode base64 data-URIs because some browsers cannot load data-URIs with XMLHttpRequest.
        var data = atob(url.split(',')[1]);
        var dataView = new Uint8Array(data.length);
        for (var i=0; i<data.length; ++i) {
          dataView[i] = data.charCodeAt(i);
        }
        
        decodeAudioData(dataView.buffer, obj, url);
      } else {
        // load the buffer from the URL
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          decodeAudioData(xhr.response, obj, url);
        };
        xhr.onerror = function() {
          // if there is an error, switch the sound to HTML Audio
          if (obj._webAudio) {
            obj._buffer = true;
            obj._webAudio = false;
            obj._audioNode = [];
            delete obj._gainNode;
            delete cache[url];
            obj.load();
          }
        };
        try {
          xhr.send();
        } catch (e) {
          xhr.onerror();
        }
      }
    };

    /**
     * Decode audio data from an array buffer.
     * @param  {ArrayBuffer} arraybuffer The audio data.
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var decodeAudioData = function(arraybuffer, obj, url) {
      // decode the buffer into an audio source
      ctx.decodeAudioData(
        arraybuffer,
        function(buffer) {
          if (buffer) {
            cache[url] = buffer;
            loadSound(obj, buffer);
          }
        },
        function(err) {
          obj.on('loaderror');
        }
      );
    };

    /**
     * Finishes loading the Web Audio API sound and fires the loaded event
     * @param  {Object}  obj    The Howl object for the sound to load.
     * @param  {Objecct} buffer The decoded buffer sound source.
     */
    var loadSound = function(obj, buffer) {
      // set the duration
      obj._duration = (buffer) ? buffer.duration : obj._duration;

      // setup a sprite if none is defined
      if (Object.getOwnPropertyNames(obj._sprite).length === 0) {
        obj._sprite = {_default: [0, obj._duration * 1000]};
      }

      // fire the loaded event
      if (!obj._loaded) {
        obj._loaded = true;
        obj.on('load');
      }

      if (obj._autoplay) {
        obj.play();
      }
    };

    /**
     * Load the sound back into the buffer source.
     * @param  {Object} obj   The sound to load.
     * @param  {Array}  loop  Loop boolean, pos, and duration.
     * @param  {String} id    (optional) The play instance ID.
     */
    var refreshBuffer = function(obj, loop, id) {
      // determine which node to connect to
      var node = obj._nodeById(id);

      // setup the buffer source for playback
      node.bufferSource = ctx.createBufferSource();
      node.bufferSource.buffer = cache[obj._src];
      node.bufferSource.connect(node.panner);
      node.bufferSource.loop = loop[0];
      if (loop[0]) {
        node.bufferSource.loopStart = loop[1];
        node.bufferSource.loopEnd = loop[1] + loop[2];
      }
      node.bufferSource.playbackRate.value = obj._rate;
    };

  }

  /**
   * Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
   */
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  }

  /**
   * Add support for CommonJS libraries such as browserify.
   */
  if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // define globally in case AMD is not available or available but not used

  if (typeof window !== 'undefined') {
    window.Howler = Howler;
    window.Howl = Howl;
  }

})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2FwcC9zY3JpcHRzL21haW4uanMiLCIvaG9tZS9qb2hhbi9Qcm9qZWN0cy9TaWdnZS9hcHAvc2NyaXB0cy9hcHAuanMiLCIvaG9tZS9qb2hhbi9Qcm9qZWN0cy9TaWdnZS9ub2RlX21vZHVsZXMvaG93bGVyL2hvd2xlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBzY3JpcHRzL21haW4uanNcbiAqXG4gKiBUaGlzIGlzIHRoZSBzdGFydGluZyBwb2ludCBmb3IgeW91ciBhcHBsaWNhdGlvbi5cbiAqIFRha2UgYSBsb29rIGF0IGh0dHA6Ly9icm93c2VyaWZ5Lm9yZy8gZm9yIG1vcmUgaW5mb1xuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwLmpzJyk7XG5cbkFwcC5Jbml0KCk7XG4iLCIvKipcbiAqIHNjcmlwdHMvYXBwLmpzXG4gKlxuICogVGhpcyBpcyBhIHNhbXBsZSBDb21tb25KUyBtb2R1bGUuXG4gKiBUYWtlIGEgbG9vayBhdCBodHRwOi8vYnJvd3NlcmlmeS5vcmcvIGZvciBtb3JlIGluZm9cbiAqL1xuXG52YXIgSG93bGVyID0gcmVxdWlyZSgnaG93bGVyJyk7XG52YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG4ndXNlIHN0cmljdCc7XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgYW5pbWFscyA9IFtcbiAgICAgIFwiTGVqb25cIixcbiAgICAgIFwiRWxlZmFudFwiLFxuICAgICAgXCJEZWxmaW5lclwiLFxuICAgICAgXCJBbmthXCIsXG4gICAgICBcIkJqb3JuXCIsXG4gICAgICBcIkZhclwiLFxuICAgICAgXCJHb3JpbGxhXCIsXG4gICAgICBcIkdyaXNcIixcbiAgICAgIFwiSGFzdFwiLFxuICAgICAgXCJIb25hXCIsXG4gICAgICBcIkthdHRcIixcbiAgICAgIFwiS29cIixcbiAgICAgIFwiS3lja2xpbmdcIixcbiAgICAgIFwiUGluZ3ZpblwiLFxuICAgICAgXCJTYWxcIixcbiAgICAgIFwiVWdnbGFcIlxuXG4gICAgXSxcbiAgICBjb3VudCA9IDAsXG4gICAgcHJldmlvdXMgPSB1bmRlZmluZWQsXG4gICAgcnVubmluZyA9IGZhbHNlO1xuXG4gIHZhciBjb25maWcgPSB7XG4gICAgdXJsczogJ3NvdW5kL2FsbGEubXAzJ1xuICB9O1xuXG4gIHZhciBzb3VuZCA9IG5ldyBIb3dsKHtcbiAgICB1cmxzOiBbY29uZmlnLnVybHNdLFxuICAgIHNwcml0ZToge1xuICAgICAgMDogWzAsIDM0MDBdLFxuICAgICAgMTogWzM0MDAsIDQxMDBdLFxuICAgICAgMjogWzc2MDAsIDMwMDBdLFxuICAgICAgMzogWzEwNTAwLCAzMDAwXSxcbiAgICAgIDQ6IFsxMzUwMCwgMzUwMF0sXG4gICAgICA1OiBbMTcwMDAsIDI1MDBdLFxuICAgICAgNjogWzE5NTAwLCAzNTAwXSxcbiAgICAgIDc6IFsyMzAwMCwgMzAwMF0sXG4gICAgICA4OiBbMjY1MDAsIDM1MDBdLFxuICAgICAgOTogWzMwMDAwLCA0MDAwXSxcbiAgICAgIDEwOiBbMzQ1MDAsIDQ2MDBdLFxuICAgICAgMTE6IFszOTAwMCwgNDIwMF0sXG4gICAgICAxMjogWzQzMjAwLCA0NTAwXSxcbiAgICAgIDEzOiBbNDgwMDAsIDQ0MDBdLFxuICAgICAgMTQ6IFs1MjUwMCwgNDUwMF0sXG4gICAgICAxNTogWzU3MDAwLCA1NTAwXVxuICAgIH0sXG4gICAgb25lbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIG5leHRBbmltYWwoKTtcbiAgICB9XG4gIH0pO1xuXG5cbiAgZnVuY3Rpb24gbmV4dEFuaW1hbCgpIHtcbiAgICBjb3VudCA9IHJhbmRvbUFuaW1hbCgpO1xuICAgIC8vJChcIi5hbmltYWwgaW1nXCIpLmF0dHIoJ3NyYycsIFwiaW1hZ2VzL1wiICsgYW5pbWFsc1tjb3VudF0gKyBcIi5qcGdcIik7XG4gICAgLy8kKFwiYm9keVwiKS5jc3MoIFwiYmFja2dyb3VuZFwiLCBcInVybChpbWFnZXMvXCIgKyBhbmltYWxzW2NvdW50XSArIFwiLmpwZykgbm8tcmVwZWF0IGNlbnRlciBjZW50ZXIgZml4ZWQ7XCIpO1xuICAgIHZhciBpbWFnID0gJ2ltYWdlcy8nICsgYW5pbWFsc1tjb3VudF0gKyAnLmpwZyc7XG4gICAgJCgnYm9keScpLmNzcygnYmFja2dyb3VuZCcsICd1cmwoXCInICsgaW1hZyArICdcIikgbm8tcmVwZWF0IGNlbnRlciBjZW50ZXIgZml4ZWQnKTtcbiAgICAkKCdib2R5JykuY3NzKCctd2Via2l0LWJhY2tncm91bmQtc2l6ZScsICdjb3ZlcicpO1xuICAgICQoJ2JvZHknKS5jc3MoJy1tb3otYmFja2dyb3VuZC1zaXplJywgJ2NvdmVyJyk7XG4gICAgJCgnYm9keScpLmNzcygnIC1vLWJhY2tncm91bmQtc2l6ZScsICdjb3ZlcicpO1xuICAgICQoJ2JvZHknKS5jc3MoJ2JhY2tncm91bmQtc2l6ZScsICdjb3ZlcicpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmFuZG9tQW5pbWFsKCkge1xuICAgIHZhciByYW5kb21BbmltYWw7XG4gICAgcmFuZG9tQW5pbWFsID0gZ2V0QW5pbWFsKCk7XG4gICAgd2hpbGUgKHJhbmRvbUFuaW1hbCA9PT0gcHJldmlvdXMpIHtcbiAgICAgIHJhbmRvbUFuaW1hbCA9IGdldEFuaW1hbCgpO1xuICAgIH1cbiAgICBwcmV2aW91cyA9IHJhbmRvbUFuaW1hbDtcbiAgICByZXR1cm4gcmFuZG9tQW5pbWFsO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QW5pbWFsKCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhbmltYWxzLmxlbmd0aCk7XG4gIH1cblxuICBmdW5jdGlvbiBJbml0KCkge1xuICAgICQoXCJodG1sXCIpLmNsaWNrKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKCFydW5uaW5nKSB7XG4gICAgICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBzb3VuZC5wbGF5KGNvdW50LnRvU3RyaW5nKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIG5leHRBbmltYWwoKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgSW5pdDogSW5pdFxuICB9O1xufSgpKTtcbiIsIi8qIVxuICogIGhvd2xlci5qcyB2MS4xLjI1XG4gKiAgaG93bGVyanMuY29tXG4gKlxuICogIChjKSAyMDEzLTIwMTQsIEphbWVzIFNpbXBzb24gb2YgR29sZEZpcmUgU3R1ZGlvc1xuICogIGdvbGRmaXJlc3R1ZGlvcy5jb21cbiAqXG4gKiAgTUlUIExpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8vIHNldHVwXG4gIHZhciBjYWNoZSA9IHt9O1xuXG4gIC8vIHNldHVwIHRoZSBhdWRpbyBjb250ZXh0XG4gIHZhciBjdHggPSBudWxsLFxuICAgIHVzaW5nV2ViQXVkaW8gPSB0cnVlLFxuICAgIG5vQXVkaW8gPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIEF1ZGlvQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB3ZWJraXRBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjdHggPSBuZXcgd2Via2l0QXVkaW9Db250ZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVzaW5nV2ViQXVkaW8gPSBmYWxzZTtcbiAgICB9XG4gIH0gY2F0Y2goZSkge1xuICAgIHVzaW5nV2ViQXVkaW8gPSBmYWxzZTtcbiAgfVxuXG4gIGlmICghdXNpbmdXZWJBdWRpbykge1xuICAgIGlmICh0eXBlb2YgQXVkaW8gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQXVkaW8oKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBub0F1ZGlvID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbm9BdWRpbyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gY3JlYXRlIGEgbWFzdGVyIGdhaW4gbm9kZVxuICBpZiAodXNpbmdXZWJBdWRpbykge1xuICAgIHZhciBtYXN0ZXJHYWluID0gKHR5cGVvZiBjdHguY3JlYXRlR2FpbiA9PT0gJ3VuZGVmaW5lZCcpID8gY3R4LmNyZWF0ZUdhaW5Ob2RlKCkgOiBjdHguY3JlYXRlR2FpbigpO1xuICAgIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IDE7XG4gICAgbWFzdGVyR2Fpbi5jb25uZWN0KGN0eC5kZXN0aW5hdGlvbik7XG4gIH1cblxuICAvLyBjcmVhdGUgZ2xvYmFsIGNvbnRyb2xsZXJcbiAgdmFyIEhvd2xlckdsb2JhbCA9IGZ1bmN0aW9uKGNvZGVjcykge1xuICAgIHRoaXMuX3ZvbHVtZSA9IDE7XG4gICAgdGhpcy5fbXV0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnVzaW5nV2ViQXVkaW8gPSB1c2luZ1dlYkF1ZGlvO1xuICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgIHRoaXMubm9BdWRpbyA9IG5vQXVkaW87XG4gICAgdGhpcy5faG93bHMgPSBbXTtcbiAgICB0aGlzLl9jb2RlY3MgPSBjb2RlY3M7XG4gICAgdGhpcy5pT1NBdXRvRW5hYmxlID0gdHJ1ZTtcbiAgfTtcbiAgSG93bGVyR2xvYmFsLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBHZXQvc2V0IHRoZSBnbG9iYWwgdm9sdW1lIGZvciBhbGwgc291bmRzLlxuICAgICAqIEBwYXJhbSAge0Zsb2F0fSB2b2wgVm9sdW1lIGZyb20gMC4wIHRvIDEuMC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXIvRmxvYXR9ICAgICBSZXR1cm5zIHNlbGYgb3IgY3VycmVudCB2b2x1bWUuXG4gICAgICovXG4gICAgdm9sdW1lOiBmdW5jdGlvbih2b2wpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gbWFrZSBzdXJlIHZvbHVtZSBpcyBhIG51bWJlclxuICAgICAgdm9sID0gcGFyc2VGbG9hdCh2b2wpO1xuXG4gICAgICBpZiAodm9sID49IDAgJiYgdm9sIDw9IDEpIHtcbiAgICAgICAgc2VsZi5fdm9sdW1lID0gdm9sO1xuXG4gICAgICAgIGlmICh1c2luZ1dlYkF1ZGlvKSB7XG4gICAgICAgICAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gdm9sO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGNhY2hlIGFuZCBjaGFuZ2Ugdm9sdW1lIG9mIGFsbCBub2RlcyB0aGF0IGFyZSB1c2luZyBIVE1MNSBBdWRpb1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc2VsZi5faG93bHMpIHtcbiAgICAgICAgICBpZiAoc2VsZi5faG93bHMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBzZWxmLl9ob3dsc1trZXldLl93ZWJBdWRpbyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgYXVkaW8gbm9kZXNcbiAgICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9ob3dsc1trZXldLl9hdWRpb05vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgc2VsZi5faG93bHNba2V5XS5fYXVkaW9Ob2RlW2ldLnZvbHVtZSA9IHNlbGYuX2hvd2xzW2tleV0uX3ZvbHVtZSAqIHNlbGYuX3ZvbHVtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgLy8gcmV0dXJuIHRoZSBjdXJyZW50IGdsb2JhbCB2b2x1bWVcbiAgICAgIHJldHVybiAodXNpbmdXZWJBdWRpbykgPyBtYXN0ZXJHYWluLmdhaW4udmFsdWUgOiBzZWxmLl92b2x1bWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE11dGUgYWxsIHNvdW5kcy5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgbXV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9zZXRNdXRlZCh0cnVlKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVubXV0ZSBhbGwgc291bmRzLlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICB1bm11dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fc2V0TXV0ZWQoZmFsc2UpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIG11dGluZyBhbmQgdW5tdXRpbmcgZ2xvYmFsbHkuXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gbXV0ZWQgSXMgbXV0ZWQgb3Igbm90LlxuICAgICAqL1xuICAgIF9zZXRNdXRlZDogZnVuY3Rpb24obXV0ZWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgc2VsZi5fbXV0ZWQgPSBtdXRlZDtcblxuICAgICAgaWYgKHVzaW5nV2ViQXVkaW8pIHtcbiAgICAgICAgbWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gbXV0ZWQgPyAwIDogc2VsZi5fdm9sdW1lO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gc2VsZi5faG93bHMpIHtcbiAgICAgICAgaWYgKHNlbGYuX2hvd2xzLmhhc093blByb3BlcnR5KGtleSkgJiYgc2VsZi5faG93bHNba2V5XS5fd2ViQXVkaW8gPT09IGZhbHNlKSB7XG4gICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIHRoZSBhdWRpbyBub2Rlc1xuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9ob3dsc1trZXldLl9hdWRpb05vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNlbGYuX2hvd2xzW2tleV0uX2F1ZGlvTm9kZVtpXS5tdXRlZCA9IG11dGVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgY29kZWMgc3VwcG9ydC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGV4dCBBdWRpbyBmaWxlIGV4dGVudGlvbi5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGNvZGVjczogZnVuY3Rpb24oZXh0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29kZWNzW2V4dF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlPUyB3aWxsIG9ubHkgYWxsb3cgYXVkaW8gdG8gYmUgcGxheWVkIGFmdGVyIGEgdXNlciBpbnRlcmFjdGlvbi5cbiAgICAgKiBBdHRlbXB0IHRvIGF1dG9tYXRpY2FsbHkgdW5sb2NrIGF1ZGlvIG9uIHRoZSBmaXJzdCB1c2VyIGludGVyYWN0aW9uLlxuICAgICAqIENvbmNlcHQgZnJvbTogaHR0cDovL3BhdWxiYWthdXMuY29tL3R1dG9yaWFscy9odG1sNS93ZWItYXVkaW8tb24taW9zL1xuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfZW5hYmxlaU9TQXVkaW86IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBvbmx5IHJ1biB0aGlzIG9uIGlPUyBpZiBhdWRpbyBpc24ndCBhbHJlYWR5IGVhbmJsZWRcbiAgICAgIGlmIChjdHggJiYgKHNlbGYuX2lPU0VuYWJsZWQgfHwgIS9pUGhvbmV8aVBhZHxpUG9kL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9pT1NFbmFibGVkID0gZmFsc2U7XG5cbiAgICAgIC8vIGNhbGwgdGhpcyBtZXRob2Qgb24gdG91Y2ggc3RhcnQgdG8gY3JlYXRlIGFuZCBwbGF5IGEgYnVmZmVyLFxuICAgICAgLy8gdGhlbiBjaGVjayBpZiB0aGUgYXVkaW8gYWN0dWFsbHkgcGxheWVkIHRvIGRldGVybWluZSBpZlxuICAgICAgLy8gYXVkaW8gaGFzIG5vdyBiZWVuIHVubG9ja2VkIG9uIGlPU1xuICAgICAgdmFyIHVubG9jayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBjcmVhdGUgYW4gZW1wdHkgYnVmZmVyXG4gICAgICAgIHZhciBidWZmZXIgPSBjdHguY3JlYXRlQnVmZmVyKDEsIDEsIDIyMDUwKTtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgc291cmNlLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoY3R4LmRlc3RpbmF0aW9uKTtcblxuICAgICAgICAvLyBwbGF5IHRoZSBlbXB0eSBidWZmZXJcbiAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2Uuc3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgc291cmNlLm5vdGVPbigwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzb3VyY2Uuc3RhcnQoMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZXR1cCBhIHRpbWVvdXQgdG8gY2hlY2sgdGhhdCB3ZSBhcmUgdW5sb2NrZWQgb24gdGhlIG5leHQgZXZlbnQgbG9vcFxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICgoc291cmNlLnBsYXliYWNrU3RhdGUgPT09IHNvdXJjZS5QTEFZSU5HX1NUQVRFIHx8IHNvdXJjZS5wbGF5YmFja1N0YXRlID09PSBzb3VyY2UuRklOSVNIRURfU1RBVEUpKSB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHVubG9ja2VkIHN0YXRlIGFuZCBwcmV2ZW50IHRoaXMgY2hlY2sgZnJvbSBoYXBwZW5pbmcgYWdhaW5cbiAgICAgICAgICAgIHNlbGYuX2lPU0VuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5pT1NBdXRvRW5hYmxlID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgdG91Y2ggc3RhcnQgbGlzdGVuZXJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdW5sb2NrLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAwKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIHNldHVwIGEgdG91Y2ggc3RhcnQgbGlzdGVuZXIgdG8gYXR0ZW1wdCBhbiB1bmxvY2sgaW5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdW5sb2NrLCBmYWxzZSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cbiAgfTtcblxuICAvLyBjaGVjayBmb3IgYnJvd3NlciBjb2RlYyBzdXBwb3J0XG4gIHZhciBhdWRpb1Rlc3QgPSBudWxsO1xuICB2YXIgY29kZWNzID0ge307XG4gIGlmICghbm9BdWRpbykge1xuICAgIGF1ZGlvVGVzdCA9IG5ldyBBdWRpbygpO1xuICAgIGNvZGVjcyA9IHtcbiAgICAgIG1wMzogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL21wZWc7JykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgIG9wdXM6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9vZ2c7IGNvZGVjcz1cIm9wdXNcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICBvZ2c6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9vZ2c7IGNvZGVjcz1cInZvcmJpc1wiJykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgIHdhdjogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3dhdjsgY29kZWNzPVwiMVwiJykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgIGFhYzogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL2FhYzsnKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgbTRhOiAhIShhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3gtbTRhOycpIHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vbTRhOycpIHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vYWFjOycpKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgbXA0OiAhIShhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3gtbXA0OycpIHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vbXA0OycpIHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vYWFjOycpKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgd2ViYTogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3dlYm07IGNvZGVjcz1cInZvcmJpc1wiJykucmVwbGFjZSgvXm5vJC8sICcnKVxuICAgIH07XG4gIH1cblxuICAvLyBhbGxvdyBhY2Nlc3MgdG8gdGhlIGdsb2JhbCBhdWRpbyBjb250cm9sc1xuICB2YXIgSG93bGVyID0gbmV3IEhvd2xlckdsb2JhbChjb2RlY3MpO1xuXG4gIC8vIHNldHVwIHRoZSBhdWRpbyBvYmplY3RcbiAgdmFyIEhvd2wgPSBmdW5jdGlvbihvKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gc2V0dXAgdGhlIGRlZmF1bHRzXG4gICAgc2VsZi5fYXV0b3BsYXkgPSBvLmF1dG9wbGF5IHx8IGZhbHNlO1xuICAgIHNlbGYuX2J1ZmZlciA9IG8uYnVmZmVyIHx8IGZhbHNlO1xuICAgIHNlbGYuX2R1cmF0aW9uID0gby5kdXJhdGlvbiB8fCAwO1xuICAgIHNlbGYuX2Zvcm1hdCA9IG8uZm9ybWF0IHx8IG51bGw7XG4gICAgc2VsZi5fbG9vcCA9IG8ubG9vcCB8fCBmYWxzZTtcbiAgICBzZWxmLl9sb2FkZWQgPSBmYWxzZTtcbiAgICBzZWxmLl9zcHJpdGUgPSBvLnNwcml0ZSB8fCB7fTtcbiAgICBzZWxmLl9zcmMgPSBvLnNyYyB8fCAnJztcbiAgICBzZWxmLl9wb3MzZCA9IG8ucG9zM2QgfHwgWzAsIDAsIC0wLjVdO1xuICAgIHNlbGYuX3ZvbHVtZSA9IG8udm9sdW1lICE9PSB1bmRlZmluZWQgPyBvLnZvbHVtZSA6IDE7XG4gICAgc2VsZi5fdXJscyA9IG8udXJscyB8fCBbXTtcbiAgICBzZWxmLl9yYXRlID0gby5yYXRlIHx8IDE7XG5cbiAgICAvLyBhbGxvdyBmb3JjaW5nIG9mIGEgc3BlY2lmaWMgcGFubmluZ01vZGVsICgnZXF1YWxwb3dlcicgb3IgJ0hSVEYnKSxcbiAgICAvLyBpZiBub25lIGlzIHNwZWNpZmllZCwgZGVmYXVsdHMgdG8gJ2VxdWFscG93ZXInIGFuZCBzd2l0Y2hlcyB0byAnSFJURidcbiAgICAvLyBpZiAzZCBzb3VuZCBpcyB1c2VkXG4gICAgc2VsZi5fbW9kZWwgPSBvLm1vZGVsIHx8IG51bGw7XG5cbiAgICAvLyBzZXR1cCBldmVudCBmdW5jdGlvbnNcbiAgICBzZWxmLl9vbmxvYWQgPSBbby5vbmxvYWQgfHwgZnVuY3Rpb24oKSB7fV07XG4gICAgc2VsZi5fb25sb2FkZXJyb3IgPSBbby5vbmxvYWRlcnJvciB8fCBmdW5jdGlvbigpIHt9XTtcbiAgICBzZWxmLl9vbmVuZCA9IFtvLm9uZW5kIHx8IGZ1bmN0aW9uKCkge31dO1xuICAgIHNlbGYuX29ucGF1c2UgPSBbby5vbnBhdXNlIHx8IGZ1bmN0aW9uKCkge31dO1xuICAgIHNlbGYuX29ucGxheSA9IFtvLm9ucGxheSB8fCBmdW5jdGlvbigpIHt9XTtcblxuICAgIHNlbGYuX29uZW5kVGltZXIgPSBbXTtcblxuICAgIC8vIFdlYiBBdWRpbyBvciBIVE1MNSBBdWRpbz9cbiAgICBzZWxmLl93ZWJBdWRpbyA9IHVzaW5nV2ViQXVkaW8gJiYgIXNlbGYuX2J1ZmZlcjtcblxuICAgIC8vIGNoZWNrIGlmIHdlIG5lZWQgdG8gZmFsbCBiYWNrIHRvIEhUTUw1IEF1ZGlvXG4gICAgc2VsZi5fYXVkaW9Ob2RlID0gW107XG4gICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICBzZWxmLl9zZXR1cEF1ZGlvTm9kZSgpO1xuICAgIH1cblxuICAgIC8vIGF1dG9tYXRpY2FsbHkgdHJ5IHRvIGVuYWJsZSBhdWRpbyBvbiBpT1NcbiAgICBpZiAodHlwZW9mIGN0eCAhPT0gJ3VuZGVmaW5lZCcgJiYgY3R4ICYmIEhvd2xlci5pT1NBdXRvRW5hYmxlKSB7XG4gICAgICBIb3dsZXIuX2VuYWJsZWlPU0F1ZGlvKCk7XG4gICAgfVxuXG4gICAgLy8gYWRkIHRoaXMgdG8gYW4gYXJyYXkgb2YgSG93bCdzIHRvIGFsbG93IGdsb2JhbCBjb250cm9sXG4gICAgSG93bGVyLl9ob3dscy5wdXNoKHNlbGYpO1xuXG4gICAgLy8gbG9hZCB0aGUgdHJhY2tcbiAgICBzZWxmLmxvYWQoKTtcbiAgfTtcblxuICAvLyBzZXR1cCBhbGwgb2YgdGhlIG1ldGhvZHNcbiAgSG93bC5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogTG9hZCBhbiBhdWRpbyBmaWxlLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHVybCA9IG51bGw7XG5cbiAgICAgIC8vIGlmIG5vIGF1ZGlvIGlzIGF2YWlsYWJsZSwgcXVpdCBpbW1lZGlhdGVseVxuICAgICAgaWYgKG5vQXVkaW8pIHtcbiAgICAgICAgc2VsZi5vbignbG9hZGVycm9yJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gbG9vcCB0aHJvdWdoIHNvdXJjZSBVUkxzIGFuZCBwaWNrIHRoZSBmaXJzdCBvbmUgdGhhdCBpcyBjb21wYXRpYmxlXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fdXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZXh0LCB1cmxJdGVtO1xuXG4gICAgICAgIGlmIChzZWxmLl9mb3JtYXQpIHtcbiAgICAgICAgICAvLyB1c2Ugc3BlY2lmaWVkIGF1ZGlvIGZvcm1hdCBpZiBhdmFpbGFibGVcbiAgICAgICAgICBleHQgPSBzZWxmLl9mb3JtYXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZmlndXJlIG91dCB0aGUgZmlsZXR5cGUgKHdoZXRoZXIgYW4gZXh0ZW5zaW9uIG9yIGJhc2U2NCBkYXRhKVxuICAgICAgICAgIHVybEl0ZW0gPSBzZWxmLl91cmxzW2ldO1xuICAgICAgICAgIGV4dCA9IC9eZGF0YTphdWRpb1xcLyhbXjssXSspOy9pLmV4ZWModXJsSXRlbSk7XG4gICAgICAgICAgaWYgKCFleHQpIHtcbiAgICAgICAgICAgIGV4dCA9IC9cXC4oW14uXSspJC8uZXhlYyh1cmxJdGVtLnNwbGl0KCc/JywgMSlbMF0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChleHQpIHtcbiAgICAgICAgICAgIGV4dCA9IGV4dFsxXS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLm9uKCdsb2FkZXJyb3InKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29kZWNzW2V4dF0pIHtcbiAgICAgICAgICB1cmwgPSBzZWxmLl91cmxzW2ldO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdXJsKSB7XG4gICAgICAgIHNlbGYub24oJ2xvYWRlcnJvcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3NyYyA9IHVybDtcblxuICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgIGxvYWRCdWZmZXIoc2VsZiwgdXJsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBuZXdOb2RlID0gbmV3IEF1ZGlvKCk7XG5cbiAgICAgICAgLy8gbGlzdGVuIGZvciBlcnJvcnMgd2l0aCBIVE1MNSBhdWRpbyAoaHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy1hdXRob3Itdmlldy9zcGVjLmh0bWwjbWVkaWFlcnJvcilcbiAgICAgICAgbmV3Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAobmV3Tm9kZS5lcnJvciAmJiBuZXdOb2RlLmVycm9yLmNvZGUgPT09IDQpIHtcbiAgICAgICAgICAgIEhvd2xlckdsb2JhbC5ub0F1ZGlvID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLm9uKCdsb2FkZXJyb3InLCB7dHlwZTogbmV3Tm9kZS5lcnJvciA/IG5ld05vZGUuZXJyb3IuY29kZSA6IDB9KTtcbiAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgIHNlbGYuX2F1ZGlvTm9kZS5wdXNoKG5ld05vZGUpO1xuXG4gICAgICAgIC8vIHNldHVwIHRoZSBuZXcgYXVkaW8gbm9kZVxuICAgICAgICBuZXdOb2RlLnNyYyA9IHVybDtcbiAgICAgICAgbmV3Tm9kZS5fcG9zID0gMDtcbiAgICAgICAgbmV3Tm9kZS5wcmVsb2FkID0gJ2F1dG8nO1xuICAgICAgICBuZXdOb2RlLnZvbHVtZSA9IChIb3dsZXIuX211dGVkKSA/IDAgOiBzZWxmLl92b2x1bWUgKiBIb3dsZXIudm9sdW1lKCk7XG5cbiAgICAgICAgLy8gc2V0dXAgdGhlIGV2ZW50IGxpc3RlbmVyIHRvIHN0YXJ0IHBsYXlpbmcgdGhlIHNvdW5kXG4gICAgICAgIC8vIGFzIHNvb24gYXMgaXQgaGFzIGJ1ZmZlcmVkIGVub3VnaFxuICAgICAgICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyByb3VuZCB1cCB0aGUgZHVyYXRpb24gd2hlbiB1c2luZyBIVE1MNSBBdWRpbyB0byBhY2NvdW50IGZvciB0aGUgbG93ZXIgcHJlY2lzaW9uXG4gICAgICAgICAgc2VsZi5fZHVyYXRpb24gPSBNYXRoLmNlaWwobmV3Tm9kZS5kdXJhdGlvbiAqIDEwKSAvIDEwO1xuXG4gICAgICAgICAgLy8gc2V0dXAgYSBzcHJpdGUgaWYgbm9uZSBpcyBkZWZpbmVkXG4gICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHNlbGYuX3Nwcml0ZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzZWxmLl9zcHJpdGUgPSB7X2RlZmF1bHQ6IFswLCBzZWxmLl9kdXJhdGlvbiAqIDEwMDBdfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXNlbGYuX2xvYWRlZCkge1xuICAgICAgICAgICAgc2VsZi5fbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYub24oJ2xvYWQnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VsZi5fYXV0b3BsYXkpIHtcbiAgICAgICAgICAgIHNlbGYucGxheSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNsZWFyIHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgIG5ld05vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICB9O1xuICAgICAgICBuZXdOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgbmV3Tm9kZS5sb2FkKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQvc2V0IHRoZSBVUkxzIHRvIGJlIHB1bGxlZCBmcm9tIHRvIHBsYXkgaW4gdGhpcyBzb3VyY2UuXG4gICAgICogQHBhcmFtICB7QXJyYXl9IHVybHMgIEFycnkgb2YgVVJMcyB0byBsb2FkIGZyb21cbiAgICAgKiBAcmV0dXJuIHtIb3dsfSAgICAgICAgUmV0dXJucyBzZWxmIG9yIHRoZSBjdXJyZW50IFVSTHNcbiAgICAgKi9cbiAgICB1cmxzOiBmdW5jdGlvbih1cmxzKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmICh1cmxzKSB7XG4gICAgICAgIHNlbGYuc3RvcCgpO1xuICAgICAgICBzZWxmLl91cmxzID0gKHR5cGVvZiB1cmxzID09PSAnc3RyaW5nJykgPyBbdXJsc10gOiB1cmxzO1xuICAgICAgICBzZWxmLl9sb2FkZWQgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5sb2FkKCk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZi5fdXJscztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGxheSBhIHNvdW5kIGZyb20gdGhlIGN1cnJlbnQgdGltZSAoMCBieSBkZWZhdWx0KS5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgc3ByaXRlICAgKG9wdGlvbmFsKSBQbGF5cyBmcm9tIHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gdGhlIHNvdW5kIHNwcml0ZSBkZWZpbml0aW9uLlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayAob3B0aW9uYWwpIFJldHVybnMgdGhlIHVuaXF1ZSBwbGF5YmFjayBpZCBmb3IgdGhpcyBzb3VuZCBpbnN0YW5jZS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIHBsYXk6IGZ1bmN0aW9uKHNwcml0ZSwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gaWYgbm8gc3ByaXRlIHdhcyBwYXNzZWQgYnV0IGEgY2FsbGJhY2sgd2FzLCB1cGRhdGUgdGhlIHZhcmlhYmxlc1xuICAgICAgaWYgKHR5cGVvZiBzcHJpdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBzcHJpdGU7XG4gICAgICB9XG5cbiAgICAgIC8vIHVzZSB0aGUgZGVmYXVsdCBzcHJpdGUgaWYgbm9uZSBpcyBwYXNzZWRcbiAgICAgIGlmICghc3ByaXRlIHx8IHR5cGVvZiBzcHJpdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3ByaXRlID0gJ19kZWZhdWx0JztcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhlIHNvdW5kIGhhc24ndCBiZWVuIGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBldmVudCBxdWV1ZVxuICAgICAgaWYgKCFzZWxmLl9sb2FkZWQpIHtcbiAgICAgICAgc2VsZi5vbignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYucGxheShzcHJpdGUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHRoZSBzcHJpdGUgZG9lc24ndCBleGlzdCwgcGxheSBub3RoaW5nXG4gICAgICBpZiAoIXNlbGYuX3Nwcml0ZVtzcHJpdGVdKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKCk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgdGhlIG5vZGUgdG8gcGxheWJhY2tcbiAgICAgIHNlbGYuX2luYWN0aXZlTm9kZShmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIC8vIHBlcnNpc3QgdGhlIHNwcml0ZSBiZWluZyBwbGF5ZWRcbiAgICAgICAgbm9kZS5fc3ByaXRlID0gc3ByaXRlO1xuXG4gICAgICAgIC8vIGRldGVybWluZSB3aGVyZSB0byBzdGFydCBwbGF5aW5nIGZyb21cbiAgICAgICAgdmFyIHBvcyA9IChub2RlLl9wb3MgPiAwKSA/IG5vZGUuX3BvcyA6IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdIC8gMTAwMDtcblxuICAgICAgICAvLyBkZXRlcm1pbmUgaG93IGxvbmcgdG8gcGxheSBmb3JcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gMDtcbiAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgZHVyYXRpb24gPSBzZWxmLl9zcHJpdGVbc3ByaXRlXVsxXSAvIDEwMDAgLSBub2RlLl9wb3M7XG4gICAgICAgICAgaWYgKG5vZGUuX3BvcyA+IDApIHtcbiAgICAgICAgICAgIHBvcyA9IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdIC8gMTAwMCArIHBvcztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZHVyYXRpb24gPSBzZWxmLl9zcHJpdGVbc3ByaXRlXVsxXSAvIDEwMDAgLSAocG9zIC0gc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMF0gLyAxMDAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRldGVybWluZSBpZiB0aGlzIHNvdW5kIHNob3VsZCBiZSBsb29wZWRcbiAgICAgICAgdmFyIGxvb3AgPSAhIShzZWxmLl9sb29wIHx8IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzJdKTtcblxuICAgICAgICAvLyBzZXQgdGltZXIgdG8gZmlyZSB0aGUgJ29uZW5kJyBldmVudFxuICAgICAgICB2YXIgc291bmRJZCA9ICh0eXBlb2YgY2FsbGJhY2sgPT09ICdzdHJpbmcnKSA/IGNhbGxiYWNrIDogTWF0aC5yb3VuZChEYXRlLm5vdygpICogTWF0aC5yYW5kb20oKSkgKyAnJyxcbiAgICAgICAgICB0aW1lcklkO1xuICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBpZDogc291bmRJZCxcbiAgICAgICAgICAgIHNwcml0ZTogc3ByaXRlLFxuICAgICAgICAgICAgbG9vcDogbG9vcFxuICAgICAgICAgIH07XG4gICAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBpZiBsb29waW5nLCByZXN0YXJ0IHRoZSB0cmFja1xuICAgICAgICAgICAgaWYgKCFzZWxmLl93ZWJBdWRpbyAmJiBsb29wKSB7XG4gICAgICAgICAgICAgIHNlbGYuc3RvcChkYXRhLmlkKS5wbGF5KHNwcml0ZSwgZGF0YS5pZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHNldCB3ZWIgYXVkaW8gbm9kZSB0byBwYXVzZWQgYXQgZW5kXG4gICAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8gJiYgIWxvb3ApIHtcbiAgICAgICAgICAgICAgc2VsZi5fbm9kZUJ5SWQoZGF0YS5pZCkucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgc2VsZi5fbm9kZUJ5SWQoZGF0YS5pZCkuX3BvcyA9IDA7XG5cbiAgICAgICAgICAgICAgLy8gY2xlYXIgdGhlIGVuZCB0aW1lclxuICAgICAgICAgICAgICBzZWxmLl9jbGVhckVuZFRpbWVyKGRhdGEuaWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBlbmQgdGhlIHRyYWNrIGlmIGl0IGlzIEhUTUwgYXVkaW8gYW5kIGEgc3ByaXRlXG4gICAgICAgICAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvICYmICFsb29wKSB7XG4gICAgICAgICAgICAgIHNlbGYuc3RvcChkYXRhLmlkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZmlyZSBlbmRlZCBldmVudFxuICAgICAgICAgICAgc2VsZi5vbignZW5kJywgc291bmRJZCk7XG4gICAgICAgICAgfSwgZHVyYXRpb24gKiAxMDAwKTtcblxuICAgICAgICAgIC8vIHN0b3JlIHRoZSByZWZlcmVuY2UgdG8gdGhlIHRpbWVyXG4gICAgICAgICAgc2VsZi5fb25lbmRUaW1lci5wdXNoKHt0aW1lcjogdGltZXJJZCwgaWQ6IGRhdGEuaWR9KTtcbiAgICAgICAgfSkoKTtcblxuICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICB2YXIgbG9vcFN0YXJ0ID0gc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMF0gLyAxMDAwLFxuICAgICAgICAgICAgbG9vcEVuZCA9IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzFdIC8gMTAwMDtcblxuICAgICAgICAgIC8vIHNldCB0aGUgcGxheSBpZCB0byB0aGlzIG5vZGUgYW5kIGxvYWQgaW50byBjb250ZXh0XG4gICAgICAgICAgbm9kZS5pZCA9IHNvdW5kSWQ7XG4gICAgICAgICAgbm9kZS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICByZWZyZXNoQnVmZmVyKHNlbGYsIFtsb29wLCBsb29wU3RhcnQsIGxvb3BFbmRdLCBzb3VuZElkKTtcbiAgICAgICAgICBzZWxmLl9wbGF5U3RhcnQgPSBjdHguY3VycmVudFRpbWU7XG4gICAgICAgICAgbm9kZS5nYWluLnZhbHVlID0gc2VsZi5fdm9sdW1lO1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiBub2RlLmJ1ZmZlclNvdXJjZS5zdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIG5vZGUuYnVmZmVyU291cmNlLm5vdGVHcmFpbk9uKDAsIHBvcywgZHVyYXRpb24pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlLmJ1ZmZlclNvdXJjZS5zdGFydCgwLCBwb3MsIGR1cmF0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG5vZGUucmVhZHlTdGF0ZSA9PT0gNCB8fCAhbm9kZS5yZWFkeVN0YXRlICYmIG5hdmlnYXRvci5pc0NvY29vbkpTKSB7XG4gICAgICAgICAgICBub2RlLnJlYWR5U3RhdGUgPSA0O1xuICAgICAgICAgICAgbm9kZS5pZCA9IHNvdW5kSWQ7XG4gICAgICAgICAgICBub2RlLmN1cnJlbnRUaW1lID0gcG9zO1xuICAgICAgICAgICAgbm9kZS5tdXRlZCA9IEhvd2xlci5fbXV0ZWQgfHwgbm9kZS5tdXRlZDtcbiAgICAgICAgICAgIG5vZGUudm9sdW1lID0gc2VsZi5fdm9sdW1lICogSG93bGVyLnZvbHVtZSgpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgbm9kZS5wbGF5KCk7IH0sIDApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLl9jbGVhckVuZFRpbWVyKHNvdW5kSWQpO1xuXG4gICAgICAgICAgICAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgdmFyIHNvdW5kID0gc2VsZixcbiAgICAgICAgICAgICAgICBwbGF5U3ByaXRlID0gc3ByaXRlLFxuICAgICAgICAgICAgICAgIGZuID0gY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgbmV3Tm9kZSA9IG5vZGU7XG4gICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNvdW5kLnBsYXkocGxheVNwcml0ZSwgZm4pO1xuXG4gICAgICAgICAgICAgICAgLy8gY2xlYXIgdGhlIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgICAgICAgICAgbmV3Tm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIG5ld05vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmlyZSB0aGUgcGxheSBldmVudCBhbmQgc2VuZCB0aGUgc291bmRJZCBiYWNrIGluIHRoZSBjYWxsYmFja1xuICAgICAgICBzZWxmLm9uKCdwbGF5Jyk7XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIGNhbGxiYWNrKHNvdW5kSWQpO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQYXVzZSBwbGF5YmFjayBhbmQgc2F2ZSB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgKG9wdGlvbmFsKSBUaGUgcGxheSBpbnN0YW5jZSBJRC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIHBhdXNlOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBpZiB0aGUgc291bmQgaGFzbid0IGJlZW4gbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGV2ZW50IHF1ZXVlXG4gICAgICBpZiAoIXNlbGYuX2xvYWRlZCkge1xuICAgICAgICBzZWxmLm9uKCdwbGF5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5wYXVzZShpZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBjbGVhciAnb25lbmQnIHRpbWVyXG4gICAgICBzZWxmLl9jbGVhckVuZFRpbWVyKGlkKTtcblxuICAgICAgdmFyIGFjdGl2ZU5vZGUgPSAoaWQpID8gc2VsZi5fbm9kZUJ5SWQoaWQpIDogc2VsZi5fYWN0aXZlTm9kZSgpO1xuICAgICAgaWYgKGFjdGl2ZU5vZGUpIHtcbiAgICAgICAgYWN0aXZlTm9kZS5fcG9zID0gc2VsZi5wb3MobnVsbCwgaWQpO1xuXG4gICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgc291bmQgaGFzIGJlZW4gY3JlYXRlZFxuICAgICAgICAgIGlmICghYWN0aXZlTm9kZS5idWZmZXJTb3VyY2UgfHwgYWN0aXZlTm9kZS5wYXVzZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFjdGl2ZU5vZGUucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodHlwZW9mIGFjdGl2ZU5vZGUuYnVmZmVyU291cmNlLnN0b3AgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBhY3RpdmVOb2RlLmJ1ZmZlclNvdXJjZS5ub3RlT2ZmKDApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3RpdmVOb2RlLmJ1ZmZlclNvdXJjZS5zdG9wKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhY3RpdmVOb2RlLnBhdXNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5vbigncGF1c2UnKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3AgcGxheWJhY2sgYW5kIHJlc2V0IHRvIHN0YXJ0LlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gaWQgIChvcHRpb25hbCkgVGhlIHBsYXkgaW5zdGFuY2UgSUQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBzdG9wOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBpZiB0aGUgc291bmQgaGFzbid0IGJlZW4gbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGV2ZW50IHF1ZXVlXG4gICAgICBpZiAoIXNlbGYuX2xvYWRlZCkge1xuICAgICAgICBzZWxmLm9uKCdwbGF5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5zdG9wKGlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIGNsZWFyICdvbmVuZCcgdGltZXJcbiAgICAgIHNlbGYuX2NsZWFyRW5kVGltZXIoaWQpO1xuXG4gICAgICB2YXIgYWN0aXZlTm9kZSA9IChpZCkgPyBzZWxmLl9ub2RlQnlJZChpZCkgOiBzZWxmLl9hY3RpdmVOb2RlKCk7XG4gICAgICBpZiAoYWN0aXZlTm9kZSkge1xuICAgICAgICBhY3RpdmVOb2RlLl9wb3MgPSAwO1xuXG4gICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgc291bmQgaGFzIGJlZW4gY3JlYXRlZFxuICAgICAgICAgIGlmICghYWN0aXZlTm9kZS5idWZmZXJTb3VyY2UgfHwgYWN0aXZlTm9kZS5wYXVzZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFjdGl2ZU5vZGUucGF1c2VkID0gdHJ1ZTtcblxuICAgICAgICAgIGlmICh0eXBlb2YgYWN0aXZlTm9kZS5idWZmZXJTb3VyY2Uuc3RvcCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGFjdGl2ZU5vZGUuYnVmZmVyU291cmNlLm5vdGVPZmYoMCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjdGl2ZU5vZGUuYnVmZmVyU291cmNlLnN0b3AoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFpc05hTihhY3RpdmVOb2RlLmR1cmF0aW9uKSkge1xuICAgICAgICAgIGFjdGl2ZU5vZGUucGF1c2UoKTtcbiAgICAgICAgICBhY3RpdmVOb2RlLmN1cnJlbnRUaW1lID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTXV0ZSB0aGlzIHNvdW5kLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gaWQgKG9wdGlvbmFsKSBUaGUgcGxheSBpbnN0YW5jZSBJRC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIG11dGU6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIGlmIHRoZSBzb3VuZCBoYXNuJ3QgYmVlbiBsb2FkZWQsIGFkZCBpdCB0byB0aGUgZXZlbnQgcXVldWVcbiAgICAgIGlmICghc2VsZi5fbG9hZGVkKSB7XG4gICAgICAgIHNlbGYub24oJ3BsYXknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLm11dGUoaWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgdmFyIGFjdGl2ZU5vZGUgPSAoaWQpID8gc2VsZi5fbm9kZUJ5SWQoaWQpIDogc2VsZi5fYWN0aXZlTm9kZSgpO1xuICAgICAgaWYgKGFjdGl2ZU5vZGUpIHtcbiAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgYWN0aXZlTm9kZS5nYWluLnZhbHVlID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhY3RpdmVOb2RlLm11dGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5tdXRlIHRoaXMgc291bmQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBpZCAob3B0aW9uYWwpIFRoZSBwbGF5IGluc3RhbmNlIElELlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgdW5tdXRlOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBpZiB0aGUgc291bmQgaGFzbid0IGJlZW4gbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGV2ZW50IHF1ZXVlXG4gICAgICBpZiAoIXNlbGYuX2xvYWRlZCkge1xuICAgICAgICBzZWxmLm9uKCdwbGF5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi51bm11dGUoaWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgdmFyIGFjdGl2ZU5vZGUgPSAoaWQpID8gc2VsZi5fbm9kZUJ5SWQoaWQpIDogc2VsZi5fYWN0aXZlTm9kZSgpO1xuICAgICAgaWYgKGFjdGl2ZU5vZGUpIHtcbiAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgYWN0aXZlTm9kZS5nYWluLnZhbHVlID0gc2VsZi5fdm9sdW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFjdGl2ZU5vZGUubXV0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB2b2x1bWUgb2YgdGhpcyBzb3VuZC5cbiAgICAgKiBAcGFyYW0gIHtGbG9hdH0gIHZvbCBWb2x1bWUgZnJvbSAwLjAgdG8gMS4wLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gaWQgIChvcHRpb25hbCkgVGhlIHBsYXkgaW5zdGFuY2UgSUQuXG4gICAgICogQHJldHVybiB7SG93bC9GbG9hdH0gICAgIFJldHVybnMgc2VsZiBvciBjdXJyZW50IHZvbHVtZS5cbiAgICAgKi9cbiAgICB2b2x1bWU6IGZ1bmN0aW9uKHZvbCwgaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gbWFrZSBzdXJlIHZvbHVtZSBpcyBhIG51bWJlclxuICAgICAgdm9sID0gcGFyc2VGbG9hdCh2b2wpO1xuXG4gICAgICBpZiAodm9sID49IDAgJiYgdm9sIDw9IDEpIHtcbiAgICAgICAgc2VsZi5fdm9sdW1lID0gdm9sO1xuXG4gICAgICAgIC8vIGlmIHRoZSBzb3VuZCBoYXNuJ3QgYmVlbiBsb2FkZWQsIGFkZCBpdCB0byB0aGUgZXZlbnQgcXVldWVcbiAgICAgICAgaWYgKCFzZWxmLl9sb2FkZWQpIHtcbiAgICAgICAgICBzZWxmLm9uKCdwbGF5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnZvbHVtZSh2b2wsIGlkKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFjdGl2ZU5vZGUgPSAoaWQpID8gc2VsZi5fbm9kZUJ5SWQoaWQpIDogc2VsZi5fYWN0aXZlTm9kZSgpO1xuICAgICAgICBpZiAoYWN0aXZlTm9kZSkge1xuICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgICAgYWN0aXZlTm9kZS5nYWluLnZhbHVlID0gdm9sO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3RpdmVOb2RlLnZvbHVtZSA9IHZvbCAqIEhvd2xlci52b2x1bWUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxmLl92b2x1bWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgd2hldGhlciB0byBsb29wIHRoZSBzb3VuZC5cbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBsb29wIFRvIGxvb3Agb3Igbm90IHRvIGxvb3AsIHRoYXQgaXMgdGhlIHF1ZXN0aW9uLlxuICAgICAqIEByZXR1cm4ge0hvd2wvQm9vbGVhbn0gICAgICBSZXR1cm5zIHNlbGYgb3IgY3VycmVudCBsb29waW5nIHZhbHVlLlxuICAgICAqL1xuICAgIGxvb3A6IGZ1bmN0aW9uKGxvb3ApIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBsb29wID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgc2VsZi5fbG9vcCA9IGxvb3A7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZi5fbG9vcDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCBzb3VuZCBzcHJpdGUgZGVmaW5pdGlvbi5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHNwcml0ZSBFeGFtcGxlOiB7c3ByaXRlTmFtZTogW29mZnNldCwgZHVyYXRpb24sIGxvb3BdfVxuICAgICAqICAgICAgICAgICAgICAgIEBwYXJhbSB7SW50ZWdlcn0gb2Zmc2V0ICAgV2hlcmUgdG8gYmVnaW4gcGxheWJhY2sgaW4gbWlsbGlzZWNvbmRzXG4gICAgICogICAgICAgICAgICAgICAgQHBhcmFtIHtJbnRlZ2VyfSBkdXJhdGlvbiBIb3cgbG9uZyB0byBwbGF5IGluIG1pbGxpc2Vjb25kc1xuICAgICAqICAgICAgICAgICAgICAgIEBwYXJhbSB7Qm9vbGVhbn0gbG9vcCAgICAgKG9wdGlvbmFsKSBTZXQgdHJ1ZSB0byBsb29wIHRoaXMgc3ByaXRlXG4gICAgICogQHJldHVybiB7SG93bH0gICAgICAgIFJldHVybnMgY3VycmVudCBzcHJpdGUgc2hlZXQgb3Igc2VsZi5cbiAgICAgKi9cbiAgICBzcHJpdGU6IGZ1bmN0aW9uKHNwcml0ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAodHlwZW9mIHNwcml0ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgc2VsZi5fc3ByaXRlID0gc3ByaXRlO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX3Nwcml0ZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgcG9zaXRpb24gb2YgcGxheWJhY2suXG4gICAgICogQHBhcmFtICB7RmxvYXR9ICBwb3MgVGhlIHBvc2l0aW9uIHRvIG1vdmUgY3VycmVudCBwbGF5YmFjayB0by5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkICAob3B0aW9uYWwpIFRoZSBwbGF5IGluc3RhbmNlIElELlxuICAgICAqIEByZXR1cm4ge0hvd2wvRmxvYXR9ICAgICAgUmV0dXJucyBzZWxmIG9yIGN1cnJlbnQgcGxheWJhY2sgcG9zaXRpb24uXG4gICAgICovXG4gICAgcG9zOiBmdW5jdGlvbihwb3MsIGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIGlmIHRoZSBzb3VuZCBoYXNuJ3QgYmVlbiBsb2FkZWQsIGFkZCBpdCB0byB0aGUgZXZlbnQgcXVldWVcbiAgICAgIGlmICghc2VsZi5fbG9hZGVkKSB7XG4gICAgICAgIHNlbGYub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLnBvcyhwb3MpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdHlwZW9mIHBvcyA9PT0gJ251bWJlcicgPyBzZWxmIDogc2VsZi5fcG9zIHx8IDA7XG4gICAgICB9XG5cbiAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmUgZGVhbGluZyB3aXRoIGEgbnVtYmVyIGZvciBwb3NcbiAgICAgIHBvcyA9IHBhcnNlRmxvYXQocG9zKTtcblxuICAgICAgdmFyIGFjdGl2ZU5vZGUgPSAoaWQpID8gc2VsZi5fbm9kZUJ5SWQoaWQpIDogc2VsZi5fYWN0aXZlTm9kZSgpO1xuICAgICAgaWYgKGFjdGl2ZU5vZGUpIHtcbiAgICAgICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAgICAgc2VsZi5wYXVzZShpZCk7XG4gICAgICAgICAgYWN0aXZlTm9kZS5fcG9zID0gcG9zO1xuICAgICAgICAgIHNlbGYucGxheShhY3RpdmVOb2RlLl9zcHJpdGUsIGlkKTtcblxuICAgICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzZWxmLl93ZWJBdWRpbyA/IGFjdGl2ZU5vZGUuX3BvcyArIChjdHguY3VycmVudFRpbWUgLSBzZWxmLl9wbGF5U3RhcnQpIDogYWN0aXZlTm9kZS5jdXJyZW50VGltZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwb3MgPj0gMCkge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IGluYWN0aXZlIG5vZGUgdG8gcmV0dXJuIHRoZSBwb3MgZm9yXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9hdWRpb05vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoc2VsZi5fYXVkaW9Ob2RlW2ldLnBhdXNlZCAmJiBzZWxmLl9hdWRpb05vZGVbaV0ucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgcmV0dXJuIChzZWxmLl93ZWJBdWRpbykgPyBzZWxmLl9hdWRpb05vZGVbaV0uX3BvcyA6IHNlbGYuX2F1ZGlvTm9kZVtpXS5jdXJyZW50VGltZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgM0QgcG9zaXRpb24gb2YgdGhlIGF1ZGlvIHNvdXJjZS5cbiAgICAgKiBUaGUgbW9zdCBjb21tb24gdXNhZ2UgaXMgdG8gc2V0IHRoZSAneCcgcG9zaXRpb25cbiAgICAgKiB0byBhZmZlY3QgdGhlIGxlZnQvcmlnaHQgZWFyIHBhbm5pbmcuIFNldHRpbmcgYW55IHZhbHVlIGhpZ2hlciB0aGFuXG4gICAgICogMS4wIHdpbGwgYmVnaW4gdG8gZGVjcmVhc2UgdGhlIHZvbHVtZSBvZiB0aGUgc291bmQgYXMgaXQgbW92ZXMgZnVydGhlciBhd2F5LlxuICAgICAqIE5PVEU6IFRoaXMgb25seSB3b3JrcyB3aXRoIFdlYiBBdWRpbyBBUEksIEhUTUw1IEF1ZGlvIHBsYXliYWNrXG4gICAgICogd2lsbCBub3QgYmUgYWZmZWN0ZWQuXG4gICAgICogQHBhcmFtICB7RmxvYXR9ICB4ICBUaGUgeC1wb3NpdGlvbiBvZiB0aGUgcGxheWJhY2sgZnJvbSAtMTAwMC4wIHRvIDEwMDAuMFxuICAgICAqIEBwYXJhbSAge0Zsb2F0fSAgeSAgVGhlIHktcG9zaXRpb24gb2YgdGhlIHBsYXliYWNrIGZyb20gLTEwMDAuMCB0byAxMDAwLjBcbiAgICAgKiBAcGFyYW0gIHtGbG9hdH0gIHogIFRoZSB6LXBvc2l0aW9uIG9mIHRoZSBwbGF5YmFjayBmcm9tIC0xMDAwLjAgdG8gMTAwMC4wXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBpZCAob3B0aW9uYWwpIFRoZSBwbGF5IGluc3RhbmNlIElELlxuICAgICAqIEByZXR1cm4ge0hvd2wvQXJyYXl9ICAgUmV0dXJucyBzZWxmIG9yIHRoZSBjdXJyZW50IDNEIHBvc2l0aW9uOiBbeCwgeSwgel1cbiAgICAgKi9cbiAgICBwb3MzZDogZnVuY3Rpb24oeCwgeSwgeiwgaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gc2V0IGEgZGVmYXVsdCBmb3IgdGhlIG9wdGlvbmFsICd5JyAmICd6J1xuICAgICAgeSA9ICh0eXBlb2YgeSA9PT0gJ3VuZGVmaW5lZCcgfHwgIXkpID8gMCA6IHk7XG4gICAgICB6ID0gKHR5cGVvZiB6ID09PSAndW5kZWZpbmVkJyB8fCAheikgPyAtMC41IDogejtcblxuICAgICAgLy8gaWYgdGhlIHNvdW5kIGhhc24ndCBiZWVuIGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBldmVudCBxdWV1ZVxuICAgICAgaWYgKCFzZWxmLl9sb2FkZWQpIHtcbiAgICAgICAgc2VsZi5vbigncGxheScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYucG9zM2QoeCwgeSwgeiwgaWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgaWYgKHggPj0gMCB8fCB4IDwgMCkge1xuICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICB2YXIgYWN0aXZlTm9kZSA9IChpZCkgPyBzZWxmLl9ub2RlQnlJZChpZCkgOiBzZWxmLl9hY3RpdmVOb2RlKCk7XG4gICAgICAgICAgaWYgKGFjdGl2ZU5vZGUpIHtcbiAgICAgICAgICAgIHNlbGYuX3BvczNkID0gW3gsIHksIHpdO1xuICAgICAgICAgICAgYWN0aXZlTm9kZS5wYW5uZXIuc2V0UG9zaXRpb24oeCwgeSwgeik7XG4gICAgICAgICAgICBhY3RpdmVOb2RlLnBhbm5lci5wYW5uaW5nTW9kZWwgPSBzZWxmLl9tb2RlbCB8fCAnSFJURic7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZi5fcG9zM2Q7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGYWRlIGEgY3VycmVudGx5IHBsYXlpbmcgc291bmQgYmV0d2VlbiB0d28gdm9sdW1lcy5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgZnJvbSAgICAgVGhlIHZvbHVtZSB0byBmYWRlIGZyb20gKDAuMCB0byAxLjApLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gICB0byAgICAgICBUaGUgdm9sdW1lIHRvIGZhZGUgdG8gKDAuMCB0byAxLjApLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gICBsZW4gICAgICBUaW1lIGluIG1pbGxpc2Vjb25kcyB0byBmYWRlLlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayAob3B0aW9uYWwpIEZpcmVkIHdoZW4gdGhlIGZhZGUgaXMgY29tcGxldGUuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIGlkICAgICAgIChvcHRpb25hbCkgVGhlIHBsYXkgaW5zdGFuY2UgSUQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBmYWRlOiBmdW5jdGlvbihmcm9tLCB0bywgbGVuLCBjYWxsYmFjaywgaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZGlmZiA9IE1hdGguYWJzKGZyb20gLSB0byksXG4gICAgICAgIGRpciA9IGZyb20gPiB0byA/ICdkb3duJyA6ICd1cCcsXG4gICAgICAgIHN0ZXBzID0gZGlmZiAvIDAuMDEsXG4gICAgICAgIHN0ZXBUaW1lID0gbGVuIC8gc3RlcHM7XG5cbiAgICAgIC8vIGlmIHRoZSBzb3VuZCBoYXNuJ3QgYmVlbiBsb2FkZWQsIGFkZCBpdCB0byB0aGUgZXZlbnQgcXVldWVcbiAgICAgIGlmICghc2VsZi5fbG9hZGVkKSB7XG4gICAgICAgIHNlbGYub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLmZhZGUoZnJvbSwgdG8sIGxlbiwgY2FsbGJhY2ssIGlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIHNldCB0aGUgdm9sdW1lIHRvIHRoZSBzdGFydCBwb3NpdGlvblxuICAgICAgc2VsZi52b2x1bWUoZnJvbSwgaWQpO1xuXG4gICAgICBmb3IgKHZhciBpPTE7IGk8PXN0ZXBzOyBpKyspIHtcbiAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBjaGFuZ2UgPSBzZWxmLl92b2x1bWUgKyAoZGlyID09PSAndXAnID8gMC4wMSA6IC0wLjAxKSAqIGksXG4gICAgICAgICAgICB2b2wgPSBNYXRoLnJvdW5kKDEwMDAgKiBjaGFuZ2UpIC8gMTAwMCxcbiAgICAgICAgICAgIHRvVm9sID0gdG87XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi52b2x1bWUodm9sLCBpZCk7XG5cbiAgICAgICAgICAgIGlmICh2b2wgPT09IHRvVm9sKSB7XG4gICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBzdGVwVGltZSAqIGkpO1xuICAgICAgICB9KSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBbREVQUkVDQVRFRF0gRmFkZSBpbiB0aGUgY3VycmVudCBzb3VuZC5cbiAgICAgKiBAcGFyYW0gIHtGbG9hdH0gICAgdG8gICAgICBWb2x1bWUgdG8gZmFkZSB0byAoMC4wIHRvIDEuMCkuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSAgIGxlbiAgICAgVGltZSBpbiBtaWxsaXNlY29uZHMgdG8gZmFkZS5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIGZhZGVJbjogZnVuY3Rpb24odG8sIGxlbiwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiB0aGlzLnZvbHVtZSgwKS5wbGF5KCkuZmFkZSgwLCB0bywgbGVuLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFtERVBSRUNBVEVEXSBGYWRlIG91dCB0aGUgY3VycmVudCBzb3VuZCBhbmQgcGF1c2Ugd2hlbiBmaW5pc2hlZC5cbiAgICAgKiBAcGFyYW0gIHtGbG9hdH0gICAgdG8gICAgICAgVm9sdW1lIHRvIGZhZGUgdG8gKDAuMCB0byAxLjApLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gICBsZW4gICAgICBUaW1lIGluIG1pbGxpc2Vjb25kcyB0byBmYWRlLlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEBwYXJhbSAge1N0cmluZ30gICBpZCAgICAgICAob3B0aW9uYWwpIFRoZSBwbGF5IGluc3RhbmNlIElELlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgZmFkZU91dDogZnVuY3Rpb24odG8sIGxlbiwgY2FsbGJhY2ssIGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHJldHVybiBzZWxmLmZhZGUoc2VsZi5fdm9sdW1lLCB0bywgbGVuLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjaygpO1xuICAgICAgICBzZWxmLnBhdXNlKGlkKTtcblxuICAgICAgICAvLyBmaXJlIGVuZGVkIGV2ZW50XG4gICAgICAgIHNlbGYub24oJ2VuZCcpO1xuICAgICAgfSwgaWQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYW4gYXVkaW8gbm9kZSBieSBJRC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfSBBdWRpbyBub2RlLlxuICAgICAqL1xuICAgIF9ub2RlQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbm9kZSA9IHNlbGYuX2F1ZGlvTm9kZVswXTtcblxuICAgICAgLy8gZmluZCB0aGUgbm9kZSB3aXRoIHRoaXMgSURcbiAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9hdWRpb05vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX2F1ZGlvTm9kZVtpXS5pZCA9PT0gaWQpIHtcbiAgICAgICAgICBub2RlID0gc2VsZi5fYXVkaW9Ob2RlW2ldO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpcnN0IGFjdGl2ZSBhdWRpbyBub2RlLlxuICAgICAqIEByZXR1cm4ge0hvd2x9IEF1ZGlvIG5vZGUuXG4gICAgICovXG4gICAgX2FjdGl2ZU5vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBub2RlID0gbnVsbDtcblxuICAgICAgLy8gZmluZCB0aGUgZmlyc3QgcGxheWluZyBub2RlXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fYXVkaW9Ob2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghc2VsZi5fYXVkaW9Ob2RlW2ldLnBhdXNlZCkge1xuICAgICAgICAgIG5vZGUgPSBzZWxmLl9hdWRpb05vZGVbaV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcmVtb3ZlIGV4Y2VzcyBpbmFjdGl2ZSBub2Rlc1xuICAgICAgc2VsZi5fZHJhaW5Qb29sKCk7XG5cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGZpcnN0IGluYWN0aXZlIGF1ZGlvIG5vZGUuXG4gICAgICogSWYgdGhlcmUgaXMgbm9uZSwgY3JlYXRlIGEgbmV3IG9uZSBhbmQgYWRkIGl0IHRvIHRoZSBwb29sLlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIGF1ZGlvIG5vZGUgaXMgcmVhZHkuXG4gICAgICovXG4gICAgX2luYWN0aXZlTm9kZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbm9kZSA9IG51bGw7XG5cbiAgICAgIC8vIGZpbmQgZmlyc3QgaW5hY3RpdmUgbm9kZSB0byByZWN5Y2xlXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fYXVkaW9Ob2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9hdWRpb05vZGVbaV0ucGF1c2VkICYmIHNlbGYuX2F1ZGlvTm9kZVtpXS5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgLy8gc2VuZCB0aGUgbm9kZSBiYWNrIGZvciB1c2UgYnkgdGhlIG5ldyBwbGF5IGluc3RhbmNlXG4gICAgICAgICAgY2FsbGJhY2soc2VsZi5fYXVkaW9Ob2RlW2ldKTtcbiAgICAgICAgICBub2RlID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyByZW1vdmUgZXhjZXNzIGluYWN0aXZlIG5vZGVzXG4gICAgICBzZWxmLl9kcmFpblBvb2woKTtcblxuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBjcmVhdGUgbmV3IG5vZGUgaWYgdGhlcmUgYXJlIG5vIGluYWN0aXZlc1xuICAgICAgdmFyIG5ld05vZGU7XG4gICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgbmV3Tm9kZSA9IHNlbGYuX3NldHVwQXVkaW9Ob2RlKCk7XG4gICAgICAgIGNhbGxiYWNrKG5ld05vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5sb2FkKCk7XG4gICAgICAgIG5ld05vZGUgPSBzZWxmLl9hdWRpb05vZGVbc2VsZi5fYXVkaW9Ob2RlLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIC8vIGxpc3RlbiBmb3IgdGhlIGNvcnJlY3QgbG9hZCBldmVudCBhbmQgZmlyZSB0aGUgY2FsbGJhY2tcbiAgICAgICAgdmFyIGxpc3RlbmVyRXZlbnQgPSBuYXZpZ2F0b3IuaXNDb2Nvb25KUyA/ICdjYW5wbGF5dGhyb3VnaCcgOiAnbG9hZGVkbWV0YWRhdGEnO1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBuZXdOb2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIobGlzdGVuZXJFdmVudCwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgICBjYWxsYmFjayhuZXdOb2RlKTtcbiAgICAgICAgfTtcbiAgICAgICAgbmV3Tm9kZS5hZGRFdmVudExpc3RlbmVyKGxpc3RlbmVyRXZlbnQsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIElmIHRoZXJlIGFyZSBtb3JlIHRoYW4gNSBpbmFjdGl2ZSBhdWRpbyBub2RlcyBpbiB0aGUgcG9vbCwgY2xlYXIgb3V0IHRoZSByZXN0LlxuICAgICAqL1xuICAgIF9kcmFpblBvb2w6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBpbmFjdGl2ZSA9IDAsXG4gICAgICAgIGk7XG5cbiAgICAgIC8vIGNvdW50IHRoZSBudW1iZXIgb2YgaW5hY3RpdmUgbm9kZXNcbiAgICAgIGZvciAoaT0wOyBpPHNlbGYuX2F1ZGlvTm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5fYXVkaW9Ob2RlW2ldLnBhdXNlZCkge1xuICAgICAgICAgIGluYWN0aXZlKys7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcmVtb3ZlIGV4Y2VzcyBpbmFjdGl2ZSBub2Rlc1xuICAgICAgZm9yIChpPXNlbGYuX2F1ZGlvTm9kZS5sZW5ndGgtMTsgaT49MDsgaS0tKSB7XG4gICAgICAgIGlmIChpbmFjdGl2ZSA8PSA1KSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZi5fYXVkaW9Ob2RlW2ldLnBhdXNlZCkge1xuICAgICAgICAgIC8vIGRpc2Nvbm5lY3QgdGhlIGF1ZGlvIHNvdXJjZSBpZiB1c2luZyBXZWIgQXVkaW9cbiAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAgIHNlbGYuX2F1ZGlvTm9kZVtpXS5kaXNjb25uZWN0KDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGluYWN0aXZlLS07XG4gICAgICAgICAgc2VsZi5fYXVkaW9Ob2RlLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciAnb25lbmQnIHRpbWVvdXQgYmVmb3JlIGl0IGVuZHMuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBzb3VuZElkICBUaGUgcGxheSBpbnN0YW5jZSBJRC5cbiAgICAgKi9cbiAgICBfY2xlYXJFbmRUaW1lcjogZnVuY3Rpb24oc291bmRJZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBpbmRleCA9IDA7XG5cbiAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgdGltZXJzIHRvIGZpbmQgdGhlIG9uZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBzb3VuZFxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX29uZW5kVGltZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX29uZW5kVGltZXJbaV0uaWQgPT09IHNvdW5kSWQpIHtcbiAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHRpbWVyID0gc2VsZi5fb25lbmRUaW1lcltpbmRleF07XG4gICAgICBpZiAodGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyLnRpbWVyKTtcbiAgICAgICAgc2VsZi5fb25lbmRUaW1lci5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCB0aGUgZ2FpbiBub2RlIGFuZCBwYW5uZXIgZm9yIGEgV2ViIEF1ZGlvIGluc3RhbmNlLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gVGhlIG5ldyBhdWRpbyBub2RlLlxuICAgICAqL1xuICAgIF9zZXR1cEF1ZGlvTm9kZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIG5vZGUgPSBzZWxmLl9hdWRpb05vZGUsXG4gICAgICAgIGluZGV4ID0gc2VsZi5fYXVkaW9Ob2RlLmxlbmd0aDtcblxuICAgICAgLy8gY3JlYXRlIGdhaW4gbm9kZVxuICAgICAgbm9kZVtpbmRleF0gPSAodHlwZW9mIGN0eC5jcmVhdGVHYWluID09PSAndW5kZWZpbmVkJykgPyBjdHguY3JlYXRlR2Fpbk5vZGUoKSA6IGN0eC5jcmVhdGVHYWluKCk7XG4gICAgICBub2RlW2luZGV4XS5nYWluLnZhbHVlID0gc2VsZi5fdm9sdW1lO1xuICAgICAgbm9kZVtpbmRleF0ucGF1c2VkID0gdHJ1ZTtcbiAgICAgIG5vZGVbaW5kZXhdLl9wb3MgPSAwO1xuICAgICAgbm9kZVtpbmRleF0ucmVhZHlTdGF0ZSA9IDQ7XG4gICAgICBub2RlW2luZGV4XS5jb25uZWN0KG1hc3RlckdhaW4pO1xuXG4gICAgICAvLyBjcmVhdGUgdGhlIHBhbm5lclxuICAgICAgbm9kZVtpbmRleF0ucGFubmVyID0gY3R4LmNyZWF0ZVBhbm5lcigpO1xuICAgICAgbm9kZVtpbmRleF0ucGFubmVyLnBhbm5pbmdNb2RlbCA9IHNlbGYuX21vZGVsIHx8ICdlcXVhbHBvd2VyJztcbiAgICAgIG5vZGVbaW5kZXhdLnBhbm5lci5zZXRQb3NpdGlvbihzZWxmLl9wb3MzZFswXSwgc2VsZi5fcG9zM2RbMV0sIHNlbGYuX3BvczNkWzJdKTtcbiAgICAgIG5vZGVbaW5kZXhdLnBhbm5lci5jb25uZWN0KG5vZGVbaW5kZXhdKTtcblxuICAgICAgcmV0dXJuIG5vZGVbaW5kZXhdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxsL3NldCBjdXN0b20gZXZlbnRzLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gICBldmVudCBFdmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmbiAgICBGdW5jdGlvbiB0byBjYWxsLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgb246IGZ1bmN0aW9uKGV2ZW50LCBmbikge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBldmVudHMgPSBzZWxmWydfb24nICsgZXZlbnRdO1xuXG4gICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGV2ZW50cy5wdXNoKGZuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgIGV2ZW50c1tpXS5jYWxsKHNlbGYsIGZuKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnRzW2ldLmNhbGwoc2VsZik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSBjdXN0b20gZXZlbnQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIGV2ZW50IEV2ZW50IHR5cGUuXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGZuICAgIExpc3RlbmVyIHRvIHJlbW92ZS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIG9mZjogZnVuY3Rpb24oZXZlbnQsIGZuKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGV2ZW50cyA9IHNlbGZbJ19vbicgKyBldmVudF0sXG4gICAgICAgIGZuU3RyaW5nID0gZm4gPyBmbi50b1N0cmluZygpIDogbnVsbDtcblxuICAgICAgaWYgKGZuU3RyaW5nKSB7XG4gICAgICAgIC8vIGxvb3AgdGhyb3VnaCBmdW5jdGlvbnMgaW4gdGhlIGV2ZW50IGZvciBjb21wYXJpc29uXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoZm5TdHJpbmcgPT09IGV2ZW50c1tpXS50b1N0cmluZygpKSB7XG4gICAgICAgICAgICBldmVudHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmWydfb24nICsgZXZlbnRdID0gW107XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmxvYWQgYW5kIGRlc3Ryb3kgdGhlIGN1cnJlbnQgSG93bCBvYmplY3QuXG4gICAgICogVGhpcyB3aWxsIGltbWVkaWF0ZWx5IHN0b3AgYWxsIHBsYXkgaW5zdGFuY2VzIGF0dGFjaGVkIHRvIHRoaXMgc291bmQuXG4gICAgICovXG4gICAgdW5sb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gc3RvcCBwbGF5aW5nIGFueSBhY3RpdmUgbm9kZXNcbiAgICAgIHZhciBub2RlcyA9IHNlbGYuX2F1ZGlvTm9kZTtcbiAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9hdWRpb05vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gc3RvcCB0aGUgc291bmQgaWYgaXQgaXMgY3VycmVudGx5IHBsYXlpbmdcbiAgICAgICAgaWYgKCFub2Rlc1tpXS5wYXVzZWQpIHtcbiAgICAgICAgICBzZWxmLnN0b3Aobm9kZXNbaV0uaWQpO1xuICAgICAgICAgIHNlbGYub24oJ2VuZCcsIG5vZGVzW2ldLmlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAvLyByZW1vdmUgdGhlIHNvdXJjZSBpZiB1c2luZyBIVE1MNSBBdWRpb1xuICAgICAgICAgIG5vZGVzW2ldLnNyYyA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGRpc2Nvbm5lY3QgdGhlIG91dHB1dCBmcm9tIHRoZSBtYXN0ZXIgZ2FpblxuICAgICAgICAgIG5vZGVzW2ldLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gbWFrZSBzdXJlIGFsbCB0aW1lb3V0cyBhcmUgY2xlYXJlZFxuICAgICAgZm9yIChpPTA7IGk8c2VsZi5fb25lbmRUaW1lci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5fb25lbmRUaW1lcltpXS50aW1lcik7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlbW92ZSB0aGUgcmVmZXJlbmNlIGluIHRoZSBnbG9iYWwgSG93bGVyIG9iamVjdFxuICAgICAgdmFyIGluZGV4ID0gSG93bGVyLl9ob3dscy5pbmRleE9mKHNlbGYpO1xuICAgICAgaWYgKGluZGV4ICE9PSBudWxsICYmIGluZGV4ID49IDApIHtcbiAgICAgICAgSG93bGVyLl9ob3dscy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWxldGUgdGhpcyBzb3VuZCBmcm9tIHRoZSBjYWNoZVxuICAgICAgZGVsZXRlIGNhY2hlW3NlbGYuX3NyY107XG4gICAgICBzZWxmID0gbnVsbDtcbiAgICB9XG5cbiAgfTtcblxuICAvLyBvbmx5IGRlZmluZSB0aGVzZSBmdW5jdGlvbnMgd2hlbiB1c2luZyBXZWJBdWRpb1xuICBpZiAodXNpbmdXZWJBdWRpbykge1xuXG4gICAgLyoqXG4gICAgICogQnVmZmVyIGEgc291bmQgZnJvbSBVUkwgKG9yIGZyb20gY2FjaGUpIGFuZCBkZWNvZGUgdG8gYXVkaW8gc291cmNlIChXZWIgQXVkaW8gQVBJKS5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IG9iaiBUaGUgSG93bCBvYmplY3QgZm9yIHRoZSBzb3VuZCB0byBsb2FkLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gdXJsIFRoZSBwYXRoIHRvIHRoZSBzb3VuZCBmaWxlLlxuICAgICAqL1xuICAgIHZhciBsb2FkQnVmZmVyID0gZnVuY3Rpb24ob2JqLCB1cmwpIHtcbiAgICAgIC8vIGNoZWNrIGlmIHRoZSBidWZmZXIgaGFzIGFscmVhZHkgYmVlbiBjYWNoZWRcbiAgICAgIGlmICh1cmwgaW4gY2FjaGUpIHtcbiAgICAgICAgLy8gc2V0IHRoZSBkdXJhdGlvbiBmcm9tIHRoZSBjYWNoZVxuICAgICAgICBvYmouX2R1cmF0aW9uID0gY2FjaGVbdXJsXS5kdXJhdGlvbjtcblxuICAgICAgICAvLyBsb2FkIHRoZSBzb3VuZCBpbnRvIHRoaXMgb2JqZWN0XG4gICAgICAgIGxvYWRTb3VuZChvYmopO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICgvXmRhdGE6W147XSs7YmFzZTY0LC8udGVzdCh1cmwpKSB7XG4gICAgICAgIC8vIERlY29kZSBiYXNlNjQgZGF0YS1VUklzIGJlY2F1c2Ugc29tZSBicm93c2VycyBjYW5ub3QgbG9hZCBkYXRhLVVSSXMgd2l0aCBYTUxIdHRwUmVxdWVzdC5cbiAgICAgICAgdmFyIGRhdGEgPSBhdG9iKHVybC5zcGxpdCgnLCcpWzFdKTtcbiAgICAgICAgdmFyIGRhdGFWaWV3ID0gbmV3IFVpbnQ4QXJyYXkoZGF0YS5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8ZGF0YS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGRhdGFWaWV3W2ldID0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkZWNvZGVBdWRpb0RhdGEoZGF0YVZpZXcuYnVmZmVyLCBvYmosIHVybCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBsb2FkIHRoZSBidWZmZXIgZnJvbSB0aGUgVVJMXG4gICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZGVjb2RlQXVkaW9EYXRhKHhoci5yZXNwb25zZSwgb2JqLCB1cmwpO1xuICAgICAgICB9O1xuICAgICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGVycm9yLCBzd2l0Y2ggdGhlIHNvdW5kIHRvIEhUTUwgQXVkaW9cbiAgICAgICAgICBpZiAob2JqLl93ZWJBdWRpbykge1xuICAgICAgICAgICAgb2JqLl9idWZmZXIgPSB0cnVlO1xuICAgICAgICAgICAgb2JqLl93ZWJBdWRpbyA9IGZhbHNlO1xuICAgICAgICAgICAgb2JqLl9hdWRpb05vZGUgPSBbXTtcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouX2dhaW5Ob2RlO1xuICAgICAgICAgICAgZGVsZXRlIGNhY2hlW3VybF07XG4gICAgICAgICAgICBvYmoubG9hZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB4aHIuc2VuZCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgeGhyLm9uZXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZWNvZGUgYXVkaW8gZGF0YSBmcm9tIGFuIGFycmF5IGJ1ZmZlci5cbiAgICAgKiBAcGFyYW0gIHtBcnJheUJ1ZmZlcn0gYXJyYXlidWZmZXIgVGhlIGF1ZGlvIGRhdGEuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvYmogVGhlIEhvd2wgb2JqZWN0IGZvciB0aGUgc291bmQgdG8gbG9hZC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHVybCBUaGUgcGF0aCB0byB0aGUgc291bmQgZmlsZS5cbiAgICAgKi9cbiAgICB2YXIgZGVjb2RlQXVkaW9EYXRhID0gZnVuY3Rpb24oYXJyYXlidWZmZXIsIG9iaiwgdXJsKSB7XG4gICAgICAvLyBkZWNvZGUgdGhlIGJ1ZmZlciBpbnRvIGFuIGF1ZGlvIHNvdXJjZVxuICAgICAgY3R4LmRlY29kZUF1ZGlvRGF0YShcbiAgICAgICAgYXJyYXlidWZmZXIsXG4gICAgICAgIGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgICAgIGlmIChidWZmZXIpIHtcbiAgICAgICAgICAgIGNhY2hlW3VybF0gPSBidWZmZXI7XG4gICAgICAgICAgICBsb2FkU291bmQob2JqLCBidWZmZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgb2JqLm9uKCdsb2FkZXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmluaXNoZXMgbG9hZGluZyB0aGUgV2ViIEF1ZGlvIEFQSSBzb3VuZCBhbmQgZmlyZXMgdGhlIGxvYWRlZCBldmVudFxuICAgICAqIEBwYXJhbSAge09iamVjdH0gIG9iaiAgICBUaGUgSG93bCBvYmplY3QgZm9yIHRoZSBzb3VuZCB0byBsb2FkLlxuICAgICAqIEBwYXJhbSAge09iamVjY3R9IGJ1ZmZlciBUaGUgZGVjb2RlZCBidWZmZXIgc291bmQgc291cmNlLlxuICAgICAqL1xuICAgIHZhciBsb2FkU291bmQgPSBmdW5jdGlvbihvYmosIGJ1ZmZlcikge1xuICAgICAgLy8gc2V0IHRoZSBkdXJhdGlvblxuICAgICAgb2JqLl9kdXJhdGlvbiA9IChidWZmZXIpID8gYnVmZmVyLmR1cmF0aW9uIDogb2JqLl9kdXJhdGlvbjtcblxuICAgICAgLy8gc2V0dXAgYSBzcHJpdGUgaWYgbm9uZSBpcyBkZWZpbmVkXG4gICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqLl9zcHJpdGUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBvYmouX3Nwcml0ZSA9IHtfZGVmYXVsdDogWzAsIG9iai5fZHVyYXRpb24gKiAxMDAwXX07XG4gICAgICB9XG5cbiAgICAgIC8vIGZpcmUgdGhlIGxvYWRlZCBldmVudFxuICAgICAgaWYgKCFvYmouX2xvYWRlZCkge1xuICAgICAgICBvYmouX2xvYWRlZCA9IHRydWU7XG4gICAgICAgIG9iai5vbignbG9hZCcpO1xuICAgICAgfVxuXG4gICAgICBpZiAob2JqLl9hdXRvcGxheSkge1xuICAgICAgICBvYmoucGxheSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIHRoZSBzb3VuZCBiYWNrIGludG8gdGhlIGJ1ZmZlciBzb3VyY2UuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvYmogICBUaGUgc291bmQgdG8gbG9hZC5cbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gIGxvb3AgIExvb3AgYm9vbGVhbiwgcG9zLCBhbmQgZHVyYXRpb24uXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBpZCAgICAob3B0aW9uYWwpIFRoZSBwbGF5IGluc3RhbmNlIElELlxuICAgICAqL1xuICAgIHZhciByZWZyZXNoQnVmZmVyID0gZnVuY3Rpb24ob2JqLCBsb29wLCBpZCkge1xuICAgICAgLy8gZGV0ZXJtaW5lIHdoaWNoIG5vZGUgdG8gY29ubmVjdCB0b1xuICAgICAgdmFyIG5vZGUgPSBvYmouX25vZGVCeUlkKGlkKTtcblxuICAgICAgLy8gc2V0dXAgdGhlIGJ1ZmZlciBzb3VyY2UgZm9yIHBsYXliYWNrXG4gICAgICBub2RlLmJ1ZmZlclNvdXJjZSA9IGN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIG5vZGUuYnVmZmVyU291cmNlLmJ1ZmZlciA9IGNhY2hlW29iai5fc3JjXTtcbiAgICAgIG5vZGUuYnVmZmVyU291cmNlLmNvbm5lY3Qobm9kZS5wYW5uZXIpO1xuICAgICAgbm9kZS5idWZmZXJTb3VyY2UubG9vcCA9IGxvb3BbMF07XG4gICAgICBpZiAobG9vcFswXSkge1xuICAgICAgICBub2RlLmJ1ZmZlclNvdXJjZS5sb29wU3RhcnQgPSBsb29wWzFdO1xuICAgICAgICBub2RlLmJ1ZmZlclNvdXJjZS5sb29wRW5kID0gbG9vcFsxXSArIGxvb3BbMl07XG4gICAgICB9XG4gICAgICBub2RlLmJ1ZmZlclNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSBvYmouX3JhdGU7XG4gICAgfTtcblxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBzdXBwb3J0IGZvciBBTUQgKEFzeW5jaHJvbm91cyBNb2R1bGUgRGVmaW5pdGlvbikgbGlicmFyaWVzIHN1Y2ggYXMgcmVxdWlyZS5qcy5cbiAgICovXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBIb3dsZXI6IEhvd2xlcixcbiAgICAgICAgSG93bDogSG93bFxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc3VwcG9ydCBmb3IgQ29tbW9uSlMgbGlicmFyaWVzIHN1Y2ggYXMgYnJvd3NlcmlmeS5cbiAgICovXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLkhvd2xlciA9IEhvd2xlcjtcbiAgICBleHBvcnRzLkhvd2wgPSBIb3dsO1xuICB9XG5cbiAgLy8gZGVmaW5lIGdsb2JhbGx5IGluIGNhc2UgQU1EIGlzIG5vdCBhdmFpbGFibGUgb3IgYXZhaWxhYmxlIGJ1dCBub3QgdXNlZFxuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHdpbmRvdy5Ib3dsZXIgPSBIb3dsZXI7XG4gICAgd2luZG93Lkhvd2wgPSBIb3dsO1xuICB9XG5cbn0pKCk7XG4iXX0=
