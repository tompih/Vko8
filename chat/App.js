import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, SafeAreaView, ScrollView } from 'react-native';
import { firestore, collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, limit, MESSAGES } from './Config';
import { convertFirebaseTimestampToJS } from './helpers/Functions';
import { getAuth, signInWithEmailAndPassword } from './Config';
import Constants from 'expo-constants';
import Login from './components/Login';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [logged,setLogged] = useState(false);

  const save = async () => {
    try {
      await addDoc(collection(firestore, 'MESSAGES'), {
        text: newMessage,
        created: serverTimestamp()
      });
      setNewMessage('');
      console.log('Message saved.');
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const q = query(collection(firestore, MESSAGES), orderBy('created', 'desc'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tempMessages = []

        querySnapshot.forEach((doc) => {
          // Create and format message object based on the retrieved data from database.
          const messageObject = {
            id: doc.id,
            text: doc.data().text,
            created: convertFirebaseTimestampToJS(doc.data().created)
          }
          tempMessages.push(messageObject)
        })
        setMessages(tempMessages)
      })
      return () => {
        unsubscribe()
      }
  }, [])

  if (logged) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      {
        messages.map((message) => (
          <View style={styles.message} key={message.id}>
            <Text style={styles.messageInfo}>{message.created}</Text>
            <Text>{message.text}</Text>
          </View>
        ))
      }
      </ScrollView>
    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
      <TextInput style={{flex: 0.75}} placeholder='Send message...' value={newMessage} onChangeText={setNewMessage} />
      <Button style={{flex: 0.25}} title='Send' type="button" onPress={save} />
    </View>
    </SafeAreaView>
  )
} else {
  return <Login setLogin={setLogged}/>
}
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    backgroundColor: '#fff',
  },
  message: {
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  messageInfo: {
    fontSize: 12
  }
});