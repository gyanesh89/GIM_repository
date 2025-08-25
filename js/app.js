import { loadCSV, renderTable } from './utils.js';

const sections = {
  overview: () => `
    <h2>Industry & Challenge Snapshot</h2>
    <p>Global oxidants €9 bn, Nordics €1.7 bn. CBAM 2026, energy spikes, REACH tightening.</p>
    <p>Oxichem must choose:</p>
    <ul>
      <li><strong>A – Price for Volume:</strong> €1.60 /kg</li>
      <li><strong>B – Premium Niche:</strong> €2.20 /kg</li>
    </ul>
  `,
  data: async () => {
    const [cost, demand, wtp, risk] = await Promise.all([
      loadCSV('data/cost.csv'),
      loadCSV('data/demand.csv'),
      loadCSV('data/wtp.csv'),
      loadCSV('data/risk.csv')
    ]);
    return `
      <h2>Demo Data Sets</h2>
      <h3>Cost Structure</h3>${renderTable(cost)}
      <h3>Market Demand</h3>${renderTable(demand)}
      <h3>Customer WTP (first 10 rows)</h3>${renderTable(wtp.slice(0,10))}
      <h3>Risk Factors</h3>${renderTable(risk)}
    `;
  },
  calc: () => `
    <h2>Interactive Calculator</h2>
    <p>Adjust the sliders and see break-even & NPV update live.</p>
    <label>Price €/kg <input type="range" id="price" min="1.0" max="3.0" step="0.05" value="1.6"></label>
    <span id="priceVal">1.60</span>
    <canvas id="beChart" height="200"></canvas>
    <canvas id="npvChart" height="200"></canvas>
  `,
  slides: () => `
    <h2>Download the Slide Deck</h2>
    <a href="slides/deck.pptx" download>deck.pptx</a>
  `
};

// router
document.querySelectorAll('#nav button').forEach(btn =>
  btn.addEventListener('click', async e => {
    document.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const html = await sections[e.target.dataset.section]();
    document.getElementById('content').innerHTML = html;
    if (e.target.dataset.section === 'calc') initCalc();
  })
);

// default view
sections.overview().then(html => document.getElementById('content').innerHTML = html);

// calculator
function initCalc() {
  const ctx1 = document.getElementById('beChart').getContext('2d');
  const ctx2 = document.getElementById('npvChart').getContext('2d');
  const price = document.getElementById('price');
  const priceVal = document.getElementById('priceVal');
  const fixed = 6e6;
  const vc = 1.10;

  const beChart = new Chart(ctx1, { type: 'bar', data: { labels: [], datasets: [] } });
  const npvChart = new Chart(ctx2, { type: 'line', data: { labels: [], datasets: [] } });

  function update() {
    const p = +price.value;
    priceVal.textContent = p.toFixed(2);
    const be = fixed / (p - vc);
    beChart.data = {
      labels: ['Break-even volume (t)'],
      datasets: [{ label: `at €${p}`, data: [be], backgroundColor: '#005596' }]
    };
    beChart.update();
  }
  price.addEventListener('input', update);
  update();
}
