import { Player } from '@models/player';
import { adoptStyles } from '@utils/styles';
import rankingStyle from './ranking.css?inline';

const $rankingTemplate = document.createElement('template');

$rankingTemplate.innerHTML = `
  <div class="players-list">
    <!-- Players will be dynamically added here -->
  </div>
`;

export class Ranking extends HTMLElement {
  allPlayers: Player[] = [];
  playersList: HTMLDivElement;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adoptStyles(this.shadowRoot!, rankingStyle);
    this.shadowRoot!.appendChild($rankingTemplate.content.cloneNode(true));
    this.playersList = this.shadowRoot!.querySelector('.players-list') as HTMLDivElement;
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

  setPlayers(players: Player[]) {
    this.allPlayers = players; // Store all players
    this.renderPlayers(players);
  }

  renderEmpty() {
    this.playersList.innerHTML = '<app-no-results></app-no-results>';
  }

  renderPlayers(players: Player[]) {
    this.playersList.innerHTML = ''; // Clear existing content

    if (players.length === 0) {
      this.renderEmpty();
      return;
    }

    for (const player of players) {
      this.playersList.appendChild(this.createPlayerAccordion(player));
    }
  }

  private createPlayerAccordion(player: Player): HTMLElement {
    const accordion = document.createElement('app-accordion');
    accordion.appendChild(this.createCollapsedContent(player));
    accordion.appendChild(this.createExpandedContent(player));
    return accordion;
  }

  private createCollapsedContent({ position, name, points, changes }: Player): HTMLDivElement {
    const collapsedContent = document.createElement('div');
    collapsedContent.slot = 'collapsed';
    collapsedContent.classList.add('player-collapsed-content');

    const top1 = position === 1;

    collapsedContent.innerHTML = `
      <div class="player-info">
        <span class="player-position ${top1 ? 'top-1' : ''}">${position}</span>
        <app-ranking-change></app-ranking-change>
        <span class="player-name ${top1 ? 'top-1' : ''}">${name}</span>
        <span class="player-points ${top1 ? 'top-1' : ''}">${points}</span>
      </div>
    `;

    const rankingChangeElement = collapsedContent.querySelector<HTMLElement & { value: number }>('app-ranking-change');

    if (rankingChangeElement) {
      rankingChangeElement.value = changes;
    }

    return collapsedContent;
  }

  private createExpandedContent({ hcp, tournaments, origin, card15, pointsLost, card16 }: Player): HTMLDivElement {
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

    return expandedContent;
  }

  filterPlayers(searchTerm: string) {
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

globalThis.customElements.define('app-ranking', Ranking);
