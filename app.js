const axios = require('axios');
const beep = require('beepbeep')
const util = require('util')
const yargs = require("yargs");

const delay = 500

const serviceId = "d1eef49b-00b9-4760-9525-6100c168e642";
const securityNumber = "30188727920"

/* რეგიონების ID-ები */
const regionIds = {
    adjara: "31520d88-870e-485e-a833-5ca9e20e84fa",
    guria: "27428de4-bb76-47f2-bfac-26700623a05d",
    tbilisi: "5d129a50-30e9-4b10-8d4d-3febb32ec32c",
    imereti: "09c1e04c-c664-4252-a30a-2a71ba72c2e2",
    kakheti: "d1e285b5-5b60-42c6-9bc2-ac7646a9c96a",
    mtskheta_mtianeti: "b5a01ce4-bbfc-4b7e-a519-ba11dd7146bb",
    ratcha_letchkhumi_kvemo_svaneti: "6d893d1f-3851-4d80-b7fc-020179c8a4c0",
    samegrelo_da_zemo_svaneti: "a2a56af7-2f62-4ffa-aa56-038328bd5b32",
    samtskhe_javakheti: "acecd83d-fb22-44f9-b69d-3333aceb79a6",
    kvemo_kartli: "f2cf4fc9-7037-4c56-8db7-bd9a6ddadd8a",
    shida_kartli: "ae3b6e33-6cd7-4b24-bf74-865cfabc2839"
}

let placeId = "5d129a50-30e9-4b10-8d4d-3febb32ec32c" // თბილისი

const options = yargs
 .usage("Usage: -p <place>")
 .option("p", { alias: "place", describe: "Place", type: "string", demandOption: false })
 .option("h", { alias: "help", describe: "Show help", type: "", demandOption: false })
 .argv;

if (options.help) {
    console.log(123124)
}

if (options.place && regionIds[options.place]) {
    placeId = regionIds[options.place]
    console.log(`Searching for ${options.place}`)
} else {
    console.log('Searching for Tbilisi')
}

const getFreeVaccines = () => {
    // console.log('.')
    // console.log('.')
    // console.log('.')
    console.log('Checked at: ', new Date().toISOString())
    const now = new Date()
    now.setDate(now.getDate() + 1)
    now.setHours(0)
    const start = new Date(now).toISOString()
    const next = new Date()
    next.setMonth(next.getMonth() + 2)
    const end = new Date(next).toISOString()
    getRegs(`https://booking.moh.gov.ge/Hmis/Hmis.Queue.API/api/CommonData/GetMunicipalities/${placeId}?serviceId=${serviceId}`)
        .then((res) => {
            let sumDelay = 0
            for (let mun of res.data) {
                setTimeout(() => {
                    getRegs(`https://booking.moh.gov.ge/Hmis/Hmis.Queue.API/api/CommonData/GetMunicipalityBranches/${serviceId}/${mun.id}`)
                        .then((clinics) => {
                            let count = 1
                            for (let clinic of clinics.data) {
                                setTimeout(() => {
                                    const reqPayload = {
                                        branchID: clinic.id,
                                        regionID: clinic.regionID,
                                        serviceId: serviceId,
                                        startDate: start,
                                        endDate: end
                                    }
                                    getSlots(reqPayload)
                                        .then((slots) => {
                                            printEmptySlots(slots.data, clinic.name, clinic.address, clinic.municipality)
                                        })
                                        .catch((err3) => console.error("err3"))
                                }, delay * count)
                                count++
                            }
                        })
                        .catch((err2) => console.error("err2"))
                }, sumDelay)
                sumDelay += delay * (res.data.length - 1)
            }
        })
        .catch((err) => console.error("err"));
}

const getRegs = async (url) => {
    var config = {
        method: 'get',
        url: url,
        headers: { 
            'accept': ' application/json, text/plain, */*', 
            'accept-encoding': ' gzip, deflate, br', 
            'accept-language': ' en-US,en;q=0.9,ka;q=0.8,ru;q=0.7', 
            'authorization': 'Bearer Bearer null@null', 
            'cache-control': ' no-cache', 
            'cookie': ' _ga=GA1.1.430123661.1619523062; _ga_MPX1GWT6K2=GS1.1.1620462341.10.1.1620462602.0', 
            'pragma': ' no-cache', 
            'referer': ' https://booking.moh.gov.ge/Hmis/Hmis.Queue.Web/', 
            'sec-ch-ua': ' " Not A;Brand";v="99", "Chromium";v="90"', 
            'sec-ch-ua-mobile': ' ?0', 
            'sec-fetch-dest': ' empty', 
            'sec-fetch-mode': ' cors', 
            'sec-fetch-site': ' same-origin', 
            'securitynumber': securityNumber, 
            'user-agent': ' Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
        }
    };

    return axios(config)
}

const getSlots = async (payload) => {
    var data = JSON.stringify(payload);

    var config = {
    method: 'post',
    url: 'https://booking.moh.gov.ge/Hmis/Hmis.Queue.API/api/Booking/GetSlots',
    headers: { 
        'accept': ' application/json, text/plain, */*', 
        'accept-encoding': ' gzip, deflate, br', 
        'accept-language': ' en-US,en;q=0.9,ka;q=0.8,ru;q=0.7', 
        'authorization': 'Bearer Bearer null@null', 
        'cache-control': ' no-cache', 
        'cookie': ' _ga=GA1.1.430123661.1619523062; _ga_MPX1GWT6K2=GS1.1.1620464490.11.1.1620464492.0', 
        'pragma': ' no-cache', 
        'referer': ' https://booking.moh.gov.ge/Hmis/Hmis.Queue.Web/', 
        'sec-ch-ua': ' " Not A;Brand";v="99", "Chromium";v="90"', 
        'sec-ch-ua-mobile': ' ?0', 
        'sec-fetch-dest': ' empty', 
        'sec-fetch-mode': ' cors', 
        'sec-fetch-site': ' same-origin', 
        'securitynumber': securityNumber, 
        'user-agent': ' Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36', 
        'Content-Type': 'application/json'
    },
    data : data
    };

    return axios(config)

}

const printEmptySlots = (rooms, clinic, addr, municipality) => {
    const freeRooms = []
    for (let room of rooms) {
        const freeDates = []
        for (let schedule of room.schedules) {
            for (let date of schedule.dates) {
                let freeSlots = ''
                for (let slot of date.slots) {
                    if (!slot.taken && !slot.reserved) {
                        freeSlots += `${slot.value} | `
                    }
                }
                if (freeSlots.length > 0) {
                    freeDates.push({
                        day: date.weekName,
                        date: date.dateName,
                        slots: freeSlots
                    })
                }
            }
        }
        if (freeDates.length > 0) {
            freeRooms.push({
                room: room.name,
                dates: freeDates
            })
        }
    }


    if (freeRooms.length > 0) {
        const found = {
            name: `${municipality}, ${clinic} (${addr})`,
            municipality: municipality,
            clinic: clinic,
            address: addr,
            rooms: freeRooms
        }
        beep(3)
        console.log(found)
        // console.log(util.inspect(found, false, null, true /* enable colors */))

    }
}

const printEmptySlots_bk = (rooms, clinic, addr, municipality) => {
    const free = []
    for (let room of rooms) {
        for (let schedule of room.schedules) {
            for (let date of schedule.dates) {
                for (let slot of date.slots) {
                    if (!slot.taken && !slot.reserved) {
                        free.push(`------ ${slot.value}`)
                    }
                }
                if (free.length > 0) {
                    free.unshift(`---- ${date.dateName} (${date.weekName})`)
                }
            }
        }
        if (free.length > 0) {
            free.unshift(`-- ${room.name}`)
        }
    }
    if (free.length > 0) {
        free.unshift(`${municipality}, ${clinic} (${addr})`)
    }
    free.forEach(x => console.log(x))
}


const main = () => {
    beep(3)
    getFreeVaccines()
    setInterval(getFreeVaccines, 60000)
}
main()