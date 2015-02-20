/**
 * @jsx React.DOM
 */
'use strict';

var React           = require('react');
React.initializeTouchEvents(true);
var Animation       = require('react-magician');

class Foo extends React.Component {

  constructor() {

    Animation.registerEasing('fooEasing', function(t, b, _c, d){
      var c = _c - b;
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
    });

    this.state = {
      isPlaying: false
    };

    this.startY = -1;

    this.animations = {
      fooBarAnimation: Animation.create({
        '0px': {
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
        '100px': {
          blockA: {
            easing: 'easeInQuad',
            left: 100
          }
        },
        '400px': {
          blockA: {
            left: 50
          },
          blockB: {
            left: ()=> { return React.findDOMNode(this.refs.foo).offsetLeft + 50; }
          }
        },
        '500px': {
          blockA: {
            top: 100,
            width: 50,
            transform: 'rotate(90deg)'
          },
          blockB: {
            easing: 'fooEasing',
            top: ()=> React.findDOMNode(this.refs.foo).offsetTop
          }
        }
      })
    };
  }

  render() {
    var fooBarAnimationValues = this.animations.fooBarAnimation.values(this);
    return <div className="main">
      <div className="simple1" style={fooBarAnimationValues.blockA} ref="foo">
      </div>
      <div className="simple2" style={fooBarAnimationValues.blockB}  onTouchStart={(e) => this.onTouchStart(e)} onTouchMove={(e) => this.onTouchMove(e)}>
      </div>
    </div>;
  }

  onTouchStart(e) {
    this.startY = e.touches[0].clientY;
  }

  onTouchMove(e) {
    var pos = e.touches[0].clientY - this.startY;
    console.log('foo:', e.touches[0], e.touches[0].clientY, this.startY, pos);
    this.animations.fooBarAnimation.moveTo(pos);
    this.forceUpdate();
  }

  onTouchEnd(e) {
    this.endY = e.touches[0].clientY;
  }

}

React.render(<Foo />, document.getElementById('app'));
