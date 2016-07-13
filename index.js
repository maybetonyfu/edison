let csv = require("csv")
var fetch = require("node-fetch")
let firebase = require("firebase")
let moment = require("moment-timezone")

// Configurable stuff

let nem = "http://www.nemweb.com.au"

let demand_path = "/mms.GRAPHS/data/"

let month = "03"

let year = "2016"

let states = ["NSW", "QLD", "SA", "TAS", "VIC"]

firebase.initializeApp({
    serviceAccount: "firebase-account.json",
    databaseURL: "https://chameleon-9a6e4.firebaseio.com"
})

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

        let db = firebase.database()

        data.forEach((datum, index, payload) => {

            let localTimeUnix = moment.tz(datum.SETTLEMENTDATE, "YYYY/MM/DD HH:mm:ss", "Australia/Sydney").unix()

            let demand_ref = db.ref(`/${state}/demand/${localTimeUnix}`)

            let price_ref = db.ref(`/${state}/price/${localTimeUnix}`)

            let bookkeeper_ref = db.ref("/bookkeeper")

            demand_ref.set(datum.TOTALDEMAND)

            price_ref.set(datum.RRP)

            console.log(localTimeUnix)

            if (index === payload.length - 1) {

                bookkeeper_ref.set({
                    demand_latest: `${year}-${month}`,
                    price_latest: `${year}-${month}`
                })

                console.log("Updated bookkeeper")

            }

        })

    }

})


