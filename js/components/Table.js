const $tableTemplate = document.createElement('template');

const tableStyle = `
  <style>
    .table-container {
      background-color: var(--color-table-bg);
      border-radius: 0.5em;
      padding: 1.25em;
      margin: 0 1.25em;
      overflow-x: auto;
      max-width: 1400px;
      margin: 0 auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1.25em;
    }

    th {
      background-color: var(--color-table-header);
      font-weight: bold;
      color: var(--color-text);
      font-size: 1.1rem;
    }

    th:first-child {
      border-top-left-radius: 0.5em;
    }

    th:last-child {
      border-top-right-radius: 0.5em;
    }

    tr:hover {
      background-color: var(--color-table-hover);
    }

    tr:nth-child(even) {
      background-color: var(--color-striped);
    }

    tr:nth-child(odd) {
      background-color: var(--color-table-bg);
    }

    th, td {
      border-bottom: 0.0625em solid var(--color-border);
      padding: 1.5em 0.7em;
      color: var(--color-text);
    }

    .is-number .cell-content {
      text-align: center;
    }

    .player-position {
      font-weight: bold;
      color: var(--color-primary);
      font-size: 1.1em;
      width: 100px;
    }

    .player-name .cell-content,
    .player-points .cell-content {
      color: var(--color-alternate);
      font-weight: bold;
      font-size: 1.1em;
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
  </style>
`;

$tableTemplate.innerHTML =
  `
  <div class="table-container">
    <table>
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
` + tableStyle;

class Table extends HTMLElement {
  allRows = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild($tableTemplate.content.cloneNode(true));

    this.tableHeader = this.shadowRoot.getElementById('table-header');
    this.tableBody = this.shadowRoot.getElementById('table-body');

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
        { key: 'posBefore', index: 9, className: 'is-number' },
        { key: 'player', index: 1, className: 'player-name' },
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
    this.tableConfig.headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      this.tableHeader.appendChild(th);
    });
  }

  renderTableRows(rows) {
    this.tableBody.innerHTML = ''; // Clear existing content

    rows.forEach((row) => {
      if (row.trim()) {
        const columns = row.split(',');
        if (columns.length > 1) {
          const tr = document.createElement('tr');

          this.tableConfig.columns.forEach((column) => {
            const td = document.createElement('td');
            const divContent = document.createElement('div');

            const isPosBefore = column.index === 9;
            divContent.className = isPosBefore ? 'cell-content is-position' : 'cell-content';

            if (isPosBefore) {
              const posBefore = columns[column.index];
              const position = columns[0];
              const posBeforeArrow =
                parseInt(posBefore) > parseInt(position)
                  ? `<span class="rank-up">↑</span>`
                  : parseInt(posBefore) < parseInt(position)
                    ? `<span class="rank-down">↓</span>`
                    : `<span class="rank-neutral">•</span>`;

              divContent.innerHTML = posBeforeArrow;
            } else {
              divContent.textContent = columns[column.index];
            }

            if (column.className) {
              td.className = column.className;
            }

            td.appendChild(divContent);
            tr.appendChild(td);
          });

          this.tableBody.appendChild(tr);
        }
      }
    });
  }

  filterPlayers(searchTerm) {
    const filteredRows = this.allRows.filter((row) => {
      const columns = row.split(',');
      return columns.some((column) => column.toLowerCase().includes(searchTerm));
    });
    this.renderTableRows(filteredRows);
  }

  setRows(rows) {
    this.allRows = rows;
    this.renderTableRows(rows);
  }
}

window.customElements.define('app-table', Table);
