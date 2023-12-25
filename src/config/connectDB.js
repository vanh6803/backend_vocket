import mongoose from "mongoose";

mongoose
  .connect(process.env.URL_MONGODB)
  .then(() => {
    console.log("connect successful !!!");
  })
  .catch(() => {
    console.log("connect failed :(");
  });

export default mongoose;
