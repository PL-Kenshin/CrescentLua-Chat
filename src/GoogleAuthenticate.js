import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';

import { scale, moderateScale, verticalScale } from './scalingUtils';

GoogleSignin.configure();

class GoogleAuthenticate extends Component {

  state = {
    userInfo: null,
    isSigninInProgress: false,
  }

  signIn = async () => {
    this.setState({ isSigninInProgress: true })
    try {

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.setState({ userInfo });
      this.setState({ isSigninInProgress: false })
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  getCurrentUserInfo = async () => {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      this.setState({ userInfo });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        // user has not signed in yet
      } else {
        // some other error
      }
    }
  };

  isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    this.setState({ isLoginScreenPresented: !isSignedIn });
  };

  getCurrentUser = async () => {
    const currentUser = await GoogleSignin.getCurrentUser();
    this.setState({ currentUser });
  };

  signOut = async () => {
    try {
      await GoogleSignin.signOut();
      this.setState({ user: null }); // Remember to remove the user from your app's state as well
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    return (
      <View style={{ display: 'flex', flex: 1, backgroundColor: '#121212', alignItems: 'center' }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Image source={require('../src/images/logo.png')} style={styles.logo} />
        </View>
        <View style={styles.container}>

          <TouchableOpacity style={styles.googleStyle} onPress={this.signIn}>
            <Image
              source={require("../src/images/g-logo.png")}
              style={styles.imageIconStyle}
            />
            <Text style={styles.textStyle}>
              Zaloguj przez Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.googleStyle, { backgroundColor: '#444444', borderColor: '#444444' }]}>
            <Text style={[styles.textStyle, { marginLeft: moderateScale(20, 0.3), color: 'white' }]}>
              Zaloguj anonimowo
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  logo: {
    padding: moderateScale(10, 0.3),
    marginHorizontal: moderateScale(15, 0.3),
    height: moderateScale(80.1, 0.3),
    width: moderateScale(300, 0.3),
    resizeMode: "stretch"
  },
  googleStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: moderateScale(0.5, 0.3),
    borderColor: "#ffffff",
    height: moderateScale(50, 0.3),
    width: moderateScale(350, 0.3),
    borderRadius: 10,
    margin: moderateScale(5, 0.3)
  },
  imageIconStyle: {
    padding: moderateScale(10, 0.3),
    marginLeft: moderateScale(15, 0.3),
    height: moderateScale(25, 0.3),
    width: moderateScale(25, 0.3),
    resizeMode: "stretch"
  },
  textStyle: {
    color: "#575757",
    marginLeft: moderateScale(15, 0.3),
    marginRight: moderateScale(20, 0.3),
    fontSize: moderateScale(14, 0.3)
  }
})

export default GoogleAuthenticate;