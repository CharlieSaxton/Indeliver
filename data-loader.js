

const data = require("./data.json");
const collectionKey = "businesses"; //name of the collection

var admin = require("firebase-admin");

var serviceAccount = require("./whodeliverstomyhome-firebase-adminsdk-uffqv-469ef99d01.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://whodeliverstomyhome.firebaseio.com"
});



var db = admin.firestore();

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