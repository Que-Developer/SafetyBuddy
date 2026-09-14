import { StyleSheet, Text, View } from "react-native";
import {View,Text, TextInput, Button, FlatList, StyleSheet} from "react-native";

interface TrustedContact{
   id: string;
   name:string;
   phone:string;
    }

export default function TrustedContact(){
    const [contacts, setContacts]= useState<TrustedContact[]>([]);
    const [newContact, setNewContact] = useState<TrustedContact>({
        id: "",
        name: "",
        phone: ""
        });

    //validating
    const validateContact = (contact: TrustedContact): string[] => {
        const errors: string[]=[];
        if(!contact.name.trim())errors.push("Name is required");
        if(contact.phone && !/^\+?\d{7,15}$/.test(contact.phone)){
            errors.push("Invalid phone number");
            }
        return errors
        };

    // umm
    const addContact = () => {
        const errors = validateContact(newContact);
        if (errors.length > 0) {
          alert(errors.join("\n"));
          return;
        }
        setContacts([...contacts, { ...newContact, id: Date.now().toString() }]);
        setNewContact({ id: "", name: "", phone: ""});
      };

  const deleteContact = (id: string) =>{
      setContacts(contacts.filter(c=> c.id !==id));
      };

   return()//ended off here for today

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffd24c"
  },
  text: {
    color: "#000458",
  },
});