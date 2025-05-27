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
    try {
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(`${value}`, salt)
        return (hash)
    } catch (error) {
        return (value)
    }
}

//compare method returns boboolean  no need for if statement
const verifyHash = async (value, hash) => {
    try {
    return await bcrypt.compare(value, hash);
  } catch (error) {
    return false;
  }
}

module.exports = { isExpired, hashValue, verifyHash }