import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs/promises";
import cripto from "node:crypto";

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

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsers();
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar dados" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
    }

    const users = await readUsers();
    const novoUsuario = {
      id: cripto.randomUUID(),
      nome,
      email,
      criadoEm: new Date().toISOString(),
    };

    users.push(novoUsuario);
    await writeUsers(users);

    res.status(201).json(novoUsuario);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar usuario" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email } = req.body;
    const users = await readUsers();

    const Index = users.findIndex((u) => u.id === id);
    if (Index === -1) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    users[Index] = {
      ...users[Index],
      nome: nome ?? users[Index].nome,
      email: email ?? users[Index].email,
    };

    await writeUsers(users);
    res.json(users[Index]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const users = await readUsers();

    const Index = users.findIndex((u) => u.id === id);
    if (Index === -1) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    users.splice(Index, 1);
    await writeUsers(users);
    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
