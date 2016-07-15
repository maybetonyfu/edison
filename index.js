let csv = require("csv")
var fetch = require("node-fetch")
let firebase = require("firebase")
let moment = require("moment-timezone")

// Configurable stuff

let nem = "http://www.nemweb.com.au"

let demand_path = "/mms.GRAPHS/data/"

let month = "06"

let year = "2016"

let states = ["NSW", "QLD", "SA", "TAS", "VIC"]

firebase.initializeApp({
    serviceAccount: "firebase-account.json",
    databaseURL: "https://chameleon-9a6e4.firebaseio.com",
    storageBucket: "gs://chameleon-9a6e4.appspot.com/"
})

let db = firebase.database()

// Main procedure
states.forEach((state) => {

    fetch(`${nem}${demand_path}DATA${year}${month}_${state}1.csv`)
        .then((res) => {

            return res.text()

        })
        .then((body) => {

            let options = {
                columns: true
            }

            csv.parse(body, options, transform_demand_data)

        })

    function transform_demand_data (error, data) {

        if (error) {

            console.log(error)

        }

        data.forEach((datum) => {

            let isoTime = moment.tz(datum.SETTLEMENTDATE, "YYYY/MM/DD HH:mm:ss", "Australia/Sydney").toISOString()

            let demand_key = db.ref(`/${state}/demand/`).push().key

            let price_key = db.ref(`/${state}/price/`).push().key

            let demand_ref = db.ref(`/${state}/demand/${demand_key}`)

            let price_ref = db.ref(`/${state}/price/${price_key}`)

            demand_ref.set({
                x: isoTime,
                y: (+datum.TOTALDEMAND)
            })

            price_ref.set({
                x: isoTime,
                y: (+datum.RRP)
            })

            console.log(isoTime + " " + state)

        })

    }

})


