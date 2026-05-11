# Deploy da extensao via GPO

1. Defina o ID real da extensao no arquivo `install_extension.bat`.
2. Execute com permissao administrativa em cada maquina.
3. Reinicie o Chrome.

Mini tutorial rápido (copiável):

Geração/host do .crx

Para testes rápidos: use o modo "Carregar sem compactar" no Chrome (Menu > Mais Ferramentas > Extensões).
Para GPO: gere o .crx (ou use a pasta da extensão), coloque o .crx num compartilhamento HTTP acessível, ex: http://192.168.1.1/extension/extension.crx.
Uso do script (executar como Administrador):

Linha de comando (sem prompts):
Exemplo:
Ou execute sem argumentos e preencha quando solicitado.
O que o script faz:

Valida que você é Administrador.
Grava em HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist a entrada EXTENSION_ID;EXTENSION_URL para forçar instalação via política.
Observações / ajustes:

Se usar AD/GPO, prefira aplicar a mesma chave via Group Policy Management (Administrative Templates).
Se a URL estiver em compartilhamento SMB, disponibilize via um servidor HTTP para evitar problemas de MIME/headers.
O script requer execução como Administrador.