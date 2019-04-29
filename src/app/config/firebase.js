import firebase from 'firebase'
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBCZlm4-l8JGmLwRTBbNxURzMHfDWYuwTo",
    authDomain: "milonga-guide.firebaseapp.com",
    databaseURL: "https://milonga-guide.firebaseio.com",
    projectId: "milonga-guide",
    storageBucket: "milonga-guide.appspot.com",
    messagingSenderId: "243011384732",
}

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
firestore.settings({timestampsInSnapshots: true});

export default firebase;