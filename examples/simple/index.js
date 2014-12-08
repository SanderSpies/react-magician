/**
 * @jsx React.DOM
 */
'use strict';

var ReactStyle =      require('react-style');

var React =           require('react');
var assign =          require('react/lib/Object.assign');
var ReactAnimation =  require('react-animation');
var Shadow =          require('react-material/components/Shadow');
var Colors =          require('react-material/style/Colors');
var AppBar =          require('react-material/components/AppBar');

//var EasingTypes = require('react-animation/lib/EasingTypes');


class App {

  render() {
    var animationValues = TileStyles.expandAnimation.values;
    var tileStyle = animationValues.tileStyle || {};
    var tileShadowStyle = animationValues.tileShadowStyle || {};
    var othersStyle = animationValues.othersStyle;



    return <div style={{position: 'relative'}}>
        <AppBar onNavButtonClick={this.onNavButtonClick}  styles={{normalAppBarStyle: ReactStyle(othersStyle)}} />
        <div>
          <div styles={[TileStyles.normalStyle, ReactStyle(tileStyle)]}  onClick={this.onTileClick}>
            <Shadow size={1} styles={ReactStyle(tileShadowStyle)} />
          </div>
          <div styles={[TileStyles.replacementStyle, ReactStyle(animationValues.replacementStyle)]} />
          <div styles={[TileStyles.normalStyle, ReactStyle(othersStyle)]}>
            <Shadow size={1} />
          </div>
          <div styles={[TileStyles.normalStyle, ReactStyle(othersStyle)]}>
            <Shadow size={1} />
          </div>
          <div styles={[TileStyles.normalStyle, ReactStyle(othersStyle)]}>
            <Shadow size={1} />
          </div>
          <div styles={[TileStyles.normalStyle, ReactStyle(othersStyle)]}>
            <Shadow size={1} />
          </div>
          <div styles={[TileStyles.normalStyle, ReactStyle(othersStyle)]}>
            <Shadow size={1} />
          </div>
          <div styles={[TileStyles.normalStyle, ReactStyle(othersStyle)]}>
            <Shadow size={1} />
          </div>
          <div styles={[TileStyles.normalStyle, ReactStyle(othersStyle)]}>
            <Shadow size={1} />
          </div>
        </div>
      </div>;
  }

  onNavButtonClick(){

  }

  onTileClick() {
    TileStyles.expandAnimation.play();
  }

  componentDidMount() {
    var self = this;
    TileStyles.expandAnimation.onAnimationFrame(function(){
      self.forceUpdate();
    });
  }
}

var TileStyles = {

  replacementStyle: ReactStyle({
    display: 'inline-block'
  }),

  normalStyle: ReactStyle({
    height:           200,
    width:            200,
    display:          'inline-block',
    position:         'relative',
    backgroundColor:  Colors.purple.P300,
    margin:           2
  }),

  expandAnimation: ReactAnimation({

    '0ms': {

      tileStyle: {
        borderRadius:   '0%',
        width:          200,
        height:         200,
        marginTop:      0,
        marginLeft:     0,
        marginBottom:   0,
        marginRight:    0,
        position:       'absolute',
        top:            '0%'
      },

      replacementStyle: {
        position: 'relative',
        width: '204px',
        height: '204px'
      },

      tileShadowStyle: {
        borderRadius: '0%'
      },

      othersStyle: {
        opacity: 1
      }
    },

    '200ms': {

      tileStyle: {
        borderRadius: '100%',
        width: 60,
        height: 60,
        marginLeft: 70,
        marginTop: 70,
        left:           '0%',
        zIndex: 40
      },

      tileShadowStyle: {
        borderRadius: '100%'
      },

      othersStyle: {
        opacity: 1
      }

    },

    '400ms': {

      tileStyle: {
        left:         '50%',
        marginLeft:    -30,
        top:      '0%'
      }

    },

    '500ms': {

      tileStyle: {
        top:            '-50%'
      },

      othersStyle: {
        opacity: 0
      }

    }
    //
    //'900ms': {
    //
    //  tileStyle: {
    //    width: 800,
    //    height: 800,
    //    marginLeft: -400,
    //    marginTop: -400,
    //    opacity: 1
    //  },
    //
    //  tileShadowStyle: {
    //    borderRadius: 800,
    //    opacity: 1
    //  }
    //
    //},

    //'1200ms': {
    //
    //  tileStyle: {
    //    opacity : 0
    //  },
    //
    //  tileShadowStyle: {
    //    opacity: 0
    //  }
    //
    //}

  })
};

var Foo = React.createClass(App.prototype);

React.render(<Foo />, document.getElementById('app'));
