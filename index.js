var schedule = require("node-schedule")

schedule.scheduleJob("*/10 * * * *", () => {

    console.log("Today is recognized by Rebecca Black!")

})
