# 🏋️‍♂️ IRONLOG — Sistema de Gestão de Treinos e Progressão de Carga

Aplicação web desenvolvida em **Angular** e **Tailwind CSS** para planejamento de fichas de treino, registro rápido de cargas durante a sessão e análise quantitativa de hipertrofia e evolução de força ao longo das semanas.

---

## 🎯 Funcionalidades Principais

- **Construtor de Fichas (Workout Builder):** Criação, edição e organização de rotinas de treino (`Treino A`, `Treino B`, etc.) com filtro por grupo muscular, definição de séries, faixa de repetições alvo, tempo de descanso e cadastro de exercícios personalizados.
- **Modo Treino Ativo (Active Session):**
  - **Memória de Carga Automática:** Pré-preenche o peso e as repetições de cada exercício com base no último treino registrado, exibindo a melhor marca anterior como referência para progressão de carga.
  - **Cronômetro de Descanso Integrado:** Dispara automaticamente ao concluir uma série, com controles rápidos (`-15s`, `+15s`, `Pular`).
- **Dashboard Analítico & Progressão (Em desenvolvimento):**
  - Contabilização de **volume semanal (séries válidas e tonelagem)** agrupado por grupo muscular utilizando identificador ISO de semana (`YYYY-Www`).
  - Curva de **evolução de força (1RM Estimada)** por exercício ao longo das sessões.

---

## 🧮 Regras de Negócio e Fórmulas Implementadas

1. **Estimativa de 1RM (Fórmula de Epley):**
   $$\text{1RM Estimada} = \text{Carga} \times \left(1 + \frac{\text{Repetições}}{30}\right)$$
   Permite acompanhar o ganho real de força mesmo quando a progressão ocorre pelo aumento de repetições mantendo a mesma carga.

2. **Volume Semanal por Grupo Muscular:**
   Agrupa as sessões pelo padrão ISO Week (`2026-W47`, por exemplo) e contabiliza:
   - **Séries Válidas:** Total de séries efetivamente concluídas por grupo muscular na semana.
   - **Tonelagem Total:** $\sum (\text{Séries} \times \text{Repetições} \times \text{Carga})$.

---

## 🛠️ Stack Tecnológica e Arquitetura

- **Front-end:** Angular (Standalone Components & Signals para gerenciamento de estado reativo)
- **Estilização:** Tailwind CSS (UI responsiva *mobile-first* em tema escuro)
- **Persistência:** LocalStorage (camada de serviço desacoplada pronta para integração com Firebase Firestore / MongoDB)

### Estrutura de Pastas

```text
src/app/
├── core/
│   ├── data/            # Catálogo inicial de exercícios (seed)
│   ├── models/          # Interfaces TypeScript (WorkoutTemplate, WorkoutLog, ExecutedSet)
│   └── services/        # WorkoutStateService (Signals) e WorkoutAnalyticsService
└── features/
    ├── workout-builder/ # Montagem e gerenciamento de fichas de treino
    ├── active-session/  # Execução de treino em tempo real + timer de descanso
    └── dashboard/       # Visualização de volume semanal e gráficos de evolução

---

## 🗺️ Roadmap do Projeto

- [x] Setup inicial com Angular 21 (Zoneless), Tailwind CSS v4 e modelagem de dados
- [x] Gerenciamento de estado reativo com Angular Signals
- [x] Construtor de fichas de treino e catálogo de exercícios customizável
- [x] Tela de treino ativo com memória automática de carga e cronômetro de descanso
- [x] Dashboard analítico com cálculo de volume semanal (ISO Week) e curva de 1RM (Fórmula de Epley)
- [x] Integração com Firebase Firestore SDK para persistência e sincronização em tempo real
- [ ] Autenticação com Google (Firebase Auth) e isolamento de dados por usuário
- [ ] Navegação entre semanas passadas e detalhamento de sessões no histórico
- [ ] Deploy em produção no Firebase Hosting (PWA mobile-first)