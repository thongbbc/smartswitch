import React from 'react';
import {AsyncStorage,TextInput,Button,Platform,Modal, StyleSheet, Text,TouchableHighlight,Animated,FlatList,View,Dimensions,Image,Keyboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {StackNavigator,DrawerNavigator} from 'react-navigation'
import { Client, Message } from 'react-native-paho-mqtt';
import Smartconfig from 'react-native-smartconfig';





//Set up an in-memory alternative to global localStorage
const myStorage = {
  setItem: (key, item) => {
    myStorage[key] = item;
  },
  getItem: (key) => myStorage[key],
  removeItem: (key) => {
    delete myStorage[key];
  },
};







class MyNotificationsScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'Notifications',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('./icon/drawer.png')}
        style={{height:24,width:24}}
      />
    ),
  };

  render() {
    return (
      <View style={{flex:1}}>
      <Button
        onPress={() => this.props.navigation.goBack()}
        title="Go back home"
      />
    </View>
    );
  }
}

class MainScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'MainScreen',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('./icon/drawer.png')}
        style={{height:24,width:24}}
      />
    ),
  };
  constructor(props){
    super(props)
    this.state = {
      animated:new Animated.Value(0),
      opacityA: new Animated.Value(1),
      animated2:new Animated.Value(0),
      opacityB: new Animated.Value(1),
      colorStateButton:'rgb(69, 237, 18)',
      stateButton:true,
      dataSource:[
        {name:'thong',check:'white'},
        {name:'thong',check:'transparent'},
        {name:'thong',check:'transparent'}
      ],
      modalVisible:false,
      ssid:'',
      passwifi:'',
      nameDevice:'',
      listDevice:[{macid:'123',nameDevice:'KitChen'},
                  {macid:'123',nameDevice:'BedRoom'},
                  {macid:'123',nameDevice:'Toilet'}
      ],
      selectedDevice:'NULL',
      modalVisible2:false
    }
    this.client = new Client({ uri: 'ws://iot.eclipse.org:80/ws', clientId: 'clientId', storage: myStorage });
    this.client.on('connectionLost', (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log(responseObject.errorMessage);
      }
    });
    this.client.on('messageReceived', (message) => {
      console.log(message.payloadString);
      const json = JSON.parse(message.payloadString)
      if(json.FUNC != 'Error'){
        if (json.FUNC == 'Data') {
          if (json.DATA == 'On') {
            this.setState({stateButton:true,colorStateButton:'rgb(69, 237, 18)'})
          } else {
            this.setState({stateButton:false,  colorStateButton:'red'})
          }
        } else if(json.FUNC == 'Ctrl') {
          if (json.DATA == 'On') {
            this.setState({stateButton:true,colorStateButton:'rgb(69, 237, 18)'})
          } else {
            this.setState({stateButton:false,  colorStateButton:'red'})
          }
        }
      } else {
        alert("ERROR CAN NOT CONTROL")
      }
    });
  }
  async _getDataWhenStartApp() {
    try {
      const value = await AsyncStorage.getItem('devices');
      if (value !== null){
        const convertedJson = JSON.parse(value)
        console.log(JSON.stringify(convertedJson))
        this.setState({
          listDevice:convertedJson,
          selectedDevice:convertedJson[0].nameDevice
        })
        // connect the client
        const topic = 'ESP'+convertedJson[0].macid+'/'
        this.client.connect()
          .then(() => {
            console.log('onConnect');
            const send = topic + 'slave'
            return this.client.subscribe(send);
          })
          .then(() => {
            const jsonUpdateState={ID:'ESP'+convertedJson[0].macid,
              FUNC:"Data",ADDR:"1",DATA:"OFF"}
            const message = new Message(JSON.stringify(jsonUpdateState));
            message.destinationName = topic+'master';
            this.client.send(message);
          })
          .catch((responseObject) => {
            if (responseObject.errorCode !== 0) {
              console.log('onConnectionLost:' + responseObject.errorMessage);
            }
          });
      } else {
        this.client.connect()
          .then(() => {
            console.log('onConnect');
          })
      }
    } catch (error) {
      alert("STORAGE ERROR")
    }
  }
  async _getDataListDeviceParent() {
    try {
      const value = await AsyncStorage.getItem('devices');
      if (value !== null){
        const convertedJson = JSON.parse(value)
        console.log(JSON.stringify(convertedJson))
        this.setState({
          listDevice:convertedJson
        })
      }
    } catch (error) {
      alert("STORAGE ERROR")
    }
  }
  _onPressChooseDevice(index) {
    dulieu = []
    const {dataSource} = this.state
    dataSource.map((value,index2) =>{
      if (index2 == index ){
        value.check='rgba(0,0,0,0.5)'
        dulieu.push(value)
      } else {
        value.check='transparent'
        dulieu.push(value)
      }
    })
    this.setState({dataSource:dulieu})
  }
  _renderItem(index,item) {
    const height =Dimensions.get('window').height
    const width = Dimensions.get('window').width
    return(
      <View>
        <TouchableHighlight onPress={this._onPressChooseDevice.bind(this,index)}>
          <View style={{height:height/9 - 5,backgroundColor:item.check
            ,justifyContent:'center',alignItems:'center',borderRadius:5
            ,width:width/5,padding:10}}>
            <Text style={{fontSize:8,color:'white',backgroundColor:'transparent'}}>{item.name}</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
  componentDidMount() {
    const {animated,opacityA,animated2,opacityB} = this.state
    Animated.stagger(1000,[
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
    this._getDataWhenStartApp()




  }
  _onPressClickItem() {
    // this.setState({
    //   stateButton:!this.state.stateButton
    // })
    // if (this.state.stateButton== true) {
    //   this.setState({
    //     colorStateButton:'rgb(69, 237, 18)'
    //   })
    // } else {
    //   this.setState({
    //     colorStateButton:'red'
    //   })
    // }
    var state = 'Off'
    const {stateButton,listDevice} = this.state
    if (stateButton == true) {
      state = 'Off'
    } else {
      state = 'On'
    }
    const jsonUpdateState={ID:'ESP'+listDevice[0].macid,
      FUNC:"Ctrl",ADDR:"1",DATA:state}
    const message = new Message(JSON.stringify(jsonUpdateState));
    const topic = 'ESP'+listDevice[0].macid+'/'
    message.destinationName = topic+'master';
    this.client.send(message);
  }
  _renderConfigScreen() {
    const width = Dimensions.get('window').width
    const height =Dimensions.get('window').height
    return (
      <View style = {{flex:1,position:'absolute'}}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {alert("Modal has been closed.")}}>
          <TouchableHighlight underlayColor='transparent'
            onPress={this._onPressCancelConfig.bind(this)} style={{flex:1}}>
            <View style={{
              flex:1,backgroundColor:'rgba(0,0,0,0.3)',alignItems:'center',
            justifyContent:'center'}}>
              <TouchableHighlight underlayColor='rgba(0,0,0,0)' onPress = {()=>Keyboard.dismiss()}>
              <View style={{padding:10,borderRadius:10,
                  height:height/2+height/10,width:width/2+width/5,
                  backgroundColor:'white'}}>
                <Text style={{backgroundColor:'green',width:width/2+width/5-20,
                textAlign:'center',padding:5,
                fontWeight:'800',fontSize:20,color:'white'}}>Cài Đặt</Text>
                <View style={{marginBottom:20,width:width/2+width/5-20
                  ,marginTop:20,flex:1,alignItems:'center'}}>
                  <Image style={{flex:1}} resizeMode='contain' source={require('./icon/setting.png')}/>
                </View>
                <TextInput
                  placeholder="SSID"
                  style={{padding:10,height: 40,marginBottom:5, borderColor: 'gray',
                  borderWidth: 1,borderColor: 'rgba(0,0,0,0.3)',borderRadius:5}}
                  onChangeText={(text) => this.setState({ssid:text})}
                  value={this.state.ssid}
                />
                <TextInput
                  placeholder="PASSWORD WIFI"
                  style={{borderRadius:5,padding:10,height: 40,marginBottom:5,
                  borderColor: 'rgba(0,0,0,0.3)', borderWidth: 1}}
                  onChangeText={(text) => this.setState({passwifi:text})}
                  value={this.state.passwifi}
                />
                <TextInput
                  placeholder="NAME DEVICE"
                  style={{borderRadius:5,padding:10,height: 40,
                  borderColor: 'rgba(0,0,0,0.3)', borderWidth: 1}}
                  onChangeText={(text) => this.setState({nameDevice:text})}
                  value={this.state.nameDevice}
                />
              <View style={{marginTop:10,width:width/2 + width/5 - 20,
                flexDirection:'row'}}>
                  <TouchableHighlight
                    onPress={this._onPressConfig.bind(this)}>
                    <View style={{backgroundColor:'white',
                      width:(width/2 + width/5)/2-10,height:35,padding:5}}>
                      <Text style={{fontWeight:'bold',color:'#1169f7',textAlign:'center',flex:1}}>Đồng Ý</Text>
                    </View>
                  </TouchableHighlight>
                  <TouchableHighlight onPress={this._onPressCancelConfig.bind(this)}>
                    <View style={{backgroundColor:'white',
                      width:(width/2 + width/5)/2-10,height:35,padding:5}}>
                      <Text style={{fontWeight:'bold',color:'red',textAlign:'center',flex:1}}>Hủy</Text>
                    </View>
                  </TouchableHighlight>
                </View>
              </View>
              </TouchableHighlight>
            </View>
          </TouchableHighlight>
        </Modal>
      </View>
    )
  }
  _onPressShowConfig() {
    this.setState({
      modalVisible:true
    })
  }
  _onPressConfig() {
    const {ssid,password,nameDevice} = this.state
    if (ssid != '' && password !='' && nameDevice != '') {
    //   Smartconfig.start({
    //     type: 'esptouch', //or airkiss, now doesn't not effect
    //     ssid: ssid,
    //     bssid: 'filter-device', //"" if not need to filter (don't use null)
    //     password: password,
    //     timeout: 50000 //now doesn't not effect
    //   }).then(function(results){
    //     //Array of device success do smartconfig
    //     console.log(results);
    //     alert(JSON.stringify(results))
    //     /*[
    //       {
    //         'bssid': 'device-bssi1', //device bssid
    //         'ipv4': '192.168.1.11' //local ip address
    //       },
    //       {
    //         'bssid': 'device-bssi2', //device bssid
    //         'ipv4': '192.168.1.12' //local ip address
    //       },
    //       ...
    //     ]*/
    //   }).catch(function(error) {
    //     alert('CANNOT CONFIG THIS DEVICE')
    //   });
      this._saveDeviceToStorage(ssid,nameDevice)
    } else {
        alert('PLEASE CHECK YOUR SSID OR PASSWORD,NAME DEVICE!')
    }
  }
  async _saveDeviceToStorage(macid,deviceName) {
    try {
      const value = await AsyncStorage.getItem('devices');
      if (value !== null){
        var convertedJson = JSON.parse(value)
        var subJson = {macid:macid,nameDevice:deviceName}
        convertedJson.push(subJson)
        alert(JSON.stringify(convertedJson))
        try {
          await AsyncStorage.setItem('devices', JSON.stringify(convertedJson));
        } catch (error) {
          // Error saving data
        }
      } else {
        var createJson = []
        var subJson = {'macid':macid,'nameDevice':deviceName}
        createJson.push(subJson)
        try {
          await AsyncStorage.setItem('devices', JSON.stringify(createJson));
        } catch (error) {
          // Error saving data
        }
        this._getDataListDeviceParent()
      }
    } catch (error) {
      var createJson = []
      var subJson = {'macid':macid,'nameDevice':deviceName}
      createJson.push(subJson)
      try {
        await AsyncStorage.setItem('devices', createJson.toString());
      } catch (error) {
        // Error saving data
      }
      this._getDataListDeviceParent()
    }
  }
  _onPressCancelConfig() {
    this.setState({
      modalVisible:false,
      ssid:'',
      passwifi:'',
      nameDevice:''
    })
    Keyboard.dismiss()
  }
  _onPressCancelListDevice() {
    this.setState({modalVisible2:false})
  }
  _onPressListDevice() {
    this.setState({modalVisible2:true})
    this._getDataListDeviceParent()
  }
  _onPressChooseParentDevice(item) {
    const {listDevice,selectedDevice} = this.state
    this.setState({selectedDevice:item.nameDevice})
    listDevice.map((value)=>{
      if (value.nameDevice == selectedDevice ) {
        var topic = 'ESP'+value.macid+'/'
        var topic2 = 'ESP'+item.macid+'/'
        const send = topic + 'slave'
        const sub = topic2+'slave'
        this.client.unsubscribe(send)
        this.client.subscribe(sub)

        const jsonUpdateState={ID:'ESP'+item.macid,
          FUNC:"Data",ADDR:"1",DATA:"OFF"}
        const message = new Message(JSON.stringify(jsonUpdateState));
        message.destinationName = topic2+'master';
        this.client.send(message);
      }
    })
    this._onPressCancelListDevice()
  }
  _renderItemDevice(index,item) {
    const height =Dimensions.get('window').height
    const width = Dimensions.get('window').width
    const color = index%2==0?'transparent':'transparent'
    return(
      <View>
        <TouchableHighlight onPress={this._onPressChooseParentDevice.bind(this,item)}>
          <View style={{height:50,backgroundColor:color
            ,justifyContent:'center',alignItems:'center'
            ,width:width/2+width/4,padding:10}}>
            <Text style={{flex:1,textAlign:'center',fontSize:17,
              backgroundColor:'transparent',color:'white'}}>{item.nameDevice}</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
  _renderListDevice() {
    const width = Dimensions.get('window').width
    const height =Dimensions.get('window').height
    const {listDevice} = this.state
    return (
      <View style = {{flex:1,position:'absolute'}}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible2}
          onRequestClose={() => {alert("Modal has been closed.")}}>
          <TouchableHighlight underlayColor='rgba(0,0,0,0)' onPress={this._onPressCancelListDevice.bind(this)} style={{flex:1}}>
            <View style={{
              flex:1,backgroundColor:'rgba(0,0,0,0.3)',alignItems:'center',
            justifyContent:'center'}}>
            <TouchableHighlight underlayColor='rgba(0,0,0,0)'>
              <View style={{borderRadius:10,backgroundColor:'rgba(255,255,255,0.5)',height:height/2,width:width/2+width/4}}>
                <FlatList style={{backgroundColor:'rgba(0,0,0,0.8)',borderRadius:10,width:width/2+width/4,height:height/2}}
                  data={listDevice}
                  keyExtractor= {(x,i) => i}
                  renderItem={({index,item})=>this._renderItemDevice(index,item)}
                  />
              </View>
            </TouchableHighlight>
            </View>
          </TouchableHighlight>
        </Modal>
      </View>
    )
  }
  render() {
    const width = Dimensions.get('window').width
    const height =Dimensions.get('window').height
    const {dataSource,animated,opacityA,animated2,opacityB,colorStateButton,stateButton} = this.state
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FC466B','#3F5EFB']}
          style={{
            borderWidth:0,
            width:Dimensions.get('window').width,
            height:Dimensions.get('window').height}}
            >
          <View style={{marginBottom:30}}>
            <View style={Platform.OS=='ios'?styles.statusBar:styles.statusBar2} />
            <View style={{flexDirection:'row',height:null,padding:10,justifyContent:'center'}}>
              <View style={{justifyContent:'center'}}>
                <TouchableHighlight onPress = {() => {this.props.navigation.navigate('DrawerToggle')}}>
                  <Image style={{height:20,width:20}} resizeMode='cover' source={require('./icon/drawer.png')}/>
                </TouchableHighlight>
              </View>
              <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <TouchableHighlight style={Platform.OS=='ios'?styles.height1:styles.height2} underlayColor='transparent' onPress={this._onPressListDevice.bind(this)}>
                  <View style={{flex:1,justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
                    <View style={{justifyContent:'center',alignItems:'center'}}>
                      <Text style={{fontSize:15,fontWeight:'bold',color:'white',backgroundColor:'transparent'}}>{this.state.selectedDevice}</Text>
                      <Text style={{fontSize:10,color:'rgba(255,255,255,0.8)',fontWeight:'normal',backgroundColor:'transparent'}}>{this.state.selectedDevice}</Text>
                    </View>
                    <Image style={{left:5,width:10,height:10}} source={require('./icon/regtangle.png')}/>
                  </View>
                </TouchableHighlight>
              </View>
              <View style={{justifyContent:'center',alignItems:'flex-end'}}>
                <TouchableHighlight onPress={this._onPressShowConfig.bind(this)}>
                <View  style={{shadowRadius: 10,shadowOpacity: 0.15,backgroundColor:'white',borderRadius:5,height:20,width:20,justifyContent:'center',alignItems:'center'}}>
                  <Image style={{height:10,width:10}} resizeMode='cover' source={require('./icon/plus.png')}/>
                </View>
                </TouchableHighlight>
              </View>
            </View>
          </View>

          <View style={{paddingTop:70,paddingBottom:70,flex:1,justifyContent:'center',alignItems:'center'}}>
            <View style={{height:width/5*4-10,width:width/5*4-10,backgroundColor:'rgba(0,0,0,0)',borderWidth:1,borderColor:'rgba(0,0,0,0.07)',
              borderRadius:width/5*4-10/2,alignItems:'center',justifyContent:'center'
            }}>
              <View style={{height:width/5*4-50,width:width/5*4-50,backgroundColor:'rgba(255,255,255,0.5)',borderWidth:1,borderColor:'rgba(0,0,0,0.03)',
                borderRadius:width/5*4-50/2,alignItems:'center',justifyContent:'center'
              }}>
                <Animated.View style={{height:width/5*4-50,width:width/5*4-50,backgroundColor:colorStateButton,borderWidth:1,borderColor:'rgba(0,0,0,0.08)',
                  borderRadius:(width/5*4-50)/2,alignItems:'center',justifyContent:'center'
                  ,opacity:opacityA,transform:[
                    {
                      scale:animated
                    }
                  ]
                }}>
                </Animated.View>
                <View style={{position:'absolute',alignItems:'center',justifyContent:'center',width:width/5*4 - 105,height:width/5*4 - 105,borderRadius:(width/5*4 - 105)/2,
                  backgroundColor:'rgba(0,0,0,0.05)'}}>
                  <TouchableHighlight style={{borderRadius:width/5*4-110/2}} onPress={this._onPressClickItem.bind(this)}>
                    <View style={{height:null,width:null,borderRadius:width/5*4-110/2}}>
                      {
                        Platform.OS == 'ios'?(
                          <LinearGradient colors={['#fdfbfb','#ebedee']} style={{borderWidth:0,width:width/5*4 - 110,height:width/5*4 - 110
                              ,borderRadius:width/5*4-110/2,justifyContent:'center',alignItems:'center'
                          }}>
                          <View style={{width:width/5*4 - 110,height:width/5*4 - 110
                              ,borderRadius:width/5*4-110/2,justifyContent:'center',alignItems:'center'
                          }}>
                            <Text style={{fontSize:40,backgroundColor:'transparent',color:colorStateButton}}>{stateButton==true?'ON':'OFF'}</Text>
                          </View>
                          </LinearGradient>
                        ):(
                          <View style={{borderColor:'white',width:width/5*4 - 110,height:width/5*4 - 110
                              ,borderRadius:width/5*4-110/2,justifyContent:'center',alignItems:'center'
                          }}>
                          <View style={{width:width/5*4 - 110,height:width/5*4 - 110
                              ,borderRadius:width/5*4-110/2,justifyContent:'center',alignItems:'center'
                          }}>
                            <Text style={{fontSize:40,backgroundColor:'transparent',color:colorStateButton}}>{stateButton==true?'ON':'OFF'}</Text>
                          </View>
                        </View>
                        )
                      }
                    </View>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </View>
          <View style={{flex:1}}>
            <FlatList
              horizontal
              data={dataSource}
              keyExtractor= {(x,i) => i}
              renderItem={({index,item})=>this._renderItem(index,item)}
              />
            <View style={{
                marginBottom:30,height:50,width,backgroundColor:'rgba(255,255,255,0.3)'
              }}>

            </View>
          </View>
        </LinearGradient>
        {this._renderConfigScreen()}
        {this._renderListDevice()}
      </View>
    );
  }
}
export default App = DrawerNavigator({
  MainScreen:{screen:MainScreen},
  Notifications: {
    screen: MyNotificationsScreen,
  },
},
{
  initialRouteName:'MainScreen',
  drawerPosition:'left'
}

)
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
    height: 40,
  },
  statusBar2: {
    backgroundColor: "transparent",
    height:20
  },
  height1:{

  },
  height2:{
    height:30,width:50
  }
});
