const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_z4_nPfXouAPBrb5eP2u5JqNXsg1aQedaRk25l36isMLJy21nPlxeKE1GvOX75MFp5sCLXjc6BegJ/pub?output=csv';

// Function to load and parse CSV data from the Google Sheet
export async function getRanking() {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.text();
    const rows = data.split('\n');

    // Store all rows for filtering
    const ranking = rows.slice(1).filter((row) => row.trim());

    // Get lastUpdate from first player
    let lastUpdate = '';
    if (ranking.length > 0) {
      const firstPlayerColumns = ranking[0].split(',');
      lastUpdate = firstPlayerColumns[firstPlayerColumns.length - 1];
    }

    console.log('CSV data loaded successfully');
    return {
      ranking,
      lastUpdate,
    };
  } catch (error) {
    console.error('Error loading CSV:', error);
    return Promise.reject(error);
  }
}
