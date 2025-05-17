const $rankingTemplate = document.createElement('template');

const rankingStyle = `
  <style>
    .players-list {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1em;
    }

    .player-collapsed-content {
      width: 100%;
    }

    .player-info {
      display: grid;
      grid-template-columns: auto 20px 1fr 90px;
      align-items: center;
      gap: 0.5em;
    }

    .player-points {
      text-align: right;
      margin-right: 0.5em;
    }

    .rank-up,
    .rank-down,
    .rank-neutral {
      font-size: 1.3rem;
      font-weight: bold;
      line-height: 1.3rem;
      text-align: center;
    }

    .rank-up {
      color: var(--color-success);
    }

    .rank-down {
      color: var(--color-danger);
    }

    .rank-neutral {
      color: var(--color-border);
    }

    .player-name,
    .player-points,
    .player-position {
      font-weight: bold;
      font-size: 1.1rem;
    }

    .player-name {
      padding-left: 1em;
    }

    .player-position,
    .player-points {
      color: var(--color-alternate);
    }

    .player-info-expanded {
      display: flex;
      flex-direction: column;
      gap: 1.5em;
      padding: 1em;
    }

    .player-info-item {
      display: flex;
      align-items: center;
      gap: 0.5em;
      font-size: 1rem;
    }

    .player-info-item span:first-child {
      color: var(--color-alternate);
      font-weight: bold;
    }

    /* Skeleton loading styles */
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-table-bg) 25%,
        var(--color-table-hover) 50%,
        var(--color-table-bg) 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      height: 60px;
      width: 100%;
      margin-bottom: 1em;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    @media (prefers-color-scheme: light) {
      .skeleton {
        background: linear-gradient(
          90deg,
          var(--color-table-bg) 25%,
          var(--color-striped) 50%,
          var(--color-table-bg) 75%
        );
      }
    }

    /* Styles for top 1 position */
    .top-1{
      font-size: 1.4rem;
    }

    @media screen and (max-width: 1024px) {
      .players-list {
        margin: 2em 0;
      }

      .player-info {
        gap: 0.2em;
      }

      .player-position,
      .player-name,
      .player-points {
        font-size: 0.8rem;
      }

      .player-name {
        padding-left: 0;
      }

      /* Styles for top 1 position */
      .top-1 {
        font-size: 1rem;
      }
    }
  </style>
`;

$rankingTemplate.innerHTML =
  `
  <div class="players-list">
    <!-- Players will be dynamically added here -->
  </div>
` + rankingStyle;

class Ranking extends HTMLElement {
  allPlayers = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild($rankingTemplate.content.cloneNode(true));
    this.playersList = this.shadowRoot.querySelector('.players-list');
    this.allPlayers = []; // Store all players for filtering
  }

  showSkeleton() {
    this.playersList.innerHTML = ''; // Clear existing content
    // Create 10 skeleton items
    for (let i = 0; i < 10; i++) {
      const skeletonPlayer = document.createElement('div');
      skeletonPlayer.className = 'skeleton';
      this.playersList.appendChild(skeletonPlayer);
    }
  }

  setPlayers(players) {
    this.allPlayers = players; // Store all players
    this.renderPlayers(players);
  }

  renderPlayers(players) {
    this.playersList.innerHTML = ''; // Clear existing content

    players.forEach(({ position, name, points, hcp, tournaments, origin, card15, pointsLost, card16, posBefore }) => {
      const accordion = document.createElement('app-accordion');

      // Create collapsed content (player name)
      const collapsedContent = document.createElement('div');
      collapsedContent.slot = 'collapsed';
      collapsedContent.classList.add('player-collapsed-content');

      const top1 = position === 1;

      const posBeforeArrow =
        posBefore > position
          ? `<span class="rank-up">↑</span>`
          : posBefore < position
            ? `<span class="rank-down">↓</span>`
            : `<span class="rank-neutral">•</span>`;

      collapsedContent.innerHTML = `
        <div class="player-info">
          <span class="player-position ${top1 ? 'top-1' : ''}">${position}</span>
          ${posBeforeArrow}
          <span class="player-name ${top1 ? 'top-1' : ''}">${name}</span>
          <span class="player-points ${top1 ? 'top-1' : ''}">${points}</span>
        </div>
      `;

      // Create expanded content (empty for now)
      const expandedContent = document.createElement('div');
      expandedContent.slot = 'expanded';
      expandedContent.innerHTML = `
        <div class="player-info-expanded">
          <div class="player-info-item"><span>HCP:</span> <span>${hcp}</span></div>
          <div class="player-info-item"><span>Torneos:</span> <span>${tournaments}</span></div>
          <div class="player-info-item"><span>Procedencia:</span> <span>${origin}</span></div>
          <div class="player-info-item"><span>Tarjeta 15:</span> <span>${card15}</span></div>
          <div class="player-info-item"><span>Puntos que pierde:</span> <span>${pointsLost}</span></div>
          <div class="player-info-item"><span>Tarjeta 16:</span> <span>${card16}</span></div>
        </div>
      `;

      // Add content to accordion
      accordion.appendChild(collapsedContent);
      accordion.appendChild(expandedContent);

      // Add accordion to the list
      this.playersList.appendChild(accordion);
    });
  }

  filterPlayers(searchTerm) {
    if (!searchTerm) {
      this.renderPlayers(this.allPlayers);
      return;
    }

    const filteredPlayers = this.allPlayers.filter((player) =>
      player.columns.some((column) => column.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    this.renderPlayers(filteredPlayers);
  }
}

customElements.define('app-ranking', Ranking);
