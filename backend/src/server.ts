import dotenv from "dotenv";
import app from "./app";

dotenv.config();


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();