import express from "express";
const app = express();
const PORT = 3000;
const DATA_FILE = path.resolve("data", "users.json");
app.use(cors());
app.use(express.json());

async function readUsers() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
}

app.get("/users", async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar dados" });
  }
});
