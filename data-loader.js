const firebase = require('./node_modules/firebase');

const data = require("./data.json");
const collectionKey = "businesses"; //name of the collection

firebase.initializeApp({
    apiKey: 'AIzaSyBQo3KkP2-EcDUyaj8QG1LdzDgFmqrB3GA',
    authDomain: 'whodeliverstomyhome.firebase.com',
    projectId: 'whodeliverstomyhome'
});

var db = firebase.firestore();

const settings = {timestampsInSnapshots: true};
db.settings(settings);

if (data && (typeof data === "object")) {
    data.forEach(business => {
//console.log("business " + JSON.stringify(business));

        db.collection("businesses").add(business)
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });

    });
}