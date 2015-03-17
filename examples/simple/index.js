/**
 * @jsx React.DOM
 */
'use strict';

var React           = require('react');
var Animation       = require('react-magician');
var EasingTypes     = Animation.EasingTypes;

class Foo extends React.Component {

  constructor() {

    function fooEasing(t, b, c, d){
        var c = c - b;
        if ((t /= d) < (1 / 2.75)) {
          return c * (7.5625 * t * t) + b;
        }
        else if (t < (2 / 2.75)) {
          return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        }
        else if (t < (2.5 / 2.75)) {
          return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        }
        else {
          return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    }

    this.state = {
      isPlaying: false
    };

    this.animations = {
      fooBarAnimation: Animation.create({
        '0ms': {
          blockA: {
            left: 0,
            top: 0,
            width: 0,
            transform: 'rotate(0deg)'
          },
          blockB: {
            left: 0,
            top: 0
          }
        },
        '100ms': {
          blockA: {

            left: 100
          }
        },
        '400ms': {
          blockA: {
            left: 200
          },
          blockB: {
            left: ()=> { return React.findDOMNode(this.refs.foo).offsetLeft + 200; }
          }
        },
        '500ms': {
          blockA: {
            top: 150
          },
          blockB: {
            easing: fooEasing,
            top: ()=> React.findDOMNode(this.refs.foo).offsetTop
          }
        },
        '6000ms': {
          blockA: {
            easing: EasingTypes.spring({
              mass:     2,
              spring:   200,
              damping:  3
            }),
            width: 400,
            transform: 'rotate(90deg)'
          }
        }
      })
    };
  }

  render() {
    var fooBarAnimationValues = this.animations.fooBarAnimation.values(this);
    return <div>
      <div className="simple1" style={fooBarAnimationValues.blockA} ref="foo">
      </div>
      <div className="simple2" style={fooBarAnimationValues.blockB}>
      </div>
      <div  style={{position:'relative', top: 300}}>
        <button onClick={(e) => this.onPlayPauseButtonClick(e)}>
          Play/Pause
        </button>
        <button onClick={(e) => this.onResetClick(e)}>
          Reset
        </button>
        <button onClick={(e) => this.onRewindClick(e)}>
          Rewind
        </button>
        Speed: <input ref="speed" defaultValue="1" />
        <input type="range" ref="position" onChange={(e) => this.onPositionChange(e)} min="0" defaultValue="0" max="300" />
      </div>
    </div>;
  }

  onPositionChange(e) {
    var position = parseInt(e.target.value, 10);
    var fooBarAnimation = this.animations.fooBarAnimation;
    fooBarAnimation.moveTo(position);
    this.forceUpdate();
  }

  onPlayPauseButtonClick() {
    var fooBarAnimation = this.animations.fooBarAnimation;
    // doesn't work properly yet
    fooBarAnimation.setSpeed(React.findDOMNode(this.refs.speed).value);
    var state = this.state;
    if (!state.isPlaying) {
      fooBarAnimation.play();
    }
    else {
      fooBarAnimation.pause();
    }

    state.isPlaying = !state.isPlaying;
    this.forceUpdate();
  }

  onRewindClick() {
    // doesn't work yet
    this.animations.fooBarAnimation.rewind();
  }

  onResetClick() {
    this.animations.fooBarAnimation.reset();
    this.forceUpdate();
  }

  componentDidUpdate() {
    if (this.animations.fooBarAnimation.isPlaying) {
      var self = this;
      requestAnimationFrame(function() {
        self.forceUpdate();
      });
    }
  }

}

React.render(<Foo />, document.getElementById('app'));
