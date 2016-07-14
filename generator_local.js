let csv = require("csv")
let fs = require("fs")

fs.readFile("AEMO_GENERATORS.csv", "utf8", parse_generators)

var generators = []

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

            generators.push({
                duid: item.DUID,
                region: item.Region,
                feul: feul
            })

        })

    console.log(generators)
    fs.writeFileSync("./generators.json", JSON.stringify(generators), "utf-8")

}


