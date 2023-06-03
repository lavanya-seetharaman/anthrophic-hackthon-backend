const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const querySchema = Schema(
    {
        
        email: {
            type:String, 
            required:true
        },
        queryText: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = query = mongoose.model("queries", querySchema);