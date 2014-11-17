/**
 * @jsx React.DOM
 */
'use strict';

// TODO: how to support custom Animation strategies like rebound-js

var dropBallAnimation = ReactAnimation({

  '0.1s': {

    ball : {
      bottom: 100,
      left: 10
    }

  },

  '0.2s': {

    ball: {
      bottom: 0,
      left: 30
    }

  },

  '0.3s': {

    ball: {
      bottom: 80,
      left: 50
    }

  }

});

class Something {

  render() {
    var animationFrame = dropBallAnimation.nextAnimationFrame();
    return <div styles={animationFrame.ball}>

    </div>;
  }

  componentDidUpdate() {
    requestAnimationFrame(this.render);
  }

  onPauseClick() {
    dropBallAnimation.pause();
  }

  onContinueClick() {
    dropBallAnimation.continue();
  }

}

