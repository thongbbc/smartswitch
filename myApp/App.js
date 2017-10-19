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
      opacityA: new Animated.Value(1),
      animated2:new Animated.Value(0),
      opacityB: new Animated.Value(1),
      colorStateButton:'rgb(69, 237, 18)'
    }
  }
  componentDidMount() {
    const {animated,opacityA,animated2,opacityB} = this.state
    Animated.stagger(500,[
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
      ),
      Animated.loop(
        Animated.parallel([
          Animated.timing(animated2,{
            toValue:1,
            duration:5000
          }),
          Animated.timing(opacityB,{
            toValue:0,
            duration:5000
          })
        ])
      )
    ]).start()
  }
  render() {
    const width = Dimensions.get('window').width
    const height =Dimensions.get('window').height
    const {animated,opacityA,animated2,opacityB,colorStateButton} = this.state
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
            <View style={{height:width/5*4-10,width:width/5*4-10,backgroundColor:'rgba(0,0,0,0)',borderWidth:1,borderColor:'rgba(0,0,0,0.05)',
              borderRadius:width/5*4-10/2,alignItems:'center',justifyContent:'center'
            }}>
              <View style={{height:width/5*4-30,width:width/5*4-30,backgroundColor:'rgba(255,255,255,0.5)',borderWidth:1,borderColor:'rgba(0,0,0,0.05)',
                borderRadius:width/5*4-30/2,alignItems:'center',justifyContent:'center'
              }}>
                <Animated.View style={{height:width/5*4-40,width:width/5*4-40,backgroundColor:colorStateButton,borderWidth:1,borderColor:'rgba(0,0,0,0.08)',
                  borderRadius:(width/5*4-40)/2,alignItems:'center',justifyContent:'center'
                  ,opacity:opacityA,transform:[
                    {
                      scale:animated
                    }
                  ]
                }}>
                  <Animated.View style={{height:width/5*4-40,width:width/5*4-40,backgroundColor:'rgba(0,255,0,0.4)',borderWidth:1,borderColor:'rgba(0,0,0,0.08)',
                    borderRadius:(width/5*4-40)/2,alignItems:'center',justifyContent:'center'
                    ,opacity:opacityB,transform:[
                      {
                        scale:animated2
                      }
                    ]
                  }}/>
                </Animated.View>
                <View style={{position:'absolute',alignItems:'center',justifyContent:'center',width:width/5*4 - 105,height:width/5*4 - 105,borderRadius:width/5*4 - 105/2,
                  backgroundColor:'rgba(0,0,0,0.05)'}}>
                  <LinearGradient colors={['#fdfbfb','#ebedee']} style={{width:width/5*4 - 110,height:width/5*4 - 110
                      ,borderRadius:width/5*4-110/2,justifyContent:'center',alignItems:'center'
                  }}>
                    <Text style={{fontSize:40,backgroundColor:'transparent',color:'rgb(69, 237, 18)'}}>ON</Text>
                  </LinearGradient>
                </View>
              </View>

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
