import axios from "axios";

async function setupDB() {
  const SERVER_API_URL = process.env.SERVER_API_URL || "http://localhost:8000";
  await axios.post(`${SERVER_API_URL}/api/e2e/reset`);
}

export default setupDB;
