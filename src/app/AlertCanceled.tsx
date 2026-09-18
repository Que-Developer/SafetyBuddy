import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // helps navigate through the pages
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlertCanceledScreen() {
  const router = useRouter();

  const handleReturnHome = () => {
    // Replace the current screen with the Home tab
    router.replace('/(tabs)/home'); 
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        
        <View style={styles.greenCircle}>
          <Ionicons name="checkmark" size={50} color="#FFF" />
        </View>
        
        <Text style={styles.title}>Alert Canceled</Text>
        <Text style={styles.subtitle}>
          Your emergency alert has been stopped. No responders are on the way.
        </Text>

        <TouchableOpacity style={styles.homeButton} onPress={handleReturnHome}>
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffd24c', // Yellow theme
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  greenCircle: {
    backgroundColor: '#4ade80',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000458',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#000458',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 22,
  },
  homeButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#000458',
    fontSize: 16,
    fontWeight: 'bold',
  },
});