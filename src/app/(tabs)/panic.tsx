import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // helps navigate through the pages
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PanicScreen() {
      const router = useRouter();
  // --- STATES ---
  // 'idle' = waiting for user, 'counting' = 5 sec timer, 'sent' = alert confirmed
  const [alertStatus, setAlertStatus] = useState('counting'); 
  const [countdown, setCountdown] = useState(5);

  // --- THE COUNTDOWN LOGIC ---
  useEffect(() => {
    let timer: number;

    if (alertStatus === 'counting' && countdown > 0) {
      // Set a timer to decrease the countdown every 1000ms (1 second)
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // When countdown hits 0, change status to 'sent'
      setAlertStatus('sent');
    }

    // Cleanup function clears the timer if the component unmounts or state changes
    return () => clearTimeout(timer);
  }, [alertStatus, countdown]);

    //THE AUTO-REDIRECT TO CALLING SCREEN ---
  useEffect(() => {
    let redirectTimer: number;

    // If we just showed the green 'sent' screen, wait 3 seconds
    if (alertStatus === 'sent') {
      redirectTimer = setTimeout(() => {
        // Now jump to the Calling screen
        router.replace('/panicCountdownAlert'); 
      }, 9000); // 3000ms = 3 seconds
    }

    return () => clearTimeout(redirectTimer);
  }, [alertStatus]);

  // Cancel button handler
  const handleCancel = () => {
    router.replace('/AlertCanceled');
  };
  
  // THE COUNTDOWN SCREEN 

  if (alertStatus === 'counting') {
    return (
      <SafeAreaView style={styles.darkContainer} edges={['top', 'bottom']}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sending SOS</Text>
          <Text style={styles.headerSubtitle}>Tap cancel to stop</Text>
        </View>

        {/* Center Card */}
        <View style={styles.countdownCard}>
          <View style={styles.redCircle}>
            <MaterialIcons name="phone-in-talk" size={40} color="#FFF" />
          </View>
          
          <Text style={styles.alertType}>HARASSMENT / UNSAFE</Text>
          
          {/* The big number */}
          <Text style={styles.countdownNumber}>{countdown}</Text>
          
            <Text style={styles.successSubtitle}>
            Campus security and your trusted contacts have been notified. Connecting you now...
        </Text>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>I'm  safe - Cancel Alert</Text>
        </TouchableOpacity>

      </SafeAreaView>
    );
  }

  
  // THE SUCCESS SCREEN
  
  return (
    <SafeAreaView style={styles.darkContainer} edges={['top', 'bottom']}>
      
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="chevron-back" size={24} color="#8ab4f8" />
        </TouchableOpacity>
        <Text style={styles.successHeaderTitle}>Help is on the way</Text>
      </View>

      {/* Success Card */}
      <View style={styles.successCard}>
        <View style={styles.greenCircle}>
          <Ionicons name="checkmark-sharp" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Alert sent</Text>
        <Text style={styles.successSubtitle}>
          Campus security and your trusted contacts have been notified. Stay where you are if it's safe.
        </Text>
      </View>

      {/* Contacts List (Simulated) */}
      <View style={styles.contactsList}>
        <ContactItem title="Campus Security" subtitle="NMU Protection Services — dispatching" />
        <ContactItem title="Emergency Services" subtitle="10111 — on standby" />
        <ContactItem title="Mom" subtitle="Family — location shared" />
        <ContactItem title="Thabo" subtitle="Roommate — location shared" />
      </View>

      {/* Safe Button */}
      <TouchableOpacity style={styles.safeButton} onPress={handleCancel}>
        <Text style={styles.safeButtonText}>I'm safe — cancel alert</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

// --- HELPER COMPONENT FOR THE CONTACT LIST ---
// This keeps our code clean so we don't repeat the same UI 4 times
//Define what props the component expects
type ContactItemProps = {
  title: string;
  subtitle: string;
};

//  Tell the component to use that type
const ContactItem = ({ title, subtitle }: ContactItemProps) => (
  <View style={styles.contactCard}>
    <View style={styles.contactIcon}>
      <MaterialIcons name="phone-in-talk" size={20} color="#4ade80" />
    </View>
    <View>
      <Text style={styles.contactTitle}>{title}</Text>
      <Text style={styles.contactSubtitle}>{subtitle}</Text>
    </View>
  </View>
);


const styles = StyleSheet.create({
  darkContainer: {
    flex: 1,
    backgroundColor: '#ffd24c', // Dark Navy Background
    padding: 20,
  },
  // --- COUNTDOWN STYLES ---
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000458',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000458',
    marginTop: 5,
  },
  countdownCard: {
    backgroundColor: '#fce07a', // Transparent red
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 50, 50, 0.3)',
  },
  redCircle: {
    backgroundColor: '#ff3b3b',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertType: {
    color: '#ff3b3b',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  countdownNumber: {
    color: '#000458',
    fontSize: 80,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  alertingText: {
    color: '#000458',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#000458',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // --- SUCCESS SCREEN STYLES ---
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  successHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000458',
  },
  successCard: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)', // Transparent green
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  greenCircle: {
    backgroundColor: '#4ade80',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successTitle: {
    color: '#000458',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successSubtitle: {
    color: '#000458',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
  contactsList: {
    flex: 1,
  },
  contactCard: {
    backgroundColor: '#fce07a', // Lighter navy for cards
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactIcon: {
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactTitle: {
    color: '#000458',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactSubtitle: {
    color: '#000458',
    fontSize: 12,
    marginTop: 2,
  },
  safeButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  safeButtonText: {
    color: '#000458',
    fontSize: 16,
    fontWeight: 'bold',
  },
});