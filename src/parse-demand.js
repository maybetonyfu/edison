import fs from 'fs'
import csv from 'csv'
import moment from 'moment'

const states = {
    'NSW1': {
        common_name: 'NSW',
        nem_name: 'NSW1'
    },
    'QLD1': {
        common_name: 'QLD',
        nem_name: 'QLD1'
    },
    'SA1': {
        common_name: 'SA',
        nem_name: 'SA1'
    },
    'TAS1': {
        common_name: 'TAS',
        nem_name: 'TAS1'
    },
    'VIC1': {
        common_name: 'VIC',
        nem_name: 'VIC1'
    }
}

fs.readFile('test.csv', 'utf8', function (err, data) {

    if (err) {
        return console.log(err)
    }

    let demand_data = data

    let options = {
        columns: true
    }

    csv.parse(demand_data, options, transform_demand_data)

})

function transform_demand_data(err, data) {

    if (err) {
        console.log(err)
    }

    let transformed_data = data.map(function (datum) {
        return {
            region: states[datum.REGION].common_name,
            settlement_date: moment.utc(datum.SETTLEMENTDATE, 'YYYY/MM/DD HH:mm:ss', true).toISOString(),
            total_demand: datum.TOTALDEMAND,
            price: datum.RRP
        }
    })

    console.log(transformed_data)
}