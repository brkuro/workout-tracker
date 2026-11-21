# 🏋️ IRONLOG — Sistema de Gestão de Treinos e Progressão de Carga

[![Deploy](https://img.shields.io/badge/Live%20Demo-ironlog--tracker.web.app-10b981?style=for-the-badge&logo=firebase&logoColor=white)](https://ironlog-tracker.web.app)
[![Angular](https://img.shields.io/badge/Angular-21%20(Zoneless)-dd0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Hosting-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)

Aplicação web full-stack desenvolvida para planejamento de fichas de musculação, execução de treinos em tempo real e acompanhamento analítico de progressão de carga e volume semanal.

🔗 **Acesse a aplicação em produção:** [https://ironlog-tracker.web.app](https://ironlog-tracker.web.app)

---

## ✨ Funcionalidades Principais

- **Autenticação e Isolamento Multi-usuário:** Login seguro via conta Google (`Firebase Auth`), com partição estrita de coleções no banco (`users/{uid}/...`) protegidas por regras de segurança no Firestore.
- **Construtor de Fichas e Catálogo Customizável:** Criação, edição e exclusão de fichas de treino (`WorkoutTemplates`), além de cadastro dinâmico de novos exercícios organizados por grupo muscular.
- **Execução de Treino Ativo (UX Mobile-First):**
  - **Memória Automática de Carga:** Consulta o histórico do usuário para preencher automaticamente os pesos e repetições da última sessão realizada daquele exercício.
  - **Cronômetro de Descanso Integrado:** Temporizador regressivo configurado por exercício para controle de intervalos entre séries.
- **Dashboard Analítico de Performance:**
  - **Agregação de Volume Semanal:** Cálculo de séries válidas e tonelagem levantada por grupo muscular utilizando identificador padronizado **ISO Week** (`YYYY-Www`).
  - **Estimativa de Força Máxima (1RM):** Projeção da evolução de carga máxima por exercício através da **Fórmula de Epley**:
    $$\text{1RM} = \text{Peso} \times \left(1 + \frac{\text{Repetições}}{30}\right)$$

---

## 🛠️ Stack Tecnológica e Arquitetura

- **Frontend:** Angular 21 (Standalone Components, arquitetura **Zoneless** e gerenciamento de estado reativo baseado em **Angular Signals**).
- **Estilização:** Tailwind CSS v4 configurado via PostCSS com tema escuro (*Slate/Emerald*) otimizado para uso em dispositivos móveis.
- **Backend as a Service (Firebase):**
  - **Cloud Firestore:** Persistência NoSQL e sincronização em tempo real via listeners nativos (`onSnapshot`).
  - **Firebase Authentication:** Autenticação OAuth 2.0 com provedor Google.
  - **Firebase Hosting:** Hospedagem SPA com rewrite configurado para rotas do Angular Router.

---

## 📁 Estrutura de Diretórios

```text
src/
├── app/
│   ├── core/
│   │   ├── data/          # Seed inicial do catálogo de exercícios
│   │   ├── models/        # Interfaces e tipagens estritas (TypeScript)
│   │   ├── services/      # AuthService e WorkoutStateService (Signals + Firestore)
│   │   └── firebase.client.ts
│   └── features/
│       ├── workout-builder/  # Criação e gerenciamento de fichas de treino
│       ├── active-session/   # Execução de treino, registro de séries e timer
│       └── dashboard/        # Métricas de volume semanal, 1RM e histórico
└── environments/
    └── environment.example.ts
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (v20+) e npm
- Conta e projeto configurados no [Firebase Console](https://console.firebase.google.com/) (com Authentication Google e Firestore Database ativados)

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/brkuro/capacitacao-asimov--brayan_cosme-.git
   cd workout-tracker
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis do Firebase:**
   Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Firebase:
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   ng serve --open
   ```

---

## 🔒 Regras de Segurança do Firestore

Para garantir o isolamento de dados entre usuários em produção, o banco utiliza a seguinte regra de acesso:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🗺️ Roadmap do Projeto

- [x] Setup inicial com Angular 21 (Zoneless), Tailwind CSS v4 e modelagem de dados
- [x] Gerenciamento de estado reativo com Angular Signals
- [x] Construtor de fichas de treino e catálogo de exercícios customizável
- [x] Tela de treino ativo com memória automática de carga e cronômetro de descanso
- [x] Dashboard analítico com cálculo de volume semanal (ISO Week) e curva de 1RM (Fórmula de Epley)
- [x] Integração com Firebase Firestore SDK para persistência e sincronização em tempo real
- [x] Autenticação com Google (Firebase Auth) e isolamento de dados por usuário
- [x] Deploy em produção no Firebase Hosting (`ironlog-tracker.web.app`)
- [ ] Navegação entre semanas passadas e detalhamento de sessões no histórico (v1.1)
- [ ] Alerta sonoro/vibração ao zerar cronômetro e edição de logs finalizados (v1.1)

---

Desenvolvido por **Brayan Justiniano de Oliveira Cosme** — Estudante de Ciência da Computação (UNIFEI) | [GitHub](https://github.com/brkuro)