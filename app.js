// Banco de dados em memória (pode ser integrado ao Firebase/Supabase)
const state = {
  teams: [],
  matches: []
};

// 1. Cadastrar Dupla
function registerTeam(teamName, player1, player2) {
  const newTeam = { id: Date.now(), name: teamName, player1, player2 };
  state.teams.push(newTeam);
  return newTeam;
}

// 2. Gerar Chaveamento (Mata-mata com ajuste BYE)
function generateTournament() {
  if (state.teams.length < 2) {
    alert("Cadastre pelo menos 2 duplas para iniciar.");
    return;
  }

  // Embaralhar duplas
  const shuffled = [...state.teams].sort(() => Math.random() - 0.5);
  state.matches = [];

  let matchId = 1;
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      state.matches.push({
        id: matchId++,
        round: 1,
        teamA: shuffled[i],
        teamB: shuffled[i + 1],
        scoreA: null,
        scoreB: null,
        winner: null,
        status: "Pendente"
      });
    } else {
      // Dupla folga no primeiro round (BYE)
      state.matches.push({
        id: matchId++,
        round: 1,
        teamA: shuffled[i],
        teamB: { id: null, name: "BYE (Avança Direto)" },
        scoreA: 0,
        scoreB: 0,
        winner: shuffled[i],
        status: "Finalizado"
      });
    }
  }
  renderMatches();
}

// 3. Registrar Resultado da Partida (Enviado pelos Jogadores)
function submitScore(matchId, scoreA, scoreB) {
  const match = state.matches.find(m => m.id === matchId);
  if (!match) return;

  match.scoreA = parseInt(scoreA);
  match.scoreB = parseInt(scoreB);
  
  if (match.scoreA > match.scoreB) {
    match.winner = match.teamA;
  } else if (match.scoreB > match.scoreA) {
    match.winner = match.teamB;
  } else {
    alert("Não pode haver empate no beach tennis!");
    return;
  }

  match.status = "Finalizado";
  renderMatches();
}

// 4. Renderizar Chaves na Tela
function renderMatches() {
  const container = document.getElementById("bracketsContainer");
  container.innerHTML = "";

  state.matches.forEach(match => {
    const card = document.createElement("div");
    card.className = "match-card";
    
    const isFinished = match.status === "Finalizado";
    
    card.innerHTML = `
      <div class="match-header">Jogo #${match.id} - ${match.status}</div>
      <div class="team-row ${match.winner?.id === match.teamA.id ? 'winner' : ''}">
        <span>${match.teamA.name}</span>
        <input type="number" id="scoreA_${match.id}" value="${match.scoreA ?? ''}" ${isFinished ? 'disabled' : ''}>
      </div>
      <div class="team-row ${match.winner?.id === match.teamB.id ? 'winner' : ''}">
        <span>${match.teamB.name}</span>
        <input type="number" id="scoreB_${match.id}" value="${match.scoreB ?? ''}" ${isFinished ? 'disabled' : ''}>
      </div>
      ${!isFinished ? `
        <button onclick="handleScoreSubmit(${match.id})">Confirmar Placar</button>
      ` : `<p class="winner-label">Vencedor: <strong>${match.winner.name}</strong></p>`}
    `;
    container.appendChild(card);
  });
}

function handleScoreSubmit(matchId) {
  const scoreA = document.getElementById(`scoreA_${matchId}`).value;
  const scoreB = document.getElementById(`scoreB_${matchId}`).value;
  if (scoreA === "" || scoreB === "") {
    alert("Preencha ambos os placares!");
    return;
  }
  submitScore(matchId, scoreA, scoreB);
}