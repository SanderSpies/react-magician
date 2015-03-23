/**
 * @jsx React.DOM
 */
'use strict';

var React           = require('react');
var Animation       = require('react-magician');
var EasingTypes     = Animation.EasingTypes;

class Foo extends React.Component {

  constructor() {
    this.scheduledAnimation = false;

    this.state = {
      isPlaying: false
    };

    this.animations = {
      fooBarAnimation: Animation.create({
        '0ms': {
          blockA: {
            left: 0,
            position: 'absolute',
            top: 0,
            width: 200,
            transform: 'rotate(0deg)'
          },
          blockB: {
            left: 0
          }
        },
        'a: ?ms': {
          blockA: {
            left: 100,
            transform: 'rotate(90deg)',
            easing: EasingTypes.spring({
              mass: 1,
              spring: 30,
              damping: 4
            })
          }
        },
        '400ms': {
          blockA: {
            top: 30
          }
        },
        'b: ?ms': {
          blockB: {
            left: 1000,
            easing: EasingTypes.spring({
              mass: 1,
              spring: 50,
              damping: 3
            })
          }
        },
        'a + 100ms': {
          blockA: {
            left: 20
          }
        },
        'a + 2000ms': {
          blockA: {
            left: 100//,
            //TODO: make this work top: 0
          }
        },
        'b + 200ms': {
          blockB: {
            left: 100
          }
        }
        //'3000ms': {
        //  blockA: {
        //    top: -300
        //  }
        //}
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
      if (this.scheduledAnimation) {
       // return;
      }
      var self = this;
      this.scheduledAnimation = true;
      requestAnimationFrame(function() {
        self.scheduledAnimation = false;
        self.forceUpdate();
      });
    }
  }

}

React.render(<Foo />, document.getElementById('app'));
