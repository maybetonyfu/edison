let csv = require("csv")
let moment = require("moment")
let promisify = require("promisify-node")
let firebase = require("firebase")

firebase.initializeApp({
    serviceAccount: "../firebase-account.json",
    databaseURL: "https://chameleon-9a6e4.firebaseio.com"
})

let db = firebase.database()

let fs = promisify("fs")

const states = {
    "NSW1": {
        common_name: "NSW",
        nem_name: "NSW1"
    },
    "QLD1": {
        common_name: "QLD",
        nem_name: "QLD1"
    },
    "SA1": {
        common_name: "SA",
        nem_name: "SA1"
    },
    "TAS1": {
        common_name: "TAS",
        nem_name: "TAS1"
    },
    "VIC1": {
        common_name: "VIC",
        nem_name: "VIC1"
    }
}

fs.readFile("../data/demand/NSW/2011-12.csv")
    .then((data) => {

        let demand_data = data

        let options = {
            columns: true
        }

        csv.parse(demand_data, options, transform_demand_data)

    })

function transform_demand_data (error, data) {

    if (error) {

        console.log(error)

    }

    let transformed_data = data.map((datum) => {

        return {
            region: states[datum.REGION].common_name,
            settlement_date: moment.utc(datum.SETTLEMENTDATE, "YYYY/MM/DD HH:mm:ss", true).toISOString(),
            total_demand: datum.TOTALDEMAND,
            price: datum.RRP
        }

    })

    console.log(transformed_data)

}

let ref = db.ref("/test")

ref.once("value")
    .then((value) => {

        console.log(value.val())
        process.exit()

    })
