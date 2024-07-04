const mongoose   = require('mongoose');
const connectdb = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,{
        });
        console.log(`Mongo Connected  ${conn.connection.host}`);
    } catch(error){
        console.log(`Error ${error.message}`);
  
    }
}
module.exports = connectdb;