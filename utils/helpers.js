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

//extending date and returning normal date also
const extendDate = (oldDate, extendDuration) => {
    try {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        };

        const extendedDate = oldDate
        extendedDate.setHours(extendedDate.getHours() + 1);
        extendedDate.setDate(extendedDate.getDate() + extendDuration);
        const extendedNormalDate = extendedDate.toLocaleDateString('en-UK', options)
        const [date, time] = extendedNormalDate.split(', ')
        return ({ extendedDate, extendedNormalDate, date, time })
    } catch (error) {
        console.log(error)
    }
}

const compareDate = (firstDate, secondDate) => {
    try {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        };

        const extendedDate1 = firstDate.toLocaleDateString('en-UK', options)
        const [date1] = extendedDate1.split(', ')
        const extendedDate2 = secondDate.toLocaleDateString('en-UK', options)
        const [date2] = extendedDate2.split(', ')
        if (date1 === date2) return true
        if (date1 !== date2) return false
    } catch (error) {
        return false
    }
}

const hashValue = async (value) => {
    try {
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(`${value}`, salt)
        return (hash)
    } catch (error) {
        return (value)
    }
}

// removing '/' and '.' from hash value because it will part of the url on the frontend 
const cleanHash = async (hash, value) => {
    try {
        while (hash.includes('/') || hash.includes('.')) {
            hash = await hashValue(value)
        }
        return hash
    } catch (error) {
        return hash
    }
}

//compare method returns boolean  no need for if statement
const verifyHash = async (value, hash) => {
    try {
        return await bcrypt.compare(value, hash);
    } catch (error) {
        return false;
    }
}

module.exports = {
    isExpired, hashValue, verifyHash, cleanHash,
    extendDate, compareDate
}