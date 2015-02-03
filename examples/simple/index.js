/**
 * @jsx React.DOM
 */
'use strict';

var React           = require('react');
var Animation       = require('react-animation');

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
            easing: 'easeInQuad',
            left: 100
          }
        },
        '400ms': {
          blockA: {
            left: 200
          },
          blockB: {
            left: ()=> { return React.findDOMNode(this.refs.foo).offsetLeft + 200 || 0; }
          }
        },
        '500ms': {
          blockA: {
            top: 150
          },
          blockB: {
            easing: 'fooEasing',
            top: ()=> { return React.findDOMNode(this.refs.foo).offsetTop || 0; }
          }
        },
        '600ms': {
          blockA: {
            width: 100,
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
    </div>;
  }

  componentDidUpdate() {
    if (this.animations.fooBarAnimation.isPlaying) {
      var self = this;
      requestAnimationFrame(function() {
        self.forceUpdate();
      });
    }
  }

  componentDidMount() {
    this.animations.fooBarAnimation.play(this);
  }

}

React.render(<Foo />, document.getElementById('app'));
