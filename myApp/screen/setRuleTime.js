import React from 'react';
import {
  AsyncStorage,
  TextInput,
  Button,
  Platform,
  Modal,
  KeyboardAvoidingView,
  StyleSheet,Picker,
  Text,Easing,DatePickerIOS,
  TouchableHighlight,
  Animated,
  FlatList,
  View,
  Dimensions,
  Image,
  Keyboard
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {StackNavigator, DrawerNavigator} from 'react-navigation'

export default class SetRuleTimeScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'SetRuleTimeScreen',
    drawerIcon: ({tintColor}) => (<Image source={require('../icon/drawer.png')} style={{
      height: 24,
      width: 24
    }}/>)
  };
  _renderDeviceItem() {
    const {dataSource} = this.state
    return (dataSource.map((value, index) => (
      <Picker.Item key={index} label={value.nameDevice} value={value.nameDevice}/>
    )))
  }
  async _getDataWhenStartApp() {
    try {
      const value = await AsyncStorage.getItem('devices');
      if (value !== null) {
        const convertedJson = JSON.parse(value)
        console.log(value)
        this.setState({dataSource: convertedJson,selectedDevice:convertedJson[0].nameDevice})
      } else {
        alert("Bạn Chưa Có Thiết Bị Nào Cả Nhé!")
      }
    } catch (error) {
      alert("STORAGE ERROR")
    }
  }
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      stateSet:true,
      listHour:[],
      listSecond:[],
      modalVisible: false,
      selectedDevice: '',
      hourSet:'',
      minutesSet:'',
      hourDuring:'',
      minutesDuring:'',
      selectedSet:true,
      hourOrSecond:true,
      changeNameText: '',
      slideAnimation1:new Animated.Value(-300)
    }
  }
  componentDidMount() {
    var dataHour = []
    var dataSecond = []
    for (var i =0;i<=24;i++) {
      dataHour.push(i+"")
    }
    for (var i =0;i<=60;i++) {
      dataSecond.push(i+"")
    }
    this.setState({listHour:dataHour,listSecond:dataSecond})
    this._getDataWhenStartApp()
  }
  componentWillUnmount() {}
  _onPressCancelConfig() {
    Keyboard.dismiss()
    Animated.timing(this.state.slideAnimation1,{
        toValue:-1000,
        duration:300
      }).start(()=>this.setState({modalVisible: false}))
  }
  _onPressShowListDevice(index, item) {
    this.setState({modalVisible: true, selectedDevice: item})
    this.state.slideAnimation1.setValue(-300)
    Animated.timing(this.state.slideAnimation1,{
        toValue:0,
        duration:1000,easing:Easing.bounce
      }).start()
  }
  _onPressSendSetToServer() {
    const {stateSet,hourSet,minutesSet,hourDuring,minutesDuring,dataSource,selectedDevice} = this.state
    if (hourSet!='' && minutesSet!='' && hourDuring!='' && minutesDuring!='') {
      var totalDuring = parseInt(hourDuring)*60 + parseInt(minutesDuring)
      var selected = dataSource.find((value) => value.nameDevice==selectedDevice)
      const json = {
        sn:'ESP'+selected.macid,
        sensor:"",
        timeSet:`${hourSet}-${minutesSet}-${stateSet == true?'On':'Off'}-${totalDuring+''}`,
        senSet:""
      }
      const jsonString = JSON.stringify(json)
      this.postForm("http://cretacam.quickddns.com/hien123/ruleSet",
      {'data':jsonString})
    } else {
      alert("Chưa nhập đủ thông tin")
    }
  }
  async postForm(path, form) {
    const str = [];
    for (let p in form) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(form[p]));
    }
    const body = str.join("&");
    const req = {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    };
    fetch(path, req).then((response) => response.json()).then((responseData)=>{
      if (responseData.status == 'OK') {
        alert("Thiết lập thành công")
      } else {
        alert ("Thiết lập thất bại kiểm tra lại đường truyền")
      }
    })
  }
  _renderItem(index, item) {
    const height = Dimensions.get('window').height
    const width = Dimensions.get('window').width
    const color = index%2 == 0?'white':'rgba(0,0,0,0.1)'
    const {hourOrSecond,selectedSet,listHour,listSecond} = this.state
    return (
      <View>
        <TouchableHighlight onPress={()=>{
            var value = item
            if (parseInt(item) <10) {
              value = '0' + item
            }
            if (selectedSet) {
              if (hourOrSecond) {
                this.setState({hourSet:value,modalVisible:false})
              } else {
                this.setState({minutesSet:value,modalVisible:false})
              }
            } else {
              if (hourOrSecond) {
                this.setState({hourDuring:value,modalVisible:false})
              } else {
                this.setState({minutesDuring:value,modalVisible:false})
              }
            }
          }} >
          <View style={{
            backgroundColor:color,
            height:50,width:width/2+width/3-20,alignItems:'center',justifyContent:'center'
          }}>
            <Text style={{
              fontSize: 15,
              color: 'black',
              backgroundColor: 'transparent'
            }}>{item}</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
  showKeyBoardListTime() {
    const width=Dimensions.get('window').width
    const height = Dimensions.get('window').height
    const {modalVisible,listHour,listSecond,hourOrSecond} = this.state
    return(
        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => {
          alert("Modal has been closed.")
        }}>
          <View style={{flex:1,backgroundColor:'transparent'}}>
            <TouchableHighlight onPress={()=>this.setState({modalVisible:false})}>
              <View style={{backgroundColor:'rgba(0,0,0,0.3)',width,height}}></View>
            </TouchableHighlight>
            <View style={{position:'absolute',marginTop:(height-height/2)/2,
                marginLeft:(width-width/2-width/3)/2+10,backgroundColor:'white',
                height:height/2,width:width/2+width/3-20,borderRadius:10}}>
                <FlatList style={{borderRadius:10}} data={hourOrSecond==true?listHour:listSecond} keyExtractor= {(x,i) => i} renderItem={({index, item}) => this._renderItem(index, item)}/>
            </View>
          </View>
        </Modal>
    )
  }
  _onPressSetHour() {
    this.setState({modalVisible:true,hourOrSecond:true,selectedSet:true})
  }
  _onPressSetMinutes() {
    this.setState({modalVisible:true,hourOrSecond:false,selectedSet:true})
  }
  _onPressSetHourDuring() {
    this.setState({modalVisible:true,hourOrSecond:true,selectedSet:false})
  }
  _onPressSetMinutesDuring() {
    this.setState({modalVisible:true,hourOrSecond:false,selectedSet:false})
  }
  render() {
    const width = Dimensions.get('window').width
    const height = Dimensions.get('window').height
    const {dataSource, selectedDevice,slideAnimation1,
    hourSet,minutesSet,hourDuring,minutesDuring,stateSet} = this.state
    const color1 = stateSet == true ?'white':'gray'
    const color2 = stateSet == false?'white':'gray'
    return (
      <View style={{
        flex: 1
      }}>
        <LinearGradient colors={['#43C6AC', '#F8FFAE']} style={{
          borderWidth: 0,
          width,
          height
        }}>

          <View style={Platform.OS == 'ios'
            ? styles.statusBar
            : styles.statusBar2}/>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center'
          }}>
            <View style={{
              justifyContent: 'center'
            }}>
              <TouchableHighlight underlayColor='transparent' style={{padding:10}} onPress= {() => {this.props.navigation.navigate('DrawerToggle')}}>
                <Image style={{
                  height: 20,
                  width: 20
                }} resizeMode='cover' source={require('../icon/drawer.png')}/>
              </TouchableHighlight>
            </View>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
                <View style={{
                  flex: 1,alignItems:'center',justifyContent:'center'
                }}>
                  <View style={{flex:1,marginBottom:10}}>
                    <Text >Hẹn Giờ Thiết Bị</Text>
                  </View>
                  <View style={{flex:1,marginBottom:10,marginTop:10}}>
                  <Image style={{
                    left: 5,
                    width: 10,
                    height: 10
                  }} source={require('../icon/regtangle.png')}/>
                  </View>
                </View>
             </View>
            <View style={{
              justifyContent: 'center',
              alignItems: 'flex-end'
            }}>
              <TouchableHighlight >
                <View style={{
                  borderRadius: 5,
                  height: 20,
                  width: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}></View>
              </TouchableHighlight>
            </View>
          </View>
          <View style={{flex:1,padding:10,alignItems:'center',justifyContent:'center'}}>
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <Text style={{color:'black'}}>Chọn thời gian cài đặt - State:</Text>
                <Text onPress={()=>{this.setState({stateSet:true})}}
                  style={{marginLeft:10,textAlign:'center',color:'green',backgroundColor:color1,padding:10,width:50}}>ON</Text>
                <Text onPress={()=>{this.setState({stateSet:false})}}
                  style={{left:5,textAlign:'center',color:'red',backgroundColor:color2,padding:10,width:50}}>OFF</Text>
              </View>
              <View style={{padding:10,height:50,width:width-40,flexDirection:'row'}}>
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{textAlign:'center'}}>GIỜ:</Text>
                </View>
                <TouchableHighlight style={{flex:1}} onPress={this._onPressSetHour.bind(this)}>
                <View style={{flex:1}}>
                  <Text style={{flex:1,padding:5,backgroundColor:'white'}}>{hourSet}</Text>
                </View>
                </TouchableHighlight>
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{textAlign:'center'}}>PHÚT:</Text>
                </View>
                <TouchableHighlight style={{flex:1}} onPress={this._onPressSetMinutes.bind(this)}>
                  <Text style={{flex:1,padding:5,backgroundColor:'white'}}>{minutesSet}</Text>
                </TouchableHighlight>
              </View>
            </View>



            <View style={{top:10,flex:1,justifyContent:'center',alignItems:'center'}}>
              <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Text style={{color:'black',padding:10,width:width-40}}>Chọn thời gian duy trì trạng thái</Text>
                <View style={{padding:10,height:50,width:width-40,flexDirection:'row'}}>
                  <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Text style={{textAlign:'center'}}>GIỜ:</Text>
                  </View>
                  <TouchableHighlight style={{flex:1}} onPress={this._onPressSetHourDuring.bind(this)}>
                  <View style={{flex:1}}>
                    <Text style={{flex:1,padding:5,backgroundColor:'white'}}>{hourDuring}</Text>
                  </View>
                  </TouchableHighlight>
                  <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Text style={{textAlign:'center'}}>PHÚT:</Text>
                  </View>
                  <TouchableHighlight style={{flex:1}} onPress={this._onPressSetMinutesDuring.bind(this)}>
                    <Text style={{flex:1,padding:5,backgroundColor:'white'}}>{minutesDuring}</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </View>




            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <Text tyle={{color:'black',padding:10,width:width-40,backgroundColor:'white'}}>Chọn Thiết Bị Cần Cài Đặt:</Text>
            </View>
          </View>
            <View style={{bottom:0,flex:1,padding:20}}>
              <Picker selectedValue={this.state.selectedDevice} onValueChange={(value) => this.setState({selectedDevice: value})}>
                {this._renderDeviceItem()}
              </Picker>
            </View>
            <View style={{backgroundColor:'white'}}>
            <Button onPress={this._onPressSendSetToServer.bind(this)} title='OK'/>
            </View>

            {this.showKeyBoardListTime()}

          </LinearGradient>
      </View>
    );
  }
}

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
    height: 10
  },
  height1: {},
  height2: {
    height: 30,
    width: 50
  }
});
