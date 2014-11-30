/**
 * @jsx React.DOM
 */
'use strict';

var React = require('react');
var ReactAnimation = require('react-animation');

var simpleAnimation = ReactAnimation({

  _0ms: {
    block: {
      left: 0,
      strategy: ReactAnimation.lineair // default
    }
  },

  _1000ms: {
    block: {
      left: 200
    }
  }

});

class App {

  render() {
    var blockStyle = simpleAnimation.block || {};
    blockStyle.display =  'inline-block';
    blockStyle.position = 'absolute';
    return <div style={{position: 'relative'}}>
        <div style={blockStyle}>pleh</div>;
        <div>
          <button onClick={this.onPlayClick}>Play</button>
          <button onClick={this.onPauseClick}>Pause</button>
        </div>
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
