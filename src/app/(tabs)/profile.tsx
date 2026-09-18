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

  //  STATE FOR THE CONTACT LIST
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Mother', phone: '+27 79 757 4730', relationship: '' }
  ]);

  //  STATE FOR THE INPUT FIELDS
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('');

  //  FUNCTION TO ADD A NEW CONTACT
  const handleAddContact = () => {
    // Basic validation Don't add if name or phone is empty
    if (newName.trim() === '' || newPhone.trim() === '') {
      alert('Missing Info please enter at least a name and phone number.');
      return;
    }

    // Create the new contact object
    const newContact = {
      id: Date.now().toString(), // Generates a unique ID based on time
      name: newName,
      phone: newPhone,
      relationship: newRelationship,
    };

    // Add it to the existing list and clear the text boxes
    setContacts([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
    setNewRelationship('');
  };

  // FUNCTION TO DELETE A CONTACT
  const handleDeleteContact = (id: string) => {
    // Keep only the contacts whose ID does NOT match the one we want to delete
    const updatedContacts = contacts.filter((contact) => contact.id !== id);
    setContacts(updatedContacts);
  };


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
        
        {/* Dynamic List of Contacts */}
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              {/* Only show relationship if it exists */}
              {contact.relationship ? (
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
              ) : null}
            </View>
            
            {/* Delete Button */}
            <TouchableOpacity onPress={() => handleDeleteContact(contact.id)}>
              <Ionicons name="trash-outline" size={24} color="#000458" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Contact Form */}
        <View style={styles.addContactForm}>
          <TextInput 
            style={styles.input} 
            placeholder="Name" 
            placeholderTextColor="#888"
            value={newName}                 // Connect to state
            onChangeText={setNewName}       // Update state when typing
          />
          <View style={styles.rowInput}>
            <TextInput 
              style={[styles.input, { flex: 2, marginRight: 10 }]} 
              placeholder="Phone" 
              placeholderTextColor="#888"
              keyboardType="phone-pad"      // Shows number pad on phone
              value={newPhone}
              onChangeText={setNewPhone}
            />
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="Relationship" 
              placeholderTextColor="#888"
              value={newRelationship}
              onChangeText={setNewRelationship}
            />
          </View>
          
          {/* Button triggers handleAddContact */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
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

// This is where we define how everything looks 
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
  contactRelationship: {
    fontSize: 12,
    color: '#000458',
    opacity: 0.6,
    marginTop: 2,
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