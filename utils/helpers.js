const bcrypt = require("bcryptjs"); //hashing value

const isExpired = (date) => {
    try {
        const currentDate = new Date()
        if (currentDate > date) {
            return true
        } else {
            return false
        }
    } catch (error) {
        return true
    }
}

const hashValue = async (value) => {
    return new Promise(async (resolve, reject) => {
        try {
            let salt = bcrypt.genSaltSync(10)
            let hash = bcrypt.hashSync(`${value}`, salt)
            resolve(hash)
        } catch (error) {
            resolve(value)
        }
    })
}

const checkHash = async (hash, value) => {
    try {
        while (hash.includes('/') || hash.includes('.')) {
            hash = await hashValue(value)
        }
        return hash
    } catch (error) {
        console.log(error)
    }
}

const verifyHash = async (value, hash) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (bcrypt.compareSync(value, hash)) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (error) {
            resolve(false)
        }
    })
}

module.exports = { isExpired, hashValue, checkHash, verifyHash }