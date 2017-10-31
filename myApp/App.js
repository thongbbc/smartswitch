import React from 'react';
import {
  AsyncStorage,
  TextInput,
  Button,
  Platform,
  Modal,
  KeyboardAvoidingView,
  StyleSheet,Easing,
  Text,
  TouchableHighlight,
  Animated,ActivityIndicator,
  FlatList,
  View,
  Dimensions,
  Image,
  Keyboard
} from 'react-native';
import { NetworkInfo } from 'react-native-network-info';
import LinearGradient from 'react-native-linear-gradient';
import {StackNavigator, DrawerNavigator} from 'react-navigation'
import {Client, Message} from 'react-native-paho-mqtt';
import Smartconfig from 'react-native-smartconfig';
import ManageDeviceScreen from './screen/manageDevice'
import SetRuleTimeScreen from './screen/setRuleTime'
var Spinner = require('react-native-spinkit');

const myStorage = {
  setItem: (key, item) => {
    myStorage[key] = item;
  },
  getItem: (key) => myStorage[key],
  removeItem: (key) => {
    delete myStorage[key];
  }
};

class MainScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'MainScreen',
    drawerIcon: ({tintColor}) => (<Image source={require('./icon/drawer.png')} style={{
      height: 24,
      width: 24
    }}/>)
  };
  constructor(props) {
    super(props)
    var dulieu = []
    for (var i =0;i<=100;i++) {
      dulieu.push(i+'')
    }
    this.state = {
      stateMucNuoc : 'HIGH',
      stateQuat : false,
      stateNhietDo : '0.00',
      modalCaiDatNhietDo:false,
      textNhietDo:'0.00',
      listNhietDo:dulieu,
      animating2:true,

      slideAnimation1:new Animated.Value(-300),
      slideAnimation2:new Animated.Value(-300),
      animated: new Animated.Value(0),
      opacityA: new Animated.Value(1),
      animated2: new Animated.Value(0),
      opacityB: new Animated.Value(1),
      colorStateButton: 'rgb(69, 237, 18)',
      stateButton: true,
      animating:false,
      dataSource: [
        {
          name: 'thong',
          check: 'rgba(0,0,0,0.5)'
        }, {
          name: 'thong',
          check: 'transparent'
        }, {
          name: 'thong',
          check: 'transparent'
        }
      ],
      modalVisible: false,
      ssid: '',
      passwifi: '',
      nameDevice: '',
      listDevice: [
        {
          macid: '123',
          nameDevice: 'KitChen'
        }, {
          macid: '123',
          nameDevice: 'BedRoom'
        }, {
          macid: '123',
          nameDevice: 'Toilet'
        }
      ],
      selectedDevice: '',
      modalVisible2: false
    }

    this.client = new Client({uri: 'ws://iot.eclipse.org:80/ws', clientId: 'clientId', storage: myStorage});
    this.client.on('connectionLost', (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log(responseObject.errorMessage);
      }
    });
    this.client.on('messageReceived', (message) => {
      console.log(message.payloadString);
      const json = JSON.parse(message.payloadString)
      if (json.FUNC != 'Error') {
        if (json.FUNC == 'Data') {
          if (json.ADDR == 1) {
            if (json.DATA == 'On') {
              this.setState({stateButton: true, colorStateButton: 'rgb(69, 237, 18)'})
            } else {
              this.setState({stateButton: false, colorStateButton: 'red'})
            }
          } else if (json.ADDR == 2) {
            if (json.DATA == 'On') {
              this.setState({stateQuat: true})
            } else {
              this.setState({stateQuat: false})
            }
          } else if (json.ADDR == 3) {
            if (json.DATA == 'Upper') {
              this.setState({stateMucNuoc: 'HIGH'})
            } else {
              this.setState({stateMucNuoc: 'LOW'})
            }
          } else if (json.ADDR == 4 ) {
            if (json.DATA != '') {
              this.setState({textNhietDo:'',stateNhietDo:json.DATA})
            }
          }
        } else if (json.FUNC == 'Ctrl') {
          if (json.ADDR == 1) {
            if (json.DATA == 'On') {
              this.setState({stateButton: true, colorStateButton: 'rgb(69, 237, 18)'})
            } else {
              this.setState({stateButton: false, colorStateButton: 'red'})
            }
          } else if (json.ADDR == 2) {
            if (json.DATA == 'On') {
              this.setState({stateQuat: true})
            } else {
              this.setState({stateQuat: false})
            }
          } else if (json.ADDR == 3) {
            if (json.DATA == 'Upper') {
              this.setState({stateMucNuoc: 'HIGH'})
            } else {
              this.setState({stateMucNuoc: 'LOW'})
            }
          } else if (json.ADDR == 4 ) {
            if (json.DATA != '') {
              this.setState({textNhietDo: ''})
            }
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
      if (value !== null) {
        const convertedJson = JSON.parse(value)
        console.log(JSON.stringify(convertedJson))
        this.setState({listDevice: convertedJson, selectedDevice: convertedJson[0].nameDevice})
        // connect the client
        const topic = 'ESP' + convertedJson[0].macid + '/'
        this.client.connect().then(() => {
          console.log('onConnect');
          const send = topic + 'slave'
          return this.client.subscribe(send);
        }).then(() => {
          const jsonUpdateState1 = {
            ID: 'ESP' + convertedJson[0].macid,
            FUNC: "Data",
            ADDR: "1",
            DATA: "OFF"
          }
          const jsonUpdateState2 = {
            ID: 'ESP' + convertedJson[0].macid,
            FUNC: "Data",
            ADDR: "2",
            DATA: "OFF"
          }
          const jsonUpdateState3 = {
            ID: 'ESP' + convertedJson[0].macid,
            FUNC: "Data",
            ADDR: "3",
            DATA: "OFF"
          }
          const jsonUpdateState4 = {
            ID: 'ESP' + convertedJson[0].macid,
            FUNC: "Data",
            ADDR: "4",
            DATA: "OFF"
          }
          const message1 = new Message(JSON.stringify(jsonUpdateState1));
          const message2 = new Message(JSON.stringify(jsonUpdateState2));
          const message3 = new Message(JSON.stringify(jsonUpdateState3));
          const message4 = new Message(JSON.stringify(jsonUpdateState4));
          message1.destinationName = topic + 'master';
          message2.destinationName = topic + 'master';
          message3.destinationName = topic + 'master';
          message4.destinationName = topic + 'master';
          setTimeout(()=>{this.client.send(message1);
            setTimeout(()=>{this.client.send(message2);
              setTimeout(()=>{this.client.send(message3);
                setTimeout(()=>{this.client.send(message4);
                },300)
              },300)
            },300)
          },300)
          this.setState({animating2:false})
        }).catch((responseObject) => {
          if (responseObject.errorCode !== 0) {
            this.setState({animating2:false})
            console.log('onConnectionLost:' + responseObject.errorMessage);
            alert("LOST CONNECT TO SERVER")
          }
        });
      } else {
        this.client.connect().then(() => {
          console.log('onConnect');
          this.setState({animating2:false})
        })
      }
    } catch (error) {
      alert("STORAGE ERROR")
    }
  }
  async _getDataListDeviceParent() {
    try {
      const value = await AsyncStorage.getItem('devices');
      if (value !== null) {
        const convertedJson = JSON.parse(value)
        console.log(JSON.stringify(convertedJson))
        this.setState({listDevice: convertedJson,animating:false})
      }
    } catch (error) {
      alert("STORAGE ERROR")
    }
  }
  _onPressChooseDevice(index) {
    dulieu = []
    const {dataSource} = this.state
    dataSource.map((value, index2) => {
      if (index2 == index) {
        value.check = 'rgba(0,0,0,0.5)'
        dulieu.push(value)
      } else {
        value.check = 'transparent'
        dulieu.push(value)
      }
    })
    this.setState({dataSource: dulieu})
  }
  _renderItem(index, item) {
    const height = Dimensions.get('window').height
    const width = Dimensions.get('window').width
    return (
      <View>
        <TouchableHighlight onPress={this._onPressChooseDevice.bind(this, index)}>
          <View style={{
            height: height / 9 - 5,
            backgroundColor: item.check,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
            width: width / 6,
            padding: 10
          }}>
            <Text style={{
              fontSize: 8,
              color: 'black',
              backgroundColor: 'transparent'
            }}>{item.name}</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
  componentDidMount() {
    const {animated, opacityA, animated2, opacityB} = this.state
    Animated.stagger(1000, [
      Animated.loop(Animated.parallel([
        Animated.timing(animated, {
          toValue: 1,
          duration: 5000
        }),
        Animated.timing(opacityA, {
          toValue: 0,
          duration: 5000
        })
      ])),
      Animated.loop(Animated.parallel([
        Animated.timing(animated2, {
          toValue: 1,
          duration: 5000
        }),
        Animated.timing(opacityB, {
          toValue: 0,
          duration: 5000
        })
      ]))
    ]).start()
    this._getDataWhenStartApp()

  }
  _onPressClickItem() {
    var state = 'Off'
    const {stateButton, listDevice,selectedDevice} = this.state
    if (stateButton == true) {
      state = 'Off'
    } else {
      state = 'On'
    }
    var macID = listDevice.find((value)=>value.nameDevice == selectedDevice)
    const jsonUpdateState = {
      ID: 'ESP' + macID.macid,
      FUNC: "Ctrl",
      ADDR: "1",
      DATA: state
    }
    const message = new Message(JSON.stringify(jsonUpdateState));
    const topic = 'ESP' + macID.macid + '/'
    message.destinationName = topic + 'master';
    this.client.send(message);
  }
  _renderConfigScreen() {
    const width = Dimensions.get('window').width
    const height = Dimensions.get('window').height
    const {slideAnimation1} = this.state
    return (
      <View style={{
        flex: 1,
        position: 'absolute'
      }}>
        <Modal animationType="fade" transparent={true} visible={this.state.modalVisible} onRequestClose={() => {
          alert("Modal has been closed.")
        }}>
          <TouchableHighlight underlayColor='transparent' onPress={this._onPressCancelConfig.bind(this)} style={{
            flex: 1
          }}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <KeyboardAvoidingView behavior={"position"} keyboardVerticalOffset={30}>
            <Animated.View style={{marginTop:slideAnimation1}}>
                <TouchableHighlight underlayColor='rgba(0,0,0,0)' onPress= {()=>Keyboard.dismiss()}>
                  <View style={{
                    padding: 10,
                    borderRadius: 10,
                    height: height / 2 + height / 10,
                    width: width / 2 + width / 6,
                    backgroundColor: 'white'
                  }}>
                    <Text style={{
                      backgroundColor: 'green',
                      width: width / 2 + width / 6 - 20,
                      textAlign: 'center',
                      padding: 5,
                      fontWeight: '700',
                      fontSize: 20,
                      color: 'white'
                    }}>Thêm Thiết Bị</Text>
                    <View style={{
                      marginBottom: 20,
                      width: width / 2 + width / 6 - 20,
                      marginTop: 20,
                      flex: 1,
                      alignItems: 'center'
                    }}>
                      <Image style={{
                        flex: 1
                      }} resizeMode='contain' source={require('./icon/setting.png')}/>
                    </View>
                    <TextInput placeholder="SSID" style={{
                      padding: 10,
                      height: 40,
                      marginBottom: 5,
                      borderColor: 'gray',
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.3)',
                      borderRadius: 5
                    }} onChangeText={(text) => this.setState({ssid: text})} value={this.state.ssid}/>
                    <TextInput placeholder="PASSWORD WIFI" style={{
                      borderRadius: 5,
                      padding: 10,
                      height: 40,
                      marginBottom: 5,
                      borderColor: 'rgba(0,0,0,0.3)',
                      borderWidth: 1
                    }} onChangeText={(text) => this.setState({passwifi: text})} value={this.state.passwifi}/>
                    <TextInput placeholder="NAME DEVICE" style={{
                      borderRadius: 5,
                      padding: 10,
                      height: 40,
                      borderColor: 'rgba(0,0,0,0.3)',
                      borderWidth: 1
                    }} onChangeText={(text) => this.setState({nameDevice: text})} value={this.state.nameDevice}/>
                    <View style={{
                      marginTop: 10,
                      width: width / 2 + width / 6 - 20,
                      flexDirection: 'row'
                    }}>
                      <TouchableHighlight onPress={this._onPressConfig.bind(this)}>
                        <View style={{
                          backgroundColor: 'white',
                          width: (width / 2 + width / 6) / 2 - 10,
                          height: 35,
                          padding: 5
                        }}>
                          <Text style={{
                            fontWeight: 'bold',
                            color: '#1169f7',
                            textAlign: 'center',
                            flex: 1
                          }}>Đồng Ý</Text>
                        </View>
                      </TouchableHighlight>
                      <TouchableHighlight onPress={this._onPressCancelConfig.bind(this)}>
                        <View style={{
                          backgroundColor: 'white',
                          width: (width / 2 + width / 6) / 2 - 10,
                          height: 35,
                          padding: 5
                        }}>
                          <Text style={{
                            fontWeight: 'bold',
                            color: 'red',
                            textAlign: 'center',
                            flex: 1
                          }}>Hủy</Text>
                        </View>
                      </TouchableHighlight>
                    </View>
                  </View>
                </TouchableHighlight>
            </Animated.View>
          </KeyboardAvoidingView>
            </View>
          </TouchableHighlight>
          {this._renderLoadingView()}
        </Modal>
      </View>
    )
  }
  _onPressShowConfig() {
    NetworkInfo.getSSID(ssid => {
      if (ssid != undefined) {
        this.setState({modalVisible: true,ssid:ssid})
        this.state.slideAnimation1.setValue(-300)
        Animated.timing(this.state.slideAnimation1,{
            toValue:0,
            duration:1000,easing:Easing.bounce
          }).start()
      } else {
        this.setState({modalVisible: true})
        this.state.slideAnimation1.setValue(-300)
        Animated.timing(this.state.slideAnimation1,{
            toValue:0,
            duration:1000,easing:Easing.bounce
          }).start()
      }
    });

  }
  _onPressConfig() {
    const {ssid, passwifi, nameDevice} = this.state
    const self= this
    Keyboard.dismiss()
    if (ssid != '' && passwifi != '' && nameDevice != '') {
      this.setState({animating:true})
        Smartconfig.start({
          type: 'esptouch', //or airkiss, now doesn't not effect
          ssid: ssid,
          bssid: '', //"" if not need to filter (don't use null)
          password: passwifi,
          timeout: 50000 //now doesn't not effect
        }).then(function(results){
          //Array of device success do smartconfig
          console.log(results);
          /*[
            {
              'bssid': 'device-bssi1', //device bssid
              'ipv4': '192.168.1.11' //local ip address
            },
            {
              'bssid': 'device-bssi2', //device bssid
              'ipv4': '192.168.1.12' //local ip address
            },
            ...
          ]*/
          results.map((value) => {
            var macId = value.bssid
            self._saveDeviceToStorage(macId, nameDevice)
          })
          Smartconfig.stop();
          self.setState({animating:false,modalVisible:false})
        }).catch(function(error) {
          Smartconfig.stop();
          self.setState({animating:false,modalVisible:false})
        });
    } else {
      alert('PLEASE CHECK YOUR SSID OR PASSWORD,NAME DEVICE!')
    }
  }
  async _saveDeviceToStorage(macid, deviceName) {
    const {selectedDevice} = this.state
    try {
      const value = await AsyncStorage.getItem('devices');
      if (value !== null) {
        var convertedJson = JSON.parse(value)
        var subJson = {
          macid: macid,
          nameDevice: deviceName
        }
        convertedJson.push(subJson)
        // alert(JSON.stringify(convertedJson))
        try {
          await AsyncStorage.setItem('devices', JSON.stringify(convertedJson));
        } catch (error) {
          // Error saving data
        }
      } else {
        var createJson = []
        var subJson = {
          'macid': macid,
          'nameDevice': deviceName
        }
        createJson.push(subJson)
        try {
          await AsyncStorage.setItem('devices', JSON.stringify(createJson));
        } catch (error) {
          // Error saving data
        }
        this._getDataListDeviceParent()
      }
      this.setState({animating:false,modalVisible:false})
    } catch (error) {
      var createJson = []
      var subJson = {
        'macid': macid,
        'nameDevice': deviceName
      }
      createJson.push(subJson)
      try {
        await AsyncStorage.setItem('devices', createJson.toString());
      } catch (error) {
        // Error saving data
      }
      this._getDataListDeviceParent()

    }
    if (selectedDevice == '') {
      // this.client.connect().then(() => {
        // console.log('onConnect');
        var topic = 'ESP'+macid+'/'
        const send = topic + 'slave'
        this.client.subscribe(send);
      // }).then(() => {
        const jsonUpdateState1 = {
          ID: 'ESP' + macid,
          FUNC: "Data",
          ADDR: "1",
          DATA: "OFF"
        }
        const message1 = new Message(JSON.stringify(jsonUpdateState1));
        message1.destinationName = topic + 'master';
        this.client.send(message1);
      // })
    }
    this.setState({animating:false,modalVisible:false,selectedDevice:deviceName})
  }
  _onPressCancelConfig() {
    Keyboard.dismiss()
    Animated.timing(this.state.slideAnimation1,{
        toValue:-1000,
        duration:300
      }).start(() => {
        this.setState({modalVisible: false, ssid: '', passwifi: '', nameDevice: ''})
      })
  }
  _onPressCancelListDevice() {
    Animated.timing(this.state.slideAnimation2,{
        toValue:-1000,
        duration:300
      }).start(() => {
        this.setState({modalVisible2: false})
      })
  }
  _onPressListDevice() {
    const height = Dimensions.get('window').height
    this._getDataListDeviceParent()
    this.setState({modalVisible2: true})
    this.state.slideAnimation2.setValue(-300)
    Animated.timing(this.state.slideAnimation2,{
        toValue:0,
        duration:1000,easing:Easing.bounce
      }).start()
  }
  _onPressChooseParentDevice(item) {
    const {listDevice, selectedDevice} = this.state
    listDevice.map((value) => {
      if (value.nameDevice == selectedDevice) {
        var topic = 'ESP' + value.macid + '/'
        var topic2 = 'ESP' + item.macid + '/'
        const send = topic + 'slave'
        const sub = topic2 + 'slave'
        if (this.client != undefined) {
          this.client.unsubscribe(send)
          this.client.subscribe(sub)
          const jsonUpdateState1 = {
            ID: 'ESP' + item.macid,
            FUNC: "Data",
            ADDR: "1",
            DATA: "OFF"
          }
          const jsonUpdateState2 = {
            ID: 'ESP' + item.macid,
            FUNC: "Data",
            ADDR: "2",
            DATA: "OFF"
          }
          const jsonUpdateState3 = {
            ID: 'ESP' + item.macid,
            FUNC: "Data",
            ADDR: "3",
            DATA: "OFF"
          }
          const jsonUpdateState4 = {
            ID: 'ESP' + item.macid,
            FUNC: "Data",
            ADDR: "4",
            DATA: "OFF"
          }
          const message1 = new Message(JSON.stringify(jsonUpdateState1));
          const message2 = new Message(JSON.stringify(jsonUpdateState2));
          const message3 = new Message(JSON.stringify(jsonUpdateState3));
          const message4 = new Message(JSON.stringify(jsonUpdateState4));

          message1.destinationName = topic2 + 'master';
          message2.destinationName = topic2 + 'master';
          message3.destinationName = topic2 + 'master';
          message4.destinationName = topic2 + 'master';

          setTimeout(()=>{this.client.send(message1);
            setTimeout(()=>{this.client.send(message2);
              setTimeout(()=>{this.client.send(message3);
                setTimeout(()=>{this.client.send(message4);
                },300)
              },300)
            },300)
          },300)
        }
      }
    })
    this._onPressCancelListDevice()
    this.setState({selectedDevice: item.nameDevice})

  }
  _renderItemDevice(index, item) {
    const height = Dimensions.get('window').height
    const width = Dimensions.get('window').width
    const color = index % 2 == 0
      ? 'transparent'
      : 'transparent'
    return (
      <View>
        <TouchableHighlight onPress={this._onPressChooseParentDevice.bind(this, item)}>
          <View style={{
            height: 50,
            backgroundColor: color,
            justifyContent: 'center',
            alignItems: 'center',
            width: width / 2 + width / 4,
            padding: 10
          }}>
            <Text style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 17,
              backgroundColor: 'transparent',
              color: 'black'
            }}>{item.nameDevice}</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
  _renderListDevice() {
    const width = Dimensions.get('window').width
    const height = Dimensions.get('window').height
    const {listDevice,slideAnimation2} = this.state
    return (
      <View style={{
        flex: 1,
        position: 'absolute'
      }}>
        <Modal animationType="fade" transparent={true} visible={this.state.modalVisible2} onRequestClose={() => {
          alert("Modal has been closed.")
        }}>
          <TouchableHighlight underlayColor='rgba(0,0,0,0)' onPress={this._onPressCancelListDevice.bind(this)} style={{
            flex: 1
          }}>
            <View style={{
              flex: 1,
              width,
              backgroundColor: 'rgba(0,0,0,0.3)',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Animated.View style={{
              marginTop: slideAnimation2,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,1)',
              height: height / 2,
              width: width / 2 + width / 4
            }}>
              <FlatList style={{
                marginTop:10,
                width: width / 2 + width / 4,
                height: height / 2 -10- 50
              }} data={listDevice} keyExtractor= {(x,i) => i} renderItem={({index, item}) => this._renderItemDevice(index, item)}/>
            <View style={{width: width / 2 + width / 4,height:50,backgroundColor:'white',borderRadius:10}}>
              <Button onPress = {this._onPressCancelListDevice.bind(this)} color='red' title='Thoát'/>

            </View>
          </Animated.View>
            </View>
          </TouchableHighlight>

      </Modal>
    </View>
    )
  }
  _renderLoadingView() {
    if (this.state.animating) {
      return <View style={{
        position: 'absolute',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        top: 1,
        alignItems: 'center',
        justifyContent: 'center',backgroundColor:'rgba(0,0,0,0.5)'
      }}>
            <Spinner
        isVisible={this.state.animating} size={100} type={'WanderingCubes'} color={'#fff'}/>
      <Text style={{marginTop:30,fontSize:20,color:'white',fontWeight:'bold'}}>Đang thiết lập thiết bị ...</Text>

      </View>
    }
  }
  _renderLoadingView2() {
    if (this.state.animating2) {
      return <View style={{
        position: 'absolute',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        top: 1,
        alignItems: 'center',
        justifyContent: 'center',backgroundColor:'rgba(0,0,0,0.5)'
      }}>
            <Spinner
        isVisible={this.state.animating2} size={100} type={'9CubeGrid'} color={'#fff'}/>
      <Text style={{marginTop:30,fontSize:20,color:'white',fontWeight:'bold'}}>Vui lòng chờ chốc lát ...</Text>
      </View>
    }
  }
  _onClickQuat(state) {
    // this.setState({stateQuat:state})
    const {listDevice} = this.state
    if (state == true) {
      state = 'On'
    } else {
      state = 'Off'
    }
    const jsonUpdateState = {
      ID: 'ESP' + listDevice[0].macid,
      FUNC: "Ctrl",
      ADDR: "2",
      DATA: state
    }
    const message = new Message(JSON.stringify(jsonUpdateState));
    const topic = 'ESP' + listDevice[0].macid + '/'
    message.destinationName = topic + 'master';
    this.client.send(message);
  }
  _sendNhietDoSet() {
    const {listDevice,textNhietDo,selectedDevice} = this.state
    if (textNhietDo != '' ){
      var macID = listDevice.find((value)=>value.nameDevice == selectedDevice)

      const jsonUpdateState = {
        ID: 'ESP' + macID.macid,
        FUNC: "Ctrl",
        ADDR: "4",
        DATA: textNhietDo
      }
      const jsonUpdateState2 = {
        ID: 'ESP' + macID.macid,
        FUNC: "Data",
        ADDR: "2",
        DATA: "OFF"
      }
      const message = new Message(JSON.stringify(jsonUpdateState));
      const message2 = new Message(JSON.stringify(jsonUpdateState2));

      const topic = 'ESP' + macID.macid + '/'
      message.destinationName = topic + 'master';
      message2.destinationName = topic + 'master';

      this.client.send(message);
      setTimeout(()=>{this.client.send(message2)},300);

      alert("Đã set nhiệt độ thành công")
    } else {
        alert("Chưa chọn mức nhiệt độ!")
    }
  }
  _renderItemCaiDatNhietDo(index,item) {
    const height = Dimensions.get('window').height
    const width = Dimensions.get('window').width
    const color = index%2 ==0?'white':'rgba(0,0,0,0.05)'
    return (
      <View>
        <TouchableHighlight onPress={()=>{this.setState({textNhietDo:item})}}>
          <View style={{
            height: height / 9 - 5,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:color,
            borderRadius: 5,
            width: width / 2 + width / 4 - 40,
            padding: 10
          }}>
            <Text style={{
              height:30,
              fontSize: 15,textAlign:'center',
              color: 'black',
              backgroundColor: 'transparent'
            }}>{item}</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
  _renderCaiDatNhietDo() {
    const {modalCaiDatNhietDo,textNhietDo,listNhietDo} = this.state
    const width = Dimensions.get('window').width
    const height = Dimensions.get('window').height
    return(
          <Modal animationType="fade" transparent={true} visible={modalCaiDatNhietDo} onRequestClose={() => {
            alert("Modal has been closed.")
          }}>
            <TouchableHighlight  underlayColor='rgba(0,0,0,0)' onPress={()=>{
              Keyboard.dismiss()
              this.setState({modalCaiDatNhietDo:false})
            }} style={{
              flex: 1
            }}>
              <View style={{
                flex: 1,
                width,
                backgroundColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <TouchableHighlight
              underlayColor='transparent'
              style={{borderRadius:5}}
               onPress={()=>{Keyboard.dismiss()}}>
              <View
                style={{
                borderRadius: 10,alignItems:'center',justifyContent:'center',
                backgroundColor: 'rgba(255,255,255,1)',
                height: height / 2,
                width: width / 2 + width / 4
              }}>
              <Text style={{padding:5
              ,height:30,fontSize:20,textAlign:'center'
              ,width: width / 2 + width / 4 - 40}}
              >Chọn Nhiệt Độ:{textNhietDo}</Text>
              <FlatList style={{
                marginTop:10,
                flex:1,
                borderRadius:5,borderWidth:1,borderColor:'gray'
              }} data={listNhietDo} keyExtractor= {(x,i) => i} renderItem={({index, item}) => this._renderItemCaiDatNhietDo(index, item)}/>
              <View style={{marginTop:10}}><Button
              onPress={this._sendNhietDoSet.bind(this)}
                title='OK'/></View>
            </View>
            </TouchableHighlight>
              </View>
            </TouchableHighlight>
        </Modal>
      )
  }
  render() {
    const width = Dimensions.get('window').width
    const height = Dimensions.get('window').height
    const {
      stateQuat,stateMucNuoc,stateNhietDo,
      dataSource,
      animated,
      opacityA,
      animated2,
      opacityB,
      colorStateButton,
      stateButton
    } = this.state
    const colorStateQuat1  = stateQuat==true?'white':'rgba(0,0,0,0.3)'
    const colorStateQuat2  = stateQuat==false?'white':'rgba(0,0,0,0.3)'
    const colorMucNuoc = stateMucNuoc == 'HIGH'?'green':'black'
    //#FC466B #3F5EFB
    // colors={['#ADA996','#F2F2F2','#DBDBDB','#EAEAEA']}

    return (
      <View style={styles.container}>
        <LinearGradient colors={['#43C6AC', '#F8FFAE']} style={{
          borderWidth: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height
        }}>
          <View style={{
            marginBottom: 20
          }}>
            <View style={Platform.OS == 'ios'
              ? styles.statusBar
              : styles.statusBar2}/>
            <View style={{
              flexDirection: 'row',
              height: null,
              padding: 10,
              justifyContent: 'center'
            }}>
              <View style={{
                justifyContent: 'center'
              }}>
                <TouchableHighlight onPress= {() => {this.props.navigation.navigate('DrawerToggle')}}>
                  <Image style={{
                    height: 20,
                    width: 20
                  }} resizeMode='cover' source={require('./icon/drawer.png')}/>
                </TouchableHighlight>
              </View>
              <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <TouchableHighlight style={Platform.OS == 'ios'
                  ? styles.height1
                  : styles.height2} underlayColor='transparent' onPress={this._onPressListDevice.bind(this)}>
                  <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                  }}>
                    <View style={{
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: 'black',
                        backgroundColor: 'transparent'
                      }}>{this.state.selectedDevice}</Text>
                      <Text style={{
                        fontSize: 8,
                        color: 'rgba(0,0,0,0.8)',
                        fontWeight: 'normal',
                        backgroundColor: 'transparent'
                      }}>{this.state.selectedDevice}</Text>
                    </View>
                    <Image style={{
                      left: 5,
                      width: 10,
                      height: 10
                    }} source={require('./icon/regtangle.png')}/>
                  </View>
                </TouchableHighlight>
              </View>
              <View style={{
                justifyContent: 'center',
                alignItems: 'flex-end'
              }}>
                <TouchableHighlight underlayColor="transparent" onPress={this._onPressShowConfig.bind(this)}>
                  <View style={{
                    shadowRadius: 10,
                    shadowOpacity: 0.15,
                    backgroundColor: 'white',
                    borderRadius: 5,
                    height: 30,
                    width: 30,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Image style={{
                      width: 10,
                      height: 10
                    }} resizeMode='cover' source={require('./icon/plus.png')}/>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          </View>


          <View style={{
            paddingTop: 70,
            paddingBottom: 70,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              height: width / 6 *4 - 10,
              width: width / 6 *4 - 10,
              backgroundColor: 'rgba(0,0,0,0)',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.07)',
              borderRadius: width / 6 *4 - 10 / 2,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <View style={{
                height: width / 6 *4 - 20,
                width: width / 6 *4 - 20,
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.03)',
                borderRadius: width / 6 *4 - 20 / 2,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Animated.View style={{
                  height: width / 6 *4 - 20,
                  width: width / 6 *4 - 20,
                  backgroundColor: colorStateButton,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.08)',
                  borderRadius: (width / 6 * 4 - 20) / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: opacityA,
                  transform: [
                    {
                      scale: animated
                    }
                  ]
                }}></Animated.View>
                <View style={{
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: width / 6 *4 - 105,
                  height: width / 6 *4 - 105,
                  borderRadius: (width / 6 * 4 - 105) / 2,
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}>
                  <TouchableHighlight style={{
                    borderRadius: (width / 6 * 4 - 105) / 2,
                    width: width / 6 *4 - 105,
                    height: width / 6 *4 - 105,
                  }} onPress={this._onPressClickItem.bind(this)}>
                    <View style={{
                      width: width / 6 *4 - 105,
                      height: width / 6 *4 - 105,
                      borderRadius: width / 6 *4 - 105 / 2
                    }}>
                      {Platform.OS == 'ios'
                        ? (
                          <LinearGradient colors={['#fdfbfb', '#ebedee']} style={{
                            borderWidth: 0,
                            width: width / 6 *4 - 105,
                            height: width / 6 *4 - 105,
                            borderRadius: width / 6 *4 - 105 / 2,
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <View style={{
                              borderWidth: 3,
                              borderColor: 'rgba(0,0,0,0.2)',
                              width: width / 6 *4 - 105,
                              height: width / 6 *4 - 105,
                              borderRadius: width / 6 *4 - 105 / 2,
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              <Text style={{
                                fontSize: 40,
                                backgroundColor: 'transparent',
                                color: colorStateButton
                              }}>{stateButton == true
                                  ? 'ON'
                                  : 'OFF'}</Text>
                            </View>
                          </LinearGradient>
                        )
                        : (
                          <LinearGradient colors={['#fdfbfb', '#ebedee']} style={{
                            borderWidth: 3,borderColor: 'rgba(0,0,0,0.2)',
                            width: width / 6 *4 - 105,
                            height: width / 6 *4 - 105,
                            borderRadius: width / 6 *4 - 105 / 2,
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                          <View style={{
                            width: width / 6 *4 - 105,
                            height: width / 6 *4 - 105,
                            borderRadius: width / 6 *4 - 80 / 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            <View style={{
                              width: width / 6 *4 - 80,
                              height: width / 6 *4 - 80,
                              borderRadius: width / 6 *4 - 80 / 2,
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              <Text style={{
                                fontSize: 40,
                                backgroundColor: 'transparent',
                                color: colorStateButton
                              }}>{stateButton == true
                                  ? 'ON'
                                  : 'OFF'}</Text>
                            </View>
                          </View>
                        </LinearGradient>
                        )
}
                    </View>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </View>
          <View style={{
            flex: 1
          }}>
            <View style={{
              marginBottom: 30,
              height: 50,flexDirection:'row',
              width,alignItems:'center',justifyContent:'center',
              backgroundColor: 'rgba(255,255,255,0.3)'
            }}></View>
          </View>
        </LinearGradient>
        {this._renderConfigScreen()}
        {this._renderListDevice()}
        {this._renderLoadingView2()}
      </View>
    );
  }
}
export default App = DrawerNavigator({
  MainScreen: {
    screen: MainScreen
  },
  ManageDevice: {
    screen: ManageDeviceScreen
  },
  SetTimeRule:{
    screen:SetRuleTimeScreen
  }
}, {
  initialRouteName: 'MainScreen',
  drawerPosition: 'left'
})
const styles = StyleSheet.create({
  viewUnderLinear: {
    flex: 1,
    backgroundColor: '#000'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statusBar: {
    backgroundColor: "transparent",
    height: 40
  },
  statusBar2: {
    backgroundColor: "transparent",
    height: 20
  },
  height1: {},
  height2: {
    flex:1
  }
});
