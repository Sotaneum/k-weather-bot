import axios from "axios";

export async function sendMessage(url, id, message) {
  await axios.post(
    url,
    { id, message },
    { headers: { "Content-Type": "application/json" } }
  );
}
