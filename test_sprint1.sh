#!/bin/bash
set -e

echo "============================================"
echo "LAN Manager Escolar - Sprint 1 Test Suite"
echo "============================================"
echo ""

if ! command -v python3 &> /dev/null; then
    echo "❌ Python nao encontrado. Instale Python 3.11+"
    exit 1
fi
echo "✅ Python encontrado"

echo ""
echo "Verificando estrutura de pastas..."
for dir in server client-agent admin-dashboard chrome-extension; do
    if [ ! -d "$dir" ]; then
        echo "❌ Pasta '$dir' nao encontrada"
        exit 1
    fi
done
echo "✅ Estrutura de pastas correta"

echo ""
echo "Compilando Python (server e client-agent)..."
python3 -m compileall server client-agent -q
echo "✅ Compilacao bem-sucedida"

echo ""
echo "============================================"
echo "Teste rapido concluido!"
echo "============================================"
echo ""
echo "Proximos passos:"
echo "1. cd server && pip install -r requirements.txt"
echo "2. python seed.py"
echo "3. uvicorn main:app --reload"
echo ""
echo "Para testar o agente:"
echo "1. cd client-agent && pip install -r requirements.txt"
echo "2. python agent.py"
echo ""
