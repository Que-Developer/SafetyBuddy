import { Ionicons } from '@expo/vector-icons'; // Standard Expo icon pack
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'; // import React naitive components
import { SafeAreaView } from 'react-native-safe-area-context';

//Remember Diarra the styles.whaterver is like a css ID for the styles.create
export default function ProfileScreen() {
  // State variables for the toggles (Dark mode, Privacy switches)
  const [darkMode, setDarkMode] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [anonReport, setAnonReport] = useState(true);
  const [campusAlerts, setCampusAlerts] = useState(true);
  const [walkWithMe, setWalkWithMe] = useState(true);
  const [masterSwitch, setMasterSwitch] = useState(false);

  return (
    // SafeAreaView ensures content doesn't go under the phone's notch/status bar
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ScrollView allows the user to scroll down if content is too long */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile & Privacy</Text>
          <Text style={styles.headerSubtitle}>You control your data</Text>
        </View>

        {/* --- DISPLAY NAME & DARK MODE --- */}
        <View style={styles.rowBetween}>
          <View style={styles.displayNameBox}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <Text style={styles.valueText}>Amahle</Text>
          </View>
          
          <View style={styles.darkModeBox}>
            <Text style={styles.darkModeText}>Dark Mode</Text>
            <Switch 
              value={darkMode} 
              onValueChange={setDarkMode}
              trackColor={{ false: "#767577", true: "#000458" }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

        {/* --- TRUSTED CONTACTS --- */}
        <Text style={styles.sectionTitle}>TRUSTED CONTACTS</Text>
        
        {/* Existing Contact Card */}
        <View style={styles.contactCard}>
          <View>
            <Text style={styles.contactName}>Mother</Text>
            <Text style={styles.contactPhone}>+27 79 757 4730</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="trash-outline" size={24} color="#000458" />
          </TouchableOpacity>
        </View>

        {/* Add Contact Form */}
        <View style={styles.addContactForm}>
          <TextInput 
            style={styles.input} 
            placeholder="Name" 
            placeholderTextColor="#888"
          />
          <View style={styles.rowInput}>
            <TextInput 
              style={[styles.input, { flex: 2, marginRight: 10 }]} 
              placeholder="Phone" 
              placeholderTextColor="#888"
            />
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="Relationship" 
              placeholderTextColor="#888"
            />
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="person-add-outline" size={20} color="#000458" />
            <Text style={styles.addButtonText}>Add trusted contact</Text>
          </TouchableOpacity>
        </View>

        {/* --- PRIVACY & PERMISSIONS --- */}
        <Text style={styles.sectionTitle}>PRIVACY & PERMISSIONS</Text>

       
        <View style={styles.toggleCard}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Share my location</Text>
            <Text style={styles.toggleSubtitle}>Used for Safe Walk & Walk With Me</Text>
          </View>
          <Switch value={shareLocation} onValueChange={setShareLocation} />
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Anonymous report by default</Text>
            <Text style={styles.toggleSubtitle}>Your name won't be attached to reports</Text>
          </View>
          <Switch value={anonReport} onValueChange={setAnonReport} />
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Campus safety alerts</Text>
            <Text style={styles.toggleSubtitle}>Notifications about incidents & closures</Text>
          </View>
          <Switch value={campusAlerts} onValueChange={setCampusAlerts} />
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Enable Walk With Me</Text>
            <Text style={styles.toggleSubtitle}>Trusted contacts receive journey updates</Text>
          </View>
          <Switch value={walkWithMe} onValueChange={setWalkWithMe} />
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleTextContainer}>
            <Text style={styles.toggleTitle}>Master privacy switch (disable all)</Text>
            <Text style={styles.toggleSubtitle}>Turn off location, alerts, and journey sharing</Text>
          </View>
          <Switch value={masterSwitch} onValueChange={setMasterSwitch} />
        </View>

        {/* --- FOOTER NOTE --- */}
        <Text style={styles.footerNote}>
          SafetyBuddy only uses your data to help keep safe. Location is shared with trusted contacts during an active Walk With Me.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
// This is where we define how everything looks (colors, spacing, fonts)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffd24c', // The yellow background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Extra padding at bottom so it doesn't hide behind tabs
  },
  header: {
    marginBottom: 20,
    backgroundColor: '#fce07a'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000458', // Dark blue
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000458',
    opacity: 0.8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  displayNameBox: {
    backgroundColor: '#fce07a', // Slightly darker yellow for the box
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 15,
  },
  label: {
    fontSize: 12,
    color: '#000458',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: 18,
    color: '#000458',
  },
  darkModeBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkModeText: {
    color: '#000458',
    marginRight: 10,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000458',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  contactCard: {
    backgroundColor: '#fce07a',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000458',
  },
  contactPhone: {
    fontSize: 14,
    color: '#000458',
    opacity: 0.7,
  },
  addContactForm: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#e0e0e0', // Grayish input background
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    color: '#000',
  },
  rowInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonText: {
    color: '#000458',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  toggleCard: {
    backgroundColor: '#fce07a',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000458',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#000458',
    opacity: 0.7,
    marginTop: 2,
  },
  footerNote: {
    fontSize: 12,
    color: '#000458',
    opacity: 0.7,
    marginTop: 20,
    lineHeight: 18,
  },
});