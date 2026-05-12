import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Button from "../components/Button";
import Card from "../components/Card";
import { useTheme } from "../hooks/useTheme";

function AgentUpdate() {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [versions, setVersions] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/agent-update/list");
      setVersions(response.data.versions || []);
      
      if (response.data.versions && response.data.versions.length > 0) {
        setLatest(response.data.versions[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar versões:", error);
      setMessage({ type: "error", text: "Erro ao carregar versões disponíveis" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar nome do arquivo
      if (!file.name.match(/^LanManagerAgent-\d+\.\d+\.\d+\.exe$/)) {
        setMessage({
          type: "error",
          text: "Nome do arquivo inválido. Use: LanManagerAgent-X.Y.Z.exe",
        });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Selecione um arquivo" });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(
        "http://127.0.0.1:8000/agent-update/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage({
        type: "success",
        text: `✓ Versão ${response.data.version} enviada com sucesso!`,
      });
      setSelectedFile(null);
      setTimeout(() => fetchVersions(), 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "Erro ao fazer upload",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (filename) => {
    window.open(`http://127.0.0.1:8000/agent-update/download/${filename}`, "_blank");
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <p style={{ color: theme.muted }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ color: theme.accent }}>🚀 Atualização Remota do Agente</h1>

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

      <Card style={{ marginBottom: "20px" }}>
        <h2 style={{ color: theme.accent, marginTop: 0 }}>📦 Versão Atual em Produção</h2>
        {latest ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: theme.muted, fontSize: "12px", margin: "0 0 5px 0" }}>
                Versão
              </p>
              <p style={{ fontSize: "24px", color: theme.accent, margin: 0 }}>
                v{latest.version}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: theme.muted, fontSize: "12px", margin: "0 0 5px 0" }}>
                Tamanho
              </p>
              <p style={{ fontSize: "18px", color: theme.text, margin: 0 }}>
                {latest.size_mb} MB
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: theme.muted, fontSize: "12px", margin: "0 0 5px 0" }}>
                Publicada
              </p>
              <p style={{ fontSize: "12px", color: theme.muted, margin: 0 }}>
                {new Date(latest.uploaded_at).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ color: theme.muted }}>Nenhuma versão disponível</p>
        )}
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <h2 style={{ color: theme.accent, marginTop: 0 }}>⬆️ Upload de Nova Versão</h2>
        <p style={{ color: theme.muted, fontSize: "12px", marginBottom: "15px" }}>
          Selecione arquivo no formato: <code>LanManagerAgent-X.Y.Z.exe</code>
        </p>

        <div
          style={{
            border: `2px dashed ${theme.accent}`,
            borderRadius: "8px",
            padding: "30px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "rgba(34, 197, 94, 0.05)",
            marginBottom: "15px",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".exe"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <p style={{ color: theme.accent, fontSize: "24px", margin: "0 0 10px 0" }}>
            📄
          </p>
          <p style={{ color: theme.text, margin: 0 }}>
            {selectedFile
              ? `✓ ${selectedFile.name}`
              : "Clique para selecionar arquivo .exe"}
          </p>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            width: "100%",
            backgroundColor: theme.accent,
            color: theme.bg,
            padding: "12px",
            fontSize: "16px",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Enviando..." : "✓ Enviar Nova Versão"}
        </Button>
      </Card>

      <Card>
        <h2 style={{ color: theme.accent, marginTop: 0 }}>📜 Histórico de Versões</h2>
        <p style={{ color: theme.muted, fontSize: "12px", marginBottom: "15px" }}>
          Todas as versões disponíveis para download e distribuição
        </p>

        {versions.length === 0 ? (
          <p style={{ color: theme.muted }}>Nenhuma versão disponível</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {versions.map((version, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: idx === 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(0, 0, 0, 0.2)",
                  borderRadius: "4px",
                  border: idx === 0 ? `1px solid ${theme.accent}` : `1px solid ${theme.muted}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: "0 0 5px 0",
                      color: theme.text,
                      fontWeight: 500,
                    }}
                  >
                    {idx === 0 ? "⭐ " : ""}v{version.version} {idx === 0 && "(ATUAL)"}
                  </p>
                  <p style={{ margin: 0, color: theme.muted, fontSize: "12px" }}>
                    {version.size_mb} MB • {new Date(version.uploaded_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Button
                  onClick={() => handleDownload(version.filename)}
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    color: theme.accent,
                    border: `1px solid ${theme.accent}`,
                    padding: "8px 16px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  ⬇️ Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        style={{
          marginTop: "30px",
          backgroundColor: "rgba(34, 197, 94, 0.05)",
          borderLeft: `4px solid ${theme.accent}`,
        }}
      >
        <h3 style={{ color: theme.accent, margin: "0 0 10px 0" }}>ℹ️ Como Funciona</h3>
        <ol style={{ color: theme.muted, margin: 0, paddingLeft: "20px", fontSize: "12px" }}>
          <li>Compile uma nova versão do agente com PyInstaller</li>
          <li>Nomeie: <code>LanManagerAgent-X.Y.Z.exe</code> (ex: LanManagerAgent-0.2.0.exe)</li>
          <li>Faça upload usando este painel</li>
          <li>Os agentes clientes verificarão automaticamente a cada boot</li>
          <li>Se a versão remota for maior que a local, faz download e atualiza automaticamente</li>
          <li>Você pode distribuir versões anteriores via download manual</li>
        </ol>
      </Card>
    </div>
  );
}

export default AgentUpdate;
