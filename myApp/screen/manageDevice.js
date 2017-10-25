import React from 'react';
import {
  AsyncStorage,
  TextInput,
  Button,
  Platform,
  Modal,
  KeyboardAvoidingView,
  StyleSheet,
  Text,Easing,
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

export default class ManageDeviceScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'MangeDevice',
    drawerIcon: ({tintColor}) => (<Image source={require('../icon/drawer.png')} style={{
      height: 24,
      width: 24
    }}/>)
  };
  async _getDataWhenStartApp() {
    try {
      const value = await AsyncStorage.getItem('devices');
      if (value !== null) {
        const convertedJson = JSON.parse(value)
        this.setState({dataSource: convertedJson})
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
      modalVisible: false,
      selectedDevice: '',
      changeNameText: '',
      slideAnimation1:new Animated.Value(-300)
    }
  }
  componentDidMount() {
    this._getDataWhenStartApp()
  }
  componentWillUnmount() {}
  _renderItem(index, item) {
    const height = Dimensions.get('window').height
    const width = Dimensions.get('window').width
    const color = index % 2 == 0
      ? 'rgba(0,0,0,0.02)'
      : 'rgba(255,255,255,0.05)'
    return (
      <View>
        <TouchableHighlight>
          <View style={{
            height: height / 9 - 5,
            backgroundColor: color,
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row',
            padding: 10,
            width
          }}>
            <Text style={{
              fontSize: 20,
              flex: 1,
              textAlign: 'center',
              fontWeight: '200',
              color: 'black',
              backgroundColor: 'transparent'
            }}>{item.nameDevice}</Text>
            <TouchableHighlight underlayColor='transparent' onPress={this._onPressShowListDevice.bind(this, index, item)}>
              <View>
                <Image style={{
                  width: height / 9 - 30,
                  height: height / 9 - 30
                }} source={require('../icon/config.png')}/>
              </View>
            </TouchableHighlight>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
  _onPressChangename() {
    const {dataSource, selectedDevice, changeNameText} = this.state
    if (changeNameText != '') {
      var dulieu = dataSource
      dataSource.map((value, index) => {
        if (value.nameDevice == selectedDevice.nameDevice) {
          dulieu[index].nameDevice = changeNameText
        }
      })
      this._analyzeData(dulieu)
      this.setState({changeNameText: ''})
    } else {
      alert('Nhập Thiếu Tên Cần Đổi')
    }
  }
  _onPressDeleteDevice() {
    const {dataSource, selectedDevice} = this.state
    var dulieu = dataSource
    dataSource.map((value, index) => {
      if (value.nameDevice == selectedDevice.nameDevice) {
        dulieu.splice(index, 1)
      }
    })
    this._analyzeData(dulieu)
  }
  async _analyzeData(dulieu) {
    try {
      var json = JSON.stringify(dulieu)
      await AsyncStorage.setItem('devices', json);
      this._getDataWhenStartApp()
    } catch (error) {
      alert("CANNOT DELETE THIS DEVICE")
    }
  }
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
  render() {
    const width = Dimensions.get('window').width
    const height = Dimensions.get('window').height
    const {dataSource, selectedDevice,slideAnimation1} = this.state
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
                    <Text >Danh Sách Thiết Bị</Text>
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
          <FlatList data={dataSource} keyExtractor= {(x,i) => i} renderItem={({index, item}) => this._renderItem(index, item)}/>
          <View style={{
            flex: 1,
            position: 'absolute'
          }}>
            <Modal animationType="fade" transparent={true} visible={this.state.modalVisible} onRequestClose={() => {
              alert("Modal has been closed.")
            }}>
              <TouchableHighlight underlayColor='rgba(0,0,0,0)' onPress={this._onPressCancelConfig.bind(this)} style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Animated.View style={{marginTop:slideAnimation1}}>
                <TouchableHighlight underlayColor='transparent' onPress={() => {
                  Keyboard.dismiss()
                }}>
                  <View style={{
                    borderRadius: 10,
                    height: height / 3 + height / 10,
                    width: width / 2 + width / 6,
                    backgroundColor: 'white'
                  }}>
                    <LinearGradient colors={['#fff','#fff']} style={{
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flex: 1
                    }}>
                      <View style={{
                        flexDirection: 'column',
                        flex: 1
                      }}>
                        <Text style={{
                          backgroundColor: 'transparent',
                          textAlign: 'center',
                          fontSize: 30,
                          fontWeight: '300'
                        }}></Text>
                        <Text style={{
                          backgroundColor: 'transparent',
                          textAlign: 'center',
                          fontSize: 20,
                          fontWeight: '200'
                        }}>{selectedDevice.nameDevice}</Text>
                      </View>
                      <View style={{
                        borderRadius: 10,
                        width: width / 2 + width / 6,
                        flex: 2
                      }}>
                        <TouchableHighlight onPress={this._onPressCancelConfig.bind(this)} style={{
                          flex: 1
                        }}>
                          <View style={{
                            backgroundColor: 'transparent',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Text style={{
                              color: 'red'
                            }}>THOÁT</Text>
                          </View>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={this._onPressDeleteDevice.bind(this)} style={{
                          flex: 1
                        }}>
                          <View style={{
                            backgroundColor: 'rgba(255, 53, 63,0.9)',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Text style={{
                              color: 'white'
                            }}>XÓA</Text>
                          </View>
                        </TouchableHighlight>
                        <TouchableHighlight onPress={this._onPressChangename.bind(this)} style={{
                          flex: 1
                        }}>
                          <View style={{
                            backgroundColor: 'rgba(98, 252, 103,0.6)',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Text>SỬA</Text>
                          </View>
                        </TouchableHighlight>
                        <TextInput onChangeText={(text) => {
                          this.setState({changeNameText: text})
                        }} style={{
                          borderRadius: 10,
                          textAlign: 'center',
                          backgroundColor: 'rgba(255,255,255,0.5)',
                          flex: 1
                        }} placeholder='Tên Mới'/>
                      </View>
                    </LinearGradient>
                  </View>
                </TouchableHighlight>
                </Animated.View>
              </TouchableHighlight>
            </Modal>
          </View>
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
