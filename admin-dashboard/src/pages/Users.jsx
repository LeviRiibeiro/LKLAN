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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "student",
    turma: "1A",
    time_balance: 120,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

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

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      await api.post("/users", {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        turma: formData.turma,
        time_balance: parseInt(formData.time_balance, 10),
      });
      alert("Usuário criado com sucesso!");
      setShowCreateModal(false);
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "student",
        turma: "1A",
        time_balance: 120,
      });
      fetchUsers();
    } catch (err) {
      setCreateError(err.response?.data?.detail || err.message || "Erro ao criar usuário");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <Card>
        <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>Gestão de Usuários</h2>
            <p style={{ margin: 0, color: theme.colors.muted }}>Lista simples com busca rápida para acompanhar os alunos.</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <Input
              label="Buscar"
              name="search-users"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome ou usuário"
              style={{ minWidth: 260 }}
            />
            <Button onClick={() => setShowCreateModal(true)} style={{ padding: "8px 16px", minHeight: 38 }}>
              + Criar Usuário
            </Button>
          </div>
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

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <Card
            style={{
              maxWidth: 500,
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Criar Novo Usuário</h2>
            {createError && (
              <p role="alert" style={{ color: "red", padding: 8, backgroundColor: "#fee", borderRadius: 4, marginBottom: 12 }}>
                {createError}
              </p>
            )}
            <form onSubmit={handleCreateUser} style={{ display: "grid", gap: 16 }}>
              <Input
                label="Nome Completo"
                name="name"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Ex: João Silva"
                required
              />
              <Input
                label="Usuário (login)"
                name="username"
                value={formData.username}
                onChange={(e) => handleFormChange("username", e.target.value)}
                placeholder="Ex: joao.silva"
                required
              />
              <Input
                label="Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleFormChange("password", e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
              />
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Papel</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleFormChange("role", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 4,
                    backgroundColor: theme.colors.bg,
                    color: theme.colors.text,
                    fontSize: 14,
                  }}
                >
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Turma</label>
                <select
                  value={formData.turma}
                  onChange={(e) => handleFormChange("turma", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: 4,
                    backgroundColor: theme.colors.bg,
                    color: theme.colors.text,
                    fontSize: 14,
                  }}
                >
                  <option value="1A">1A</option>
                  <option value="1B">1B</option>
                  <option value="2A">2A</option>
                  <option value="2B">2B</option>
                  <option value="3A">3A</option>
                  <option value="3B">3B</option>
                </select>
              </div>
              <Input
                label="Tempo Disponível (minutos)"
                name="time_balance"
                type="number"
                value={formData.time_balance}
                onChange={(e) => handleFormChange("time_balance", e.target.value)}
                placeholder="120"
                required
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: "8px 16px", minHeight: 38 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  style={{ padding: "8px 16px", minHeight: 38 }}
                >
                  {createLoading ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
