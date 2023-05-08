let data = [];

window.addEventListener('geo-symbol-chart-click', (event) => {
  const details = event.detail;
  data.push({
    lat: details.latlng.lat,
    lng: details.latlng.lng,
    text: 'test',
    value: 1,
  });
  const geoSymbolChart = document.getElementById('geo-symbol-chart');
  geoSymbolChart.data = [...data];
});

function onPageLoad() {
  const latLngBounds = document.getElementById('lat-lng-bounds');
  latLngBounds.addEventListener('change', () =>
    setGeoMapValue('lat-lng-bounds', latLngBounds.value)
  );

  const symbol = document.getElementById('symbol');
  symbol.addEventListener('change', () =>
    setGeoMapValue('symbol', symbol.value)
  );

  const toolTipType = document.getElementById('tool-tip-type');
  toolTipType.addEventListener('change', () =>
    setGeoMapValue('tool-tip-type', toolTipType.value)
  );

  const symbolFont = document.getElementById('symbol-font');
  symbolFont.addEventListener('change', () =>
    setGeoMapValue('symbol-font', symbolFont.value)
  );

  const textFont = document.getElementById('text-font');
  textFont.addEventListener('change', () =>
    setGeoMapValue('text-font', textFont.value)
  );
}

function setGeoMapValue(attr, value) {
  const geoSymbolChart = document.getElementById('geo-symbol-chart');
  console.log('html = ', attr, value);
  geoSymbolChart.setAttribute(attr, value);
}
window.onload = onPageLoad;
