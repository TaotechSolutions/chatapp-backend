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

        const extendedDate = new Date(oldDate)
        extendedDate.setHours(extendedDate.getHours() + 1);
        extendedDate.setDate(extendedDate.getDate() + extendDuration);
        const extendedNormalDate = extendedDate.toLocaleDateString('en-GB', options)
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
        const date1 =  new Date(firstDate).toLocaleDateString('en-GB', options)
        const date2 =  new Date(secondDate).toLocaleDateString('en-GB', options)
        return (date1 === date2)
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
        let attempts = 0;
        while (hash.includes('/') || hash.includes('.') && attempts < 5) {
            hash = await hashValue(value)
            attempts++;
        }
        return hash
    } catch (error) {
        console.error(error)
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