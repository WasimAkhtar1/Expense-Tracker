const mongoose=require("mongoose")


// mongodb+srv://wasimlakhtar:1SveRAkSty1AXkzD@cluster0.sji2n6t.mongodb.net/?retryWrites=true&w=majority


const url = 'mongodb+srv://wasimlakhtar:1SveRAkSty1AXkzD@cluster0.sji2n6t.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(url)
.then(()=>{
    console.log("DB connected")
})

.catch((error)=>{
    console.log("error")
})