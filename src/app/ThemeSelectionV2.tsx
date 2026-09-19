import { useTheme } from '@/context/ThemeContext'; // <-- Import the context
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThemeSelectScreen() {
  const router = useRouter();
  const { setTheme } = useTheme(); // <-- Get the setTheme function from context

  // 'yellow' is selected by default as requested
  const [selectedTheme, setSelectedTheme] = useState<'yellow' | 'dark'>('yellow');

  const handleContinue = () => {
    // 1. Save the chosen theme to context (also marks hasChosen = true)
    setTheme(selectedTheme);
    
    // 2. Navigate to the login screen
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="color-palette-outline" size={24} color="#FFD24C" />
        </View>
        <View>
          <Text style={styles.headerTitle}>THEME</Text>
          <Text style={styles.headerSubtitle}>Personalization</Text>
        </View>
      </View>

      {/* --- TITLE SECTION --- */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Select between the two</Text>
        <Text style={styles.subtitle}>
          Personalize your workspace. High-contrast elements are optimized for accessibility and focus.
        </Text>
      </View>

      {/* --- YELLOW THEME CARD --- */}
      <TouchableOpacity 
        style={[
          styles.card, 
          styles.yellowCard,
          selectedTheme === 'yellow' && styles.selectedCardBorder
        ]}
        onPress={() => setSelectedTheme('yellow')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="sunny-outline" size={22} color="#000458" />
          <Text style={styles.yellowCardTitle}>Standard Yellow</Text>
          
          {selectedTheme === 'yellow' && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          )}
        </View>
        <Text style={styles.yellowCardText}>
          High-contrast golden accents on a warm charcoal foundation. Best for technical data and clarity.
        </Text>
      </TouchableOpacity>

      {/* --- DARK THEME CARD --- */}
      <TouchableOpacity 
        style={[
          styles.card, 
          styles.darkCard,
          selectedTheme === 'dark' && styles.selectedCardBorder
        ]}
        onPress={() => setSelectedTheme('dark')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="moon-outline" size={22} color="#FFF" />
          <Text style={styles.darkCardTitle}>Dark Mode</Text>

          {selectedTheme === 'dark' && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          )}
        </View>
        <Text style={styles.darkCardText}>
          Deep charcoal-neutral foundations with subtle light-grey highlights. Ideal for low-light environments.
        </Text>
      </TouchableOpacity>

      {/* --- CONTINUE BUTTON --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD24C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,4,88,0.1)',
  },
  iconCircle: {
    backgroundColor: '#000458',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000458',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000458',
  },
  titleSection: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000458',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#000458',
    opacity: 0.8,
    lineHeight: 20,
  },
  card: {
    marginHorizontal: 22,
    marginBottom: 15,
    borderRadius: 18,
    padding: 20,
  },
  selectedCardBorder: {
    borderWidth: 3,
    borderColor: '#000458',
  },
  yellowCard: {
    backgroundColor: '#fce07a',
  },
  yellowCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000458',
    marginLeft: 10,
    flex: 1,
  },
  yellowCardText: {
    fontSize: 14,
    color: '#000458',
    opacity: 0.8,
    marginTop: 12,
    lineHeight: 20,
  },
  darkCard: {
    backgroundColor: '#1a2332',
  },
  darkCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
    flex: 1,
  },
  darkCardText: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.7,
    marginTop: 12,
    lineHeight: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBadge: {
    backgroundColor: '#4ade80',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 'auto',
    padding: 22,
  },
  continueBtn: {
    backgroundColor: '#000458',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
});