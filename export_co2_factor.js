let csv = require("csv")
let fs = require("fs")
var generators = require("./generators.json")

fs.readFile("CO2E_EMISSIONS_FACTOR.csv", "utf8", parse_generator_data)

// var generators = []

function parse_generator_data (err, data) {

    if (err) {

        return console.log(err)

    }

    let options = {
        columns: true
    }

    csv.parse(data, options, aggregate_generator_data)

}

function aggregate_generator_data (err, data) {

    if (err) {

        return console.log(err)

    }

    data.forEach((datum) => {

        generators.forEach((generator, index) => {

            if (generator.duid === datum.DUID) {

                generators[index]["co2_emissions_factor"] = +datum.CO2E_EMISSIONS_FACTOR

            }

        })

    })

    console.log(generators)

    fs.writeFileSync("./generators_info.json", JSON.stringify(generators), "utf-8")

}
