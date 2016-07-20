let firebase = require("firebase")


firebase.initializeApp({
    serviceAccount: "firebase-account.json",
    databaseURL: "https://chameleon-9a6e4.firebaseio.com"
})

let db = firebase.database().ref("/QLD")

db.remove()
    .then((dta) => {

        console.log("Done")

    })
