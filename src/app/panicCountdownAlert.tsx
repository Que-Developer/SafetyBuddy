import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Standard Expo icon pack
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // import React naitive components
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Panic() {
   const router = useRouter(); // Initialize router

  const handleEndCall = () => {
    Alert.alert(
      "End Call?",
      "Are you sure you want to end the call with Security?",
      [
        { text: "Stay on Call", style: "cancel" },
        { 
          text: "End Call", 
          style: "destructive", 
          onPress: () => router.replace('/(tabs)/home') // Navigate to Home
        }
      ]
    );
  };
    return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <Text style={styles.appName}>SafetyBuddy</Text>
        <Text style={styles.sosLabel}>SOS</Text>
        <Text style={styles.callingText}>Calling Security.......</Text>
      </View>

      {/* --- PROFILE PICTURE PLACEHOLDER --- */}
      <View style={styles.imageContainer}>
        <Ionicons name="person" size={180} color="#ffd24c" />
      </View>

      {/* --- ACTION BUTTONS GRID --- */}
      <View style={styles.buttonGrid}>
        
        {/* Row 1 */}
        <View style={styles.row}>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="pause" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Hold</Text>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="volume-high" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Speaker</Text>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="keypad" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Keypad</Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="videocam" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Video</Text>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="bluetooth" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Bluetooth</Text>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="clipboard" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.buttonLabel}>Clipboard</Text>
          </View>
        </View>
      </View>

      {/* --- END CALL BUTTON --- */}
      <View style={styles.endCallContainer}>
        <TouchableOpacity onPress={handleEndCall}>
          <MaterialIcons name="phone-in-talk" size={50} color="#000" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffd24c', // The yellow background
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 30,
  },
  appName: {
    fontSize: 16,
    color: '#000458',
  },
  sosLabel: {
    fontSize: 16,
    color: '#000458',
    marginBottom: 10,
  },
  callingText: {
    fontSize: 32,
    color: '#000458',
    fontWeight: '400',
  },
  imageContainer: {
    backgroundColor:'#e0e0e0', // Slightly darker yellow/gold
    width: 250,
    height: 250,
    alignSelf: 'center', // Centers the box horizontally
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonGrid: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  buttonWrapper: {
    alignItems: 'center',
    width: '30%', // Ensures 3 items fit neatly in a row
  },
  iconButton: {
    backgroundColor: '#e0e0e0', // Light gray square
    width: 70,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonLabel: {
    color: '#000458',
    fontSize: 12,
  },
  endCallContainer: {
    alignItems: 'center',
    marginTop: 'auto', // Pushes this to the bottom of the screen
    marginBottom: 40,
  },


 });
