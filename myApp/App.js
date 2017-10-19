import React from 'react';
import { StyleSheet, Text,TouchableHighlight,Animated, View,Dimensions,Image } from 'react-native';
import {LinearGradient,Constants} from 'expo'

export default class App extends React.Component {
  _onPressChooseDevice() {
    alert('click')
  }
  constructor(props){
    super(props)
    this.state = {
      animated:new Animated.Value(0),
      opacityA: new Animated.Value(1)
    }
  }
  componentDidMount() {
    const {animated,opacityA} = this.state
    Animated.loop(
      Animated.parallel([
        Animated.timing(animated,{
          toValue:1,
          duration:5000
        }),
        Animated.timing(opacityA,{
          toValue:0,
          duration:5000
        })
      ])
    ).start()
  }
  render() {
    const width = Dimensions.get('window').width
    const height =Dimensions.get('window').height
    const {animated,opacityA} = this.state
    return (
      <View style={styles.container}>
        <LinearGradient style={{
            width:Dimensions.get('window').width,
            height:Dimensions.get('window').height}} colors={['#f5f7fa','#c3cfe2']}
            >
          <View>
            <View style={styles.statusBar} />
            <View style={{flexDirection:'row',padding:10,justifyContent:'center'}}>
              <View style={{justifyContent:'center'}}>
                <Image style={{height:20,width:20}} resizeMode='cover' source={require('./icon/drawer.png')}/>
              </View>
              <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <TouchableHighlight style={{height:null,width:null}} onPress={this._onPressChooseDevice.bind(this)}>
                  <View style={{flex:1,justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
                    <View style={{justifyContent:'center',alignItems:'center'}}>
                      <Text style={{fontSize:15,fontWeight:'bold',backgroundColor:'transparent'}}>KitChen</Text>
                      <Text style={{fontSize:10,color:'rgba(0,0,0,0.2)',fontWeight:'normal',backgroundColor:'transparent'}}>Oven</Text>
                    </View>
                    <Image style={{left:5,width:10,height:10}} source={require('./icon/regtangle.png')}/>
                  </View>
                </TouchableHighlight>
              </View>
              <View style={{justifyContent:'center',alignItems:'flex-end'}}>
                <View style={{shadowRadius: 10,shadowOpacity: 0.15,backgroundColor:'white',borderRadius:5,height:20,width:20,justifyContent:'center',alignItems:'center'}}>
                  <Image style={{height:10,width:10}} resizeMode='cover' source={require('./icon/plus.png')}/>
                </View>
              </View>
            </View>
          </View>


          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <View style={{height:width/5*4,width:width/5*4,backgroundColor:'rgba(0,0,0,0)',borderWidth:1,borderColor:'rgba(0,0,0,0.05)',
              borderRadius:width/5*4/2,alignItems:'center',justifyContent:'center'
            }}>
              <Animated.View style={{height:width/5*4-40,width:width/5*4-40,backgroundColor:'red',borderWidth:1,borderColor:'rgba(0,0,0,0.08)',
                borderRadius:(width/5*4-40)/2,alignItems:'center',justifyContent:'center'
                ,opacity:opacityA,transform:[
                  {
                    scale:animated
                  }
                ]
              }}>
                <LinearGradient  colors={['#EC6F66','#F3A183']} style={{justifyContent:'center',alignItems:'center',height:width/5*4-40,width:width/5*4-40,borderRadius:(width/5*4-40)/2}}>
                  <View style={{width:width/5*4 - 80,height:width/5*4 - 80
                      ,borderRadius:width/5*4-80/2,backgroundColor:'white'
                  }}>

                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewUnderLinear: {
    flex:1,
    backgroundColor:'#000'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBar: {
    backgroundColor: "transparent",
    height: Constants.statusBarHeight,
  }
});
