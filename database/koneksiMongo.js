const { mongoose } = require("mongoose");

async function koneksiMongo(){
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo DB terhubung");
    }
    catch(err){
        console.error("Gagal terkoneksi MongoDB", err);
        process.exit(1);
    }
}

module.exports = koneksiMongo;