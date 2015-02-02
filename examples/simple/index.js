/**
 * @jsx React.DOM
 */
'use strict';

var React           = require('react');
var ReactAnimation  = require('react-animation');

// temporary, should be solved using new React Style
var assign          = require('./assign');

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
            left: 0
          }
          blockB {
            left: 0
          }
        }
        100ms easeInQuad {
          blockA {
            left: 200
          }
        }
        400ms {
          blockA {
            left: 400
          }
          blockB {
            left: exec('React.findDOMNode(this.refs.foo).offsetLeft + 200|| 0')
          }
        }
      `
    };
  }

  render() {
    var fooBarAnimationValues = this.animations.fooBarAnimation.values(this);
    return <div>
      <div style={assign({position: 'relative', width: 200, height: 200, backgroundColor: 'orange'}, fooBarAnimationValues.blockA)} ref="foo">

      </div>
      <div style={assign({position:'relative', width: 200, height: 200, backgroundColor: 'purple'}, fooBarAnimationValues.blockB)}>

      </div>
    </div>;
  }

  componentDidUpdate() {
    if (this.animations.fooBarAnimation.isPlaying) {
      var self = this;
      requestAnimationFrame(function(){
        self.forceUpdate()
      });
    }
  }

  componentDidMount() {
    this.animations.fooBarAnimation.play(this);
  }

}

React.render(<Foo />, document.getElementById('app'));
