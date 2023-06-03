
const queries = require("../models/query.model");

const createQuery = async (data) => {
    console.log(data);
    try {
        const newQuery = {
            email: data.email,
            queryText: data.searchQuery
        }
        const response = await new queries(newQuery).save();
        return response;
    } catch (error) {
        console.log(error);
    }
}

const getQueryListByEmail = async (email) => {
    try {
        const queryListResponse = await queries.find({ email: email });
        return queryListResponse;
    } catch (error) {
        console.log(`No Query available for this user. ${error}`)
    }
}


module.exports ={
    createQuery,
    getQueryListByEmail
}