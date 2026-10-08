import { RankingChange } from '@components/RankingChange/RankingChange';
import { Player } from '@models/player';
import { formatPlayerField } from '@utils/formatPlayer';
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
    this.playersList.replaceChildren();
    // Create 10 skeleton items
    for (let i = 0; i < 10; i++) {
      const skeletonPlayer = document.createElement('div');
      skeletonPlayer.className = 'skeleton';
      this.playersList.appendChild(skeletonPlayer);
    }
  }

  showError(onRetry?: () => void) {
    this.playersList.replaceChildren();

    const wrapper = document.createElement('div');
    wrapper.className = 'load-error';
    wrapper.setAttribute('role', 'alert');

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    icon.setAttribute('aria-hidden', 'true');
    icon.classList.add('load-error-icon');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '10');

    const stem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    stem.setAttribute('d', 'M12 16v-4');

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    dot.setAttribute('d', 'M12 8h.01');
    icon.append(circle, stem, dot);

    const title = document.createElement('p');
    title.className = 'load-error-title';
    title.textContent = 'No se pudo cargar el ranking';

    const detail = document.createElement('p');
    detail.className = 'load-error-detail';
    detail.textContent = 'Revisá tu conexión e intentá de nuevo.';

    wrapper.append(icon, title, detail);

    if (onRetry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'load-error-retry';
      button.textContent = 'Reintentar';
      button.addEventListener('click', onRetry);
      wrapper.append(button);
    }

    this.playersList.append(wrapper);
  }

  setPlayers(players: Player[]) {
    this.allPlayers = players; // Store all players
    this.renderPlayers(players);
  }

  renderEmpty() {
    this.playersList.replaceChildren(document.createElement('app-no-results'));
  }

  renderPlayers(players: Player[]) {
    this.playersList.replaceChildren();

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

  private createCollapsedContent(player: Player): HTMLDivElement {
    const collapsedContent = document.createElement('div');
    collapsedContent.slot = 'collapsed';
    collapsedContent.classList.add('player-collapsed-content');

    const top1 = player.position === 1;
    const info = document.createElement('div');
    info.className = 'player-info';

    const position = document.createElement('span');
    position.className = top1 ? 'player-position top-1' : 'player-position';
    position.textContent = formatPlayerField('position', player.position);

    const rankingChange = document.createElement('app-ranking-change') as RankingChange;
    rankingChange.value = player.changes;

    const name = document.createElement('span');
    name.className = top1 ? 'player-name top-1' : 'player-name';
    name.textContent = player.name;

    const points = document.createElement('span');
    points.className = top1 ? 'player-points top-1' : 'player-points';
    points.textContent = formatPlayerField('points', player.points);

    info.append(position, rankingChange, name, points);
    collapsedContent.append(info);
    return collapsedContent;
  }

  private createExpandedContent(player: Player): HTMLDivElement {
    const expandedContent = document.createElement('div');
    expandedContent.slot = 'expanded';

    const details = document.createElement('div');
    details.className = 'player-info-expanded';
    details.append(
      this.createDetail('HCP:', formatPlayerField('hcp', player.hcp)),
      this.createDetail('Torneos:', formatPlayerField('tournaments', player.tournaments)),
      this.createDetail('Procedencia:', player.origin),
      this.createDetail('Tarjeta 15:', formatPlayerField('card15', player.card15)),
      this.createDetail('Puntos que pierde:', formatPlayerField('pointsLost', player.pointsLost)),
      this.createDetail('Tarjeta 16:', formatPlayerField('card16', player.card16)),
    );

    expandedContent.append(details);
    return expandedContent;
  }

  private createDetail(label: string, value: string): HTMLDivElement {
    const item = document.createElement('div');
    item.className = 'player-info-item';

    const labelElement = document.createElement('span');
    labelElement.textContent = label;

    const valueElement = document.createElement('span');
    valueElement.textContent = value;

    item.append(labelElement, document.createTextNode(' '), valueElement);
    return item;
  }

  filterPlayers(searchTerm: string) {
    if (!searchTerm) {
      this.renderPlayers(this.allPlayers);
      return;
    }

    const normalizedTerm = searchTerm.toLowerCase();
    const filteredPlayers = this.allPlayers.filter((player) =>
      player.columns.some((column) => column.toLowerCase().includes(normalizedTerm)),
    );

    this.renderPlayers(filteredPlayers);
  }
}

globalThis.customElements.define('app-ranking', Ranking);
