/**
 * @jsx React.DOM
 */
'use strict';

var React           = require('react');
var ReactAnimation  = require('react-animation');

var Animation       = ReactAnimation.Animation;

class Foo extends React.Component {

  constructor() {

    /*ReactAnimation.registerEasing({customFunc: null}, function(t, b, _c, d){
      var c = _c - b;
      return c * (t /= d) * t + b;
    });*/

    this.animations = {
      fooBarAnimation: Animation`
        0ms {
          blockA {
            left: 0 1 2 3
            top:  20
          }
          blockB {
            left: 200
            top:  300
          }
        }
        100ms {
          blockA easeIn {
            left: 200
            top:  500
          }
        }
        200ms {
          blockA {
            left: 30
            top:  exec('React.findDOMNode(this).scrollHeight - 300 : 0')
          }
          blockB {
            left: 0
            top:  exec('React.findDOMNode(this).scrollHeight - 100 : 20')
          }
        }
      `
    };
  }

  render() {
    var fooBarAnimationValues = this.animations.fooBarAnimation.values(this);
    return <div>
      <div style={fooBarAnimationValues.blockA}>

      </div>
      <div style={fooBarAnimationValues.blockB}>

      </div>
    </div>;
  }

  onClick() {
    this.animations.fooBarAnimation.play();
  }

  componentDidUpdate() {
    if (this.animations.fooBarAnimation.isPlaying) {
      requestAnimationFrame(this.forceUpdate);
    }
  }

}

React.render(<Foo />, document.getElementById('app'));
