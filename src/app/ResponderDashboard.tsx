import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- DUMMY DATA (Satisfies FR10) ---
const dummyAlerts = [
  {
    id: 'A-204',
    type: 'SOS — Security',
    tag: 'NEW',
    tagColor: '#ff3b3b', // Red
    time: '2 min ago',
    student: 'Anonymous #A-204',
    location: 'North Parking, Block C',
    triggered: 'Triggered 2 min ago',
    responder: 'Unassigned',
    notes: 'Caller reported being followed near the north lot. No further details yet.',
  },
  {
    id: 'A-203',
    type: 'Medical',
    tag: 'RESPONDER DISPATCHED',
    tagColor: '#facc15', // Yellow
    time: '8 min ago',
    student: 'Sipho M.',
    location: 'Library, Ground Floor',
    triggered: 'Triggered 8 min ago',
    responder: 'Officer N. Jacobs',
    notes: 'Student felt dizzy and requested first aid. Campus nurse en route.',
  },
  {
    id: 'A-202',
    type: 'Harassment',
    tag: 'ACKNOWLEDGED',
    tagColor: '#3b82f6', // Blue
    time: '15 min ago',
    student: 'Anonymous #A-198',
    location: 'Residence Hall B, Room 42',
    triggered: 'Triggered 15 min ago',
    responder: 'Officer T. Smith',
    notes: 'Verbal altercation reported. Responder currently en route.',
  }
];

// --- REUSABLE COMPONENTS ---
const StatCard = ({ count, label, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statCircle, { borderColor: color }]} />
    <Text style={styles.statNumber}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const AlertCard = ({ alert }) => (
  <View style={styles.alertCard}>
    {/* Header Row */}
    <View style={styles.alertHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Text style={styles.alertTitle}>{alert.type}</Text>
        <View style={[styles.tag, { backgroundColor: alert.tagColor }]}>
          <Text style={styles.tagText}>{alert.tag}</Text>
        </View>
      </View>
      <Text style={styles.timeText}>{alert.time}</Text>
    </View>
    
    <Text style={styles.studentName}>{alert.student}</Text>
    <View style={styles.divider} />

    {/* Details Rows */}
    <View style={styles.detailRow}>
      <Ionicons name="location-outline" size={16} color="#8a9bb3" />
      <Text style={styles.detailText}>{alert.location}</Text>
    </View>
    <View style={styles.detailRow}>
      <Ionicons name="time-outline" size={16} color="#8a9bb3" />
      <Text style={styles.detailText}>{alert.triggered}</Text>
    </View>
    <View style={styles.detailRow}>
      <Ionicons name="person-outline" size={16} color="#8a9bb3" />
      <Text style={styles.detailText}>{alert.responder}</Text>
    </View>

    {/* Notes Box */}
    <View style={styles.notesBox}>
      <Text style={styles.notesText}>{alert.notes}</Text>
    </View>
  </View>
);

// --- MAIN SCREEN ---
export default function ResponderDashboard() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Responder dashboard</Text>
          <Text style={styles.headerSubtitle}>Authorised responder concept</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard count="3" label="Active" color="#ff3b3b" />
          <StatCard count="1" label="Resolved" color="#4ade80" />
          <StatCard count="1" label="False alarm" color="#8a9bb3" />
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
            <Text style={styles.filterTextActive}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>Acknowledged</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>Responder dispatched</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* List of Alerts */}
        {dummyAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
        
        <View style={{ height: 40 }} /> {/* Bottom padding */}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2332', // Dark Navy
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    backgroundColor: '#23304a',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8a9bb3',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#23304a',
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8a9bb3',
    marginTop: 5,
  },
  filterScroll: {
    paddingLeft: 20,
    marginBottom: 20,
    maxHeight: 40,
  },
  filterTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#23304a',
    marginRight: 10,
  },
  filterTabActive: {
    backgroundColor: '#facc15', // Yellow highlight
  },
  filterText: {
    color: '#8a9bb3',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#1a2332',
    fontWeight: 'bold',
    fontSize: 14,
  },
  alertCard: {
    backgroundColor: '#23304a',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 15,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#8a9bb3',
  },
  studentName: {
    fontSize: 14,
    color: '#8a9bb3',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#1a2332',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 10,
  },
  notesBox: {
    backgroundColor: '#1a2332',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  notesText: {
    color: '#8a9bb3',
    fontSize: 13,
    lineHeight: 18,
  },
});