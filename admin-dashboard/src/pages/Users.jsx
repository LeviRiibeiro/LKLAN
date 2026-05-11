import { useEffect, useState } from "react";
import { api } from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import { theme } from "../styles/theme";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message || "Erro ao buscar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Confirmar exclusão do usuário?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert("Falha ao excluir usuário: " + (err.message || err));
    }
  };

  return (
    <Card>
      <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Gestão de Usuários</h2>
          <p style={{ margin: 0, color: theme.colors.muted }}>Lista simples com busca rápida para acompanhar os alunos.</p>
        </div>
        <Input
          label="Buscar"
          name="search-users"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nome ou usuário"
          style={{ minWidth: 260 }}
        />
      </div>
      {loading && (
        <p role="status" aria-live="polite">
          Carregando...
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}
      {!loading && !error && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>ID</th>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>Nome</th>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>Usuário</th>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>Papel</th>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => {
                  const query = search.trim().toLowerCase();
                  if (!query) return true;
                  return `${u.name || ""} ${u.username || ""}`.toLowerCase().includes(query);
                })
                .map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: 8 }}>{u.id}</td>
                  <td style={{ padding: 8 }}>{u.name || "-"}</td>
                  <td style={{ padding: 8 }}>{u.username || "-"}</td>
                  <td style={{ padding: 8 }}>{u.role || "-"}</td>
                  <td style={{ padding: 8 }}>
                    <Button variant="danger" onClick={() => handleDelete(u.id)} style={{ padding: "8px 12px", minHeight: 38 }}>
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 8 }}>
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
