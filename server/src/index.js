import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        // Server started successfully
    })
})
.catch((err) => {
    console.error("MONGO db connection failed !!! ", err);
}) 