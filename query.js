let firebase = require("firebase")


firebase.initializeApp({
    serviceAccount: "firebase-account.json",
    databaseURL: "https://chameleon-9a6e4.firebaseio.com"
})

let db = firebase.database().ref("/NSW/demand").orderByKey().startAt("1454234400").endAt("1454239800")

db.once("value")
    .then((data) => {

        console.log(data.val())

    })
