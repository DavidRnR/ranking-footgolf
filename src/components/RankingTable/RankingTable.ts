import { RankingChange } from '@components/RankingChange/RankingChange';
import { Player } from '@models/player';
import { adoptStyles } from '@utils/styles';
import rankingTableStyle from './rankingTable.css?inline';

const $rankingTableTemplate = document.createElement('template');

$rankingTableTemplate.innerHTML = `
  <div class="table-container">
    <table>
      <caption class="sr-only">Ranking Nacional de Footgolf - Tabla de posiciones</caption>
      <thead>
        <tr id="table-header">
          <!-- Table headers will be populated by JavaScript -->
        </tr>
      </thead>
      <tbody id="table-body">
        <!-- Table data will be populated by JavaScript -->
      </tbody>
    </table>
  </div>
`;

export class RankingTable extends HTMLElement {
  allRows: Player[] = [];
  tableHeader: HTMLTableSectionElement;
  tableBody: HTMLTableSectionElement;
  tableConfig: { headers: string[]; columns: { key: string; index: number; className?: string }[] };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    adoptStyles(this.shadowRoot!, rankingTableStyle);
    this.shadowRoot!.appendChild($rankingTableTemplate.content.cloneNode(true));

    this.tableHeader = this.shadowRoot!.getElementById('table-header') as HTMLTableSectionElement;
    this.tableBody = this.shadowRoot!.getElementById('table-body') as HTMLTableSectionElement;

    this.tableConfig = {
      headers: [
        'POS',
        '',
        'JUGADOR',
        'PUNTOS',
        'HCP',
        'TORNEOS',
        'PROCEDENCIA',
        'TARJETA 15',
        'PUNTOS QUE PIERDE',
        'TARJETA 16',
      ],
      columns: [
        { key: 'position', index: 0, className: 'player-position is-number' },
        { key: 'changes', index: 9, className: 'is-number' },
        { key: 'name', index: 1, className: 'player-name' },
        { key: 'points', index: 2, className: 'player-points is-number' },
        { key: 'hcp', index: 3, className: 'is-number' },
        { key: 'tournaments', index: 4, className: 'is-number' },
        { key: 'origin', index: 5 },
        { key: 'card15', index: 6, className: 'is-number' },
        { key: 'pointsLost', index: 7, className: 'is-number' },
        { key: 'card16', index: 8, className: 'is-number' },
      ],
    };
  }

  generateTableHeaders() {
    for (const header of this.tableConfig.headers) {
      const th = document.createElement('th');
      if (header === '') {
        // Empty header for changes column - add aria-label for accessibility
        th.setAttribute('aria-label', 'Cambio de posición');
        th.innerHTML = '<span class="sr-only">Cambio</span>';
      } else {
        th.textContent = header;
      }
      this.tableHeader.appendChild(th);
    }
  }

  renderNoResults() {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = this.tableConfig.headers.length;
    td.style.textAlign = 'center';
    td.innerHTML = '<app-no-results></app-no-results>';
    tr.appendChild(td);
    this.tableBody.innerHTML = '';
    this.tableBody.appendChild(tr);
  }

  renderTableRows(rowsPlayers: Player[]) {
    this.tableBody.innerHTML = ''; // Clear existing content

    if (rowsPlayers.length === 0) {
      this.renderNoResults();
      return;
    }

    for (const player of rowsPlayers) {
      const tr = document.createElement('tr');

      for (const column of this.tableConfig.columns) {
        const td = document.createElement('td');
        const divContent = document.createElement('div');

        const isChanges = column.index === 9;
        divContent.className = isChanges ? 'cell-content is-position' : 'cell-content';

        if (isChanges) {
          const rankingChange = document.createElement('app-ranking-change') as RankingChange;
          rankingChange.value = player.changes;
          divContent.appendChild(rankingChange);
        } else {
          divContent.textContent = player[column.key as keyof Player].toString();
        }

        if (column.className) {
          td.className = column.className;
        }

        td.appendChild(divContent);
        tr.appendChild(td);
      }

      this.tableBody.appendChild(tr);
    }
  }

  filterPlayers(searchTerm: string) {
    const filteredRows = this.allRows.filter((player) =>
      player.columns.some((column) => column.toLowerCase().includes(searchTerm.toLowerCase())),
    );
    this.renderTableRows(filteredRows);
  }

  setRows(rows: Player[]) {
    this.allRows = rows;
    this.renderTableRows(rows);
  }
}

globalThis.customElements.define('app-ranking-table', RankingTable);
