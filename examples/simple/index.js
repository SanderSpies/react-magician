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
    }
  },

  '3s': {
    block: {
      top: 0
    }
  }

});

class App {

  render() {
    var animationValues = simpleAnimation.values;
    var blockStyle = animationValues.block || {};
    blockStyle.display =  'inline-block';
    blockStyle.position = 'absolute';
    return <div style={{position: 'relative'}}>
        <div style={blockStyle}>pleh</div>
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

var Pleh = React.createClass(App.prototype);

React.render(<Pleh />, document.getElementById('app'));

simpleAnimation.play();
