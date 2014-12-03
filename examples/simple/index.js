/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react');
var ReactAnimation = require('react-animation');
//var EasingTypes = require('react-animation/lib/EasingTypes');

var simpleAnimation = ReactAnimation({

  '0ms': {
    block: {
      left: 0,
      easing: function() {
        console.log('rarara');
      }
    },

    block2: {
      left: 100
    }
  },

  '1s': {
    block: {
      left: 200,
      top: 0
    }
  },

  '2s': {
    block: {
      top: 100
    },

    block2: {
      left: 300,
      top: 0
    }
  },

  '3s': {
    block: {
      top: 0
    }
  },

  '4s': {
    block2: {
      top: 200
    }
  }

});

class App {

  render() {
    var animationValues = simpleAnimation.values;
    var blockStyle = animationValues.block || {};
    blockStyle.display =  'inline-block';
    blockStyle.position = 'absolute';
    var blockStyle2 = animationValues.block2 || {};
    blockStyle2.display =  'inline-block';
    blockStyle2.position = 'absolute';
    return <div style={{position: 'relative'}}>
        <div style={blockStyle}>foo</div>
        <div style={blockStyle2}>foo</div>
      </div>;
  }

  onPlayClick() {
    simpleAnimation.play();
  }

  onPauseClick() {
    simpleAnimation.pause();
  }

  componentDidMount() {
    var self = this;
    simpleAnimation.onAnimationFrame(function(){
      self.forceUpdate();
    });
  }
}

var Foo = React.createClass(App.prototype);

React.render(<Foo />, document.getElementById('app'));

simpleAnimation.play();
