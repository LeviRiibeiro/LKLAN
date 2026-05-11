import React, { useState, useRef } from "react";
import axios from "axios";
import Button from "../components/Button";
import Card from "../components/Card";
import { useTheme } from "../hooks/useTheme";

function ImportUsers() {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setMessage({
        type: "error",
        text: "Formato inválido. Use CSV ou XLSX",
      });
      return;
    }

    setSelectedFile(file);
    setMessage(null);

    // Preview do arquivo
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Ler primeiras linhas
      const text = await file.text();
      const lines = text.split("\n").slice(0, 6); // Header + 5 linhas
      setPreview(lines.join("\n"));
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Selecione um arquivo" });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        "http://127.0.0.1:8001/import/users",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(response.data);
      setMessage({
        type: "success",
        text: `✓ ${response.data.message}`,
      });
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.detail ||
          "Erro ao importar usuários",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `username,full_name,email,turma
aluno1,João Silva,joao@school.edu,8A
aluno2,Maria Santos,maria@school.edu,8B`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_importacao.csv";
    a.click();
  };

  const downloadCredentials = () => {
    if (!result?.credentials) return;

    let csv = "username,senha,nome_completo,email\n";
    result.credentials.forEach((cred) => {
      csv += `${cred.username},"${cred.password}",${cred.full_name},"${cred.email}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "credenciais_alunos.csv";
    a.click();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ color: theme.accent }}>📥 Importação em Massa de Alunos</h1>

      {message && (
        <Card
          style={{
            backgroundColor:
              message.type === "error"
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(34, 197, 94, 0.1)",
            borderLeft: `4px solid ${
              message.type === "error" ? "#ef4444" : "#22c55e"
            }`,
            marginBottom: "20px",
            padding: "12px 16px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: message.type === "error" ? "#ef4444" : "#22c55e",
            }}
          >
            {message.text}
          </p>
        </Card>
      )}

      {!result ? (
        <>
          <Card style={{ marginBottom: "20px" }}>
            <h2 style={{ color: theme.accent, marginTop: 0 }}>
              1️⃣ Selecione o Arquivo
            </h2>
            <div
              style={{
                border: `2px dashed ${theme.accent}`,
                borderRadius: "8px",
                padding: "30px",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: "rgba(34, 197, 94, 0.05)",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <p style={{ color: theme.accent, fontSize: "24px", margin: "0 0 10px 0" }}>
                📄
              </p>
              <p style={{ color: theme.text, margin: 0 }}>
                {selectedFile
                  ? `✓ Arquivo selecionado: ${selectedFile.name}`
                  : "Clique para selecionar arquivo CSV ou XLSX"}
              </p>
              <p style={{ color: theme.muted, fontSize: "12px", margin: "5px 0 0 0" }}>
                ou arraste e solte aqui
              </p>
            </div>

            <div
              style={{
                marginTop: "15px",
                display: "flex",
                gap: "10px",
              }}
            >
              <Button
                onClick={downloadTemplate}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: theme.accent,
                  border: `1px solid ${theme.accent}`,
                }}
              >
                ⬇️ Baixar Template
              </Button>
            </div>
          </Card>

          {preview && (
            <Card style={{ marginBottom: "20px" }}>
              <h2 style={{ color: theme.accent, marginTop: 0 }}>
                2️⃣ Preview do Arquivo
              </h2>
              <pre
                style={{
                  backgroundColor: theme.bg,
                  border: `1px solid ${theme.muted}`,
                  borderRadius: "4px",
                  padding: "10px",
                  color: theme.text,
                  fontSize: "12px",
                  overflowX: "auto",
                  maxHeight: "200px",
                }}
              >
                {preview}
              </pre>
            </Card>
          )}

          <Card>
            <h2 style={{ color: theme.accent, marginTop: 0 }}>
              3️⃣ Importar
            </h2>
            <p style={{ color: theme.muted }}>
              ⚠️ A importação criará novas contas de aluno com senhas aleatórias.
              Salve as credenciais para distribuir aos alunos.
            </p>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || loading}
              style={{
                width: "100%",
                backgroundColor: theme.accent,
                color: theme.bg,
                padding: "12px",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Importando..." : "✓ Confirmar Importação"}
            </Button>
          </Card>
        </>
      ) : (
        <Card style={{ marginBottom: "20px" }}>
          <h2 style={{ color: theme.accent, marginTop: 0 }}>
            ✅ Importação Concluída
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ color: theme.muted, fontSize: "12px", margin: 0 }}>
                Importados
              </p>
              <p style={{ fontSize: "24px", color: "#22c55e", margin: 0 }}>
                {result.imported_count}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: theme.muted, fontSize: "12px", margin: 0 }}>
                Falhados
              </p>
              <p style={{ fontSize: "24px", color: result.failed_count > 0 ? "#ef4444" : "#22c55e", margin: 0 }}>
                {result.failed_count}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: theme.muted, fontSize: "12px", margin: 0 }}>
                Total Processado
              </p>
              <p style={{ fontSize: "24px", color: theme.accent, margin: 0 }}>
                {result.imported_count + result.failed_count}
              </p>
            </div>
          </div>

          <h3 style={{ color: theme.accent }}>Credenciais Geradas</h3>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              backgroundColor: "rgba(3, 7, 18, 0.5)",
              border: `1px solid ${theme.muted}`,
              borderRadius: "4px",
              padding: "10px",
              marginBottom: "15px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.muted}` }}>
                  <th style={{ textAlign: "left", color: theme.accent, padding: "5px" }}>
                    Usuário
                  </th>
                  <th style={{ textAlign: "left", color: theme.accent, padding: "5px" }}>
                    Senha
                  </th>
                  <th style={{ textAlign: "left", color: theme.accent, padding: "5px" }}>
                    Nome
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.credentials.map((cred, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: `1px solid ${theme.muted}`,
                      backgroundColor: idx % 2 === 0 ? "rgba(34, 197, 94, 0.05)" : "transparent",
                    }}
                  >
                    <td style={{ color: theme.text, padding: "5px", fontFamily: "monospace" }}>
                      {cred.username}
                    </td>
                    <td style={{ color: theme.text, padding: "5px", fontFamily: "monospace" }}>
                      <code style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", padding: "2px 4px", borderRadius: "2px" }}>
                        {cred.password}
                      </code>
                    </td>
                    <td style={{ color: theme.muted, padding: "5px" }}>
                      {cred.full_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              onClick={downloadCredentials}
              style={{
                flex: 1,
                backgroundColor: theme.accent,
                color: theme.bg,
                padding: "10px",
              }}
            >
              ⬇️ Baixar Credenciais (CSV)
            </Button>
            <Button
              onClick={() => {
                setResult(null);
                setSelectedFile(null);
                setPreview(null);
              }}
              style={{
                flex: 1,
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                color: theme.accent,
                border: `1px solid ${theme.accent}`,
                padding: "10px",
              }}
            >
              🔄 Nova Importação
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ImportUsers;
