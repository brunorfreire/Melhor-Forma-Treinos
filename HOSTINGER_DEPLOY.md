# 🚀 Guia de Publicação no Subdomínio da Hostinger

Este aplicativo (**Melhor Forma Treino V1 Lite**) foi desenvolvido com arquitetura **100% estática (Client-side SPA)**.  
Ele **não requer banco de dados MySQL, nem servidor Node.js ativo** na hospedagem, o que significa que roda em **qualquer plano da Hostinger** com custo zero adicional e velocidade máxima.

---

## 📁 Estrutura dos Arquivos de Produção
Quando o comando `npm run build` é executado, a pasta `dist/` é gerada com:
- `index.html` (A aplicação completa)
- `assets/` (Estilos CSS e scripts JS otimizados)
- `.htaccess` (Configuração Apache para roteamento SPA sem erros 404)
- `hostinger-deploy.zip` (Arquivo compactado pronto para extrair)

---

## ⚡ Método 1: Upload Rápido via Gerenciador de Arquivos (Recomendado — 3 minutos)

### Passo 1: Criar o Subdomínio no hPanel
1. Acesse o **hPanel da Hostinger** ([hpanel.hostinger.com](https://hpanel.hostinger.com)).
2. Vá em **Sites** ➔ **Gerenciar**.
3. No menu lateral, clique em **Domínios** ➔ **Subdomínios**.
4. Crie o subdomínio desejado (ex: `treino` para ficar `treino.seusite.com.br`).
5. A Hostinger criará a pasta correspondente:
   ```text
   public_html/treino/
   ```
6. Vá em **Segurança** ➔ **SSL** e confirme que o SSL (HTTPS) está ativo para o subdomínio.

### Passo 2: Fazer Upload dos Arquivos
1. Baixe o arquivo **`hostinger-deploy.zip`** (você pode baixá-lo diretamente pelo botão dentro do próprio aplicativo, ou compactar o conteúdo da pasta `dist/`).
2. No hPanel da Hostinger, abra **Arquivos** ➔ **Gerenciador de Arquivos** (*File Manager*).
3. Entre na pasta do seu subdomínio: `public_html/treino/`.
4. Se houver um arquivo padrão `default.php`, apague-o.
5. Clique no ícone de **Fazer Upload** (Upload Files) e selecione o arquivo `hostinger-deploy.zip`.
6. Clique com o botão direito sobre o arquivo enviado e escolha **Extrair** (*Extract*).
7. Confirme que os arquivos `index.html` e `.htaccess` e a pasta `assets/` estão soltos na raiz da pasta `public_html/treino/`.

---

## 🔄 Conexão Direta: Hostinger + GitHub

Você pode conectar o GitHub à Hostinger de duas maneiras:

### Opção A: Deploy Automático com GitHub Actions (Recomendada para React/Vite)
Como este projeto é construído em React com Vite e TypeScript, ele precisa ser compilado (`npm run build`). O **GitHub Actions** faz essa compilação gratuitamente nos servidores do GitHub e envia os arquivos prontos direto para o seu subdomínio na Hostinger a cada `git push`.

1. O arquivo `.github/workflows/deploy-hostinger.yml` já está criado no repositório.
2. No painel da Hostinger (hPanel), vá em **Arquivos** (ou **Avançado**) ➔ **Contas FTP** e copie:
   - **Host FTP / IP**: (ex: `ftp.seusite.com.br` ou o IP do servidor)
   - **Usuário FTP**: (ex: `u123456789`)
   - **Senha FTP**: (a senha da sua conta FTP)
3. No seu repositório no **GitHub**:
   - Vá na aba **Settings** (Configurações do repositório)
   - No menu lateral esquerdo, clique em **Secrets and variables** ➔ **Actions**
   - Clique em **New repository secret** e cadastre:
     - Nome: `FTP_SERVER` | Valor: seu host FTP (ex: `ftp.seusite.com.br`)
     - Nome: `FTP_USERNAME` | Valor: seu usuário FTP
     - Nome: `FTP_PASSWORD` | Valor: sua senha FTP
     - *(Opcional)* `FTP_SERVER_DIR`: se a pasta do seu subdomínio for diferente de `./public_html/treino/` (ex: `./public_html/app/`).
4. **Pronto!** A cada `git push` que você fizer na branch `main`, o GitHub compilará o app e atualizará seu subdomínio na Hostinger automaticamente em menos de 1 minuto. Você pode acompanhar o progresso na aba **Actions** do GitHub.

---

### Opção B: Ferramenta Git Nativa do hPanel (Hostinger ➔ Avançado ➔ Git)
A Hostinger possui uma ferramenta Git integrada no hPanel:
1. No hPanel, vá em **Avançado** ➔ **Git**.
2. Preencha os campos:
   - **Repositório**: Cole a URL HTTPS do seu repositório (ex: `https://github.com/usuario/repositorio.git`).
   - **Branch**: `main`
   - **Diretório de Instalação**: `public_html/treino` (ou o nome da pasta do seu subdomínio).
3. Clique em **Criar**.
4. *(Atenção para React)*: A ferramenta Git nativa da Hostinger apenas clona os arquivos do repositório, mas não executa `npm run build` na hospedagem compartilhada. Se você usar este método, garanta que os arquivos compilados (`dist/`) estejam comitados ou aponte a pasta raiz do subdomínio para a pasta onde os arquivos estáticos gerados residem. É exatamente por isso que a **Opção A (GitHub Actions)** é a preferida universalmente pela comunidade React.

---

## ✅ Teste de Funcionamento
Acesse no seu navegador (celular ou computador):
```text
https://treino.seusite.com.br
```
- O app abrirá instantaneamente.
- Você pode criar treinos, buscar exercícios com vídeos do YouTube embutidos e enviar links de WhatsApp para seus alunos.
