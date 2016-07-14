let csv = require("csv")
let firebase = require("firebase")
let fs = require("fs")


firebase.initializeApp({
    serviceAccount: "firebase-account.json",
    databaseURL: "https://chameleon-9a6e4.firebaseio.com"
})

fs.readFile("AEMO_GENERATORS.csv", "utf8", parse_generators)

let db = firebase.database()

function parse_generators (err, data) {

    if (err) {

        return console.log(err)

    }

    let options = {
        columns: true
    }

    csv.parse(data, options, transform_generators)

}

function transform_generators (err, data) {

    if (err) {

        return console.log(err)

    }

    data
        .filter(function (item) {

            return item.DUID.length > 1

        })
        .forEach(function (item) {

            let feul_type = item["Fuel Source - Descriptor"]

            let feul

            switch (feul_type) {

                case "Coal Seam Methane":

                    feul = "gas"

                    break

                case "Natural Gas":

                    feul = "gas"

                    break

                case "Natural Gas / Diesel":

                    feul = "gas"

                    break

                case "Diesel":

                    feul = "other"

                    break

                case "Brown Coal":

                    feul = "brown_coal"

                    break

                case "Black Coal":

                    feul = "black_coal"

                    break

                case "Waste Coal Mine Gas":

                    feul = "gas"

                    break

                case "Kerosene":

                    feul = "other"

                    break

                case "Coal Tailings":

                    feul = "other"

                    break

                case "Natural Gas / Fuel Oil":

                    feul = "gas"

                    break

                case "Water":

                    feul = "hydro"

                    break

                case "Wind":

                    feul = "wind"

                    break

                case "Bagasse":

                    feul = "other"

                    break

                case "Landfill Methane / Landfill Gas":

                    feul = "gas"

                    break

                case "Municipal and Industrial Materials":

                    feul = "other"

                    break

                case "Sewerage/Waste Water":

                    feul = "other"

                    break

                case "Macadamia Nut Shells":

                    feul = "other"

                    break

                default:

                    feul = "other"

                    break

            }

            let generator_ref = db.ref("/generators")
            let generator_key = generator_ref.push().key

            generator_ref.child(generator_key).set({
                duid: item.DUID,
                region: item.Region,
                feul: feul
            })

            console.log(item.DUID)

        })

}
