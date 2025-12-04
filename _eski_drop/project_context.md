# Project Context – Metin2 Drop Simulator

## `src/App.jsx`
```jsx
import React, { useState, useEffect } from 'react';
import { initialItems, initialMetins } from './data/initialData';
import Dashboard from './components/Dashboard';
import MetinEditor from './components/MetinEditor';
import ItemEditor from './components/ItemEditor';
import CharacterStats from './components/CharacterStats';
import './styles/main.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Global State
  const [items, setItems] = useState(initialItems);
  const [metins, setMetins] = useState(initialMetins);
  const [stats, setStats] = useState({
    damage: 3000,
    hitsPerSecond: 2.5,
    findTime: 10
  });

  return (
    <div className="container">
      <header>
        <h1 className="text-center text-primary" style={{ fontSize: '2.5rem', textShadow: '0 0 20px rgba(233, 69, 96, 0.5)' }}>
          METİN2 DROP SİMÜLATÖRÜ
        </h1>
        <div className="nav-tabs">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Analiz & Simülasyon
          </button>
          <button
            className={`nav-btn ${activeTab === 'metins' ? 'active' : ''}`}
            onClick={() => setActiveTab('metins')}
          >
            Metin Ayarları
          </button>
          <button
            className={`nav-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Piyasa Fiyatları
          </button>
          <button
            className={`nav-btn ${activeTab === 'character' ? 'active' : ''}`}
            onClick={() => setActiveTab('character')}
          >
            Karakterim
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'dashboard' && (
          <Dashboard items={items} metins={metins} stats={stats} />
        )}
        {activeTab === 'metins' && (
          <MetinEditor metins={metins} setMetins={setMetins} items={items} />
        )}
        {activeTab === 'items' && (
          <ItemEditor items={items} setItems={setItems} />
        )}
        {activeTab === 'character' && (
          <CharacterStats stats={stats} setStats={setStats} />
        )}
      </main>
    </div>
  );
}

export default App;
```

## `src/components/CharacterStats.jsx`
```jsx
import React from 'react';

export default function CharacterStats({ stats, setStats }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setStats(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Karakter İstatistikleri</h3>
            </div>
            <div className="grid">
                <div className="form-group">
                    <label>Ortalama Hasar (Vuruş Başına)</label>
                    <input
                        type="number"
                        name="damage"
                        value={stats.damage}
                        onChange={handleChange}
                        min="1"
                    />
                </div>
                <div className="form-group">
                    <label>Saniye Başına Vuruş (Saldırı Hızı)</label>
                    <input
                        type="number"
                        name="hitsPerSecond"
                        value={stats.hitsPerSecond}
                        onChange={handleChange}
                        step="0.1"
                        min="0.1"
                    />
                </div>
                <div className="form-group">
                    <label>Metin Bulma Süresi (Saniye)</label>
                    <input
                        type="number"
                        name="findTime"
                        value={stats.findTime}
                        onChange={handleChange}
                        min="0"
                    />
                </div>
            </div>
        </div>
    );
}
```

## `src/components/Dashboard.jsx`
```jsx
import React, { useMemo } from 'react';

export default function Dashboard({ items, metins, stats }) {
    const calculations = useMemo(() => {
        return metins.map(metin => {
            // 1. Calculate Total Drop Value per Metin
            let totalDropValue = 0;
            metin.drops.forEach(drop => {
                const item = items.find(i => i.id === drop.itemId);
                if (item) {
                    // Expected value = Price * Count * (Chance / 100)
                    totalDropValue += item.price * drop.count * (drop.chance / 100);
                }
            });

            // 2. Calculate Time to Kill (seconds)
            const dps = stats.damage * stats.hitsPerSecond;
            const killTime = metin.hp / dps;

            // 3. Total Time per Cycle (Kill + Find)
            const totalTime = killTime + stats.findTime;

            // 4. Metins per Hour
            const metinsPerHour = 3600 / totalTime;

            // 5. Hourly Profit
            const hourlyProfit = totalDropValue * metinsPerHour;

            return {
                ...metin,
                totalDropValue,
                killTime,
                metinsPerHour,
                hourlyProfit
            };
        }).sort((a, b) => b.hourlyProfit - a.hourlyProfit);
    }, [items, metins, stats]);

    const bestMetin = calculations[0];
    const formatMoney = amount => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount).replace('₺', '') + ' Yang';

    return (
        <div>
            {/* Summary Cards */}
            <div className="grid mb-4">
                <div className="card" style={{ borderColor: 'var(--success)' }}>
                    <div className="card-header">
                        <h3 className="card-title text-success">En Karlı Metin</h3>
                    </div>
                    <div className="text-center">
                        <h2 style={{ fontSize: '2rem', color: 'var(--text-main)' }}>{bestMetin?.name || '-'}</h2>
                        <p className="text-success" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {bestMetin ? formatMoney(bestMetin.hourlyProfit) : 0} / Saat
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Ortalama Metin Değeri</h3>
                    </div>
                    <div className="text-center">
                        <h2 style={{ fontSize: '1.5rem' }}>{bestMetin ? formatMoney(bestMetin.totalDropValue) : 0}</h2>
                        <p className="text-muted">Metin Başına Ortalama Kazanç</p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Verimlilik</h3>
                    </div>
                    <div className="text-center">
                        <h2 style={{ fontSize: '1.5rem' }}>{bestMetin ? bestMetin.metinsPerHour.toFixed(1) : 0}</h2>
                        <p className="text-muted">Kesilen Metin / Saat</p>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Detaylı Analiz</h3>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Metin Adı</th>
                                <th>Metin Değeri</th>
                                <th>Kesme Süresi</th>
                                <th>Saatlik Adet</th>
                                <th>Saatlik Kazanç</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calculations.map((row, index) => (
                                <tr key={index} style={index === 0 ? { background: 'rgba(76, 175, 80, 0.1)' } : {}}>
                                    <td style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                                        {row.name} {index === 0 && <span className="badge" style={{ marginLeft: '10px', background: 'var(--success)' }}>EN İYİ</span>}
                                    </td>
                                    <td>{formatMoney(row.totalDropValue)}</td>
                                    <td>{row.killTime.toFixed(1)} sn</td>
                                    <td>{row.metinsPerHour.toFixed(1)}</td>
                                    <td className="text-success" style={{ fontWeight: 'bold' }}>{formatMoney(row.hourlyProfit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
```

## `src/components/ItemEditor.jsx`
```jsx
import React from 'react';

export default function ItemEditor({ items, setItems }) {
    const handlePriceChange = (id, newPrice) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
        ));
    };

    const formatPrice = price => new Intl.NumberFormat('tr-TR').format(price);

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Eşya Fiyatları</h3>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Eşya Adı</th>
                            <th>Birim Fiyat (Yang)</th>
                            <th>Düzenle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{formatPrice(item.price)}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={e => handlePriceChange(item.id, e.target.value)}
                                        style={{ width: '150px' }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
```

## `src/components/MetinEditor.jsx`
```jsx
import React, { useState } from 'react';

function MetinCard({ metin, mIndex, items, onHpChange, onDropChange, onRemoveDrop, onAddDrop }) {
    const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');

    const getItemName = id => {
        const item = items.find(i => i.id === id);
        return item ? item.name : id;
    };

    const handleAddClick = () => {
        if (selectedItemId) {
            onAddDrop(mIndex, selectedItemId);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">{metin.name}</h3>
                <div className="badge">HP: {new Intl.NumberFormat('tr-TR').format(metin.hp)}</div>
            </div>

            <div className="form-group">
                <label>Metin Canı (HP)</label>
                <input
                    type="number"
                    value={metin.hp}
                    onChange={e => onHpChange(mIndex, e.target.value)}
                />
            </div>

            <div className="table-container">
                <label style={{ marginBottom: '10px', display: 'block' }}>Düşen Eşyalar</label>
                <table style={{ fontSize: '0.9rem' }}>
                    <thead>
                        <tr>
                            <th>Eşya</th>
                            <th>Adet</th>
                            <th>% Şans</th>
                            <th style={{ width: '40px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {metin.drops.map((drop, dIndex) => (
                            <tr key={dIndex}>
                                <td>{getItemName(drop.itemId)}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={drop.count}
                                        onChange={e => onDropChange(mIndex, dIndex, 'count', e.target.value)}
                                        style={{ width: '60px', padding: '5px' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={drop.chance}
                                        onChange={e => onDropChange(mIndex, dIndex, 'chance', e.target.value)}
                                        style={{ width: '60px', padding: '5px' }}
                                        max="100"
                                    />
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm"
                                        style={{ backgroundColor: 'var(--danger)', padding: '5px 10px' }}
                                        onClick={() => onRemoveDrop(mIndex, dIndex)}
                                        title="Sil"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add New Item Section */}
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <label style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Yeni Eşya Ekle</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        value={selectedItemId}
                        onChange={e => setSelectedItemId(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: 'var(--bg-dark)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-main)',
                            borderRadius: '4px'
                        }}
                    >
                        {items.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn btn-sm"
                        onClick={handleAddClick}
                        style={{ backgroundColor: 'var(--success)' }}
                    >
                        Ekle
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MetinEditor({ metins, setMetins, items }) {
    const handleHpChange = (metinIndex, newHp) => {
        const newMetins = [...metins];
        newMetins[metinIndex].hp = parseFloat(newHp) || 0;
        setMetins(newMetins);
    };

    const handleDropChange = (metinIndex, dropIndex, field, value) => {
        const newMetins = [...metins];
        newMetins[metinIndex].drops[dropIndex][field] = parseFloat(value) || 0;
        setMetins(newMetins);
    };

    const handleRemoveDrop = (metinIndex, dropIndex) => {
        const newMetins = [...metins];
        newMetins[metinIndex].drops.splice(dropIndex, 1);
        setMetins(newMetins);
    };

    const handleAddDrop = (metinIndex, itemId) => {
        const newMetins = [...metins];
        const exists = newMetins[metinIndex].drops.some(d => d.itemId === itemId);
        if (exists) {
            alert("Bu eşya zaten bu metinde ekli!");
            return;
        }
        newMetins[metinIndex].drops.push({
            itemId,
            count: 1,
            chance: 10
        });
        setMetins(newMetins);
    };

    return (
        <div className="grid">
            {metins.map((metin, mIndex) => (
                <MetinCard
                    key={mIndex}
                    metin={metin}
                    mIndex={mIndex}
                    items={items}
                    onHpChange={handleHpChange}
                    onDropChange={handleDropChange}
                    onRemoveDrop={handleRemoveDrop}
                    onAddDrop={handleAddDrop}
                />
            ))}
        </div>
    );
}
```

## `src/data/initialData.js`
```js
export const initialItems = [
    { id: "yefsun", name: "Efsun Nesnesi (Yeşil)", price: 3000000 },
    { id: "yart", name: "Arttırma Kağıdı (Yeşil)", price: 1500000 },
    { id: "efsun", name: "Efsun Nesnesi", price: 6000000 },
    { id: "art", name: "Arttırma Kağıdı", price: 800000 },
    { id: "tas", name: "Ruh Taşı", price: 5000000 },
    { id: "cor", name: "Cor Draconis", price: 25000000 },
    { id: "munzevi", name: "Münzevi Tavsiyesi", price: 40000000 },
    { id: "zen", name: "Zen Fasulyesi", price: 80000000 },
    { id: "enerji", name: "Enerji Parçası", price: 450000 }
];

export const initialMetins = [
    {
        name: "Ruh Metni",
        hp: 119700,
        drops: [
            { itemId: "yefsun", count: 4, chance: 100 },
            { itemId: "yart", count: 2, chance: 100 },
            { itemId: "munzevi", count: 1, chance: 25 },
            { itemId: "zen", count: 1, chance: 15 }
        ]
    },
    {
        name: "Gölge Metni",
        hp: 142350,
        drops: [
            { itemId: "yefsun", count: 1, chance: 100 },
            { itemId: "yart", count: 1, chance: 100 },
            { itemId: "efsun", count: 1, chance: 100 },
            { itemId: "art", count: 1, chance: 100 },
            { itemId: "munzevi", count: 1, chance: 25 }
        ]
    },
    {
        name: "Şeytan Metni",
        hp: 195900,
        drops: [
            { itemId: "yefsun", count: 1, chance: 100 },
            { itemId: "yart", count: 1, chance: 100 },
            { itemId: "efsun", count: 1, chance: 100 },
            { itemId: "art", count: 1, chance: 100 },
            { itemId: "cor", count: 1, chance: 10 },
            { itemId: "munzevi", count: 1, chance: 25 }
        ]
    },
    {
        name: "Ölüm Metni",
        hp: 260250,
        drops: [
            { itemId: "yefsun", count: 2, chance: 100 },
            { itemId: "yart", count: 2, chance: 100 },
            { itemId: "efsun", count: 2, chance: 100 },
            { itemId: "art", count: 2, chance: 100 },
            { itemId: "cor", count: 1, chance: 20 },
            { itemId: "munzevi", count: 1, chance: 60 },
            { itemId: "zen", count: 1, chance: 15 }
        ]
    },
    {
        name: "Katil Metni",
        hp: 296550,
        drops: [
            { itemId: "yefsun", count: 2, chance: 100 },
            { itemId: "yart", count: 2, chance: 100 },
            { itemId: "efsun", count: 2, chance: 100 },
            { itemId: "art", count: 2, chance: 100 },
            { itemId: "cor", count: 1, chance: 10 },
            { itemId: "munzevi", count: 1, chance: 25 },
            { itemId: "zen", count: 1, chance: 15 }
        ]
    },
    {
        name: "Büyülü Metin",
        hp: 1500000,
        drops: [
            { itemId: "efsun", count: 9, chance: 100 },
            { itemId: "cor", count: 1, chance: 50 },
            { itemId: "zen", count: 1, chance: 15 }
        ]
    }
];
```

## `src/styles/main.css`
```css
:root {
    --bg-dark: #1a1a2e;
    --bg-card: #16213e;
    --primary: #e94560;
    --text-main: #ffffff;
    --text-muted: #a0a0a0;
    --border: #0f3460;
    --accent: #533483;
    --success: #4caf50;
    --danger: #f44336;
    --font-main: 'Inter', sans-serif;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    background-color: var(--bg-dark);
    color: var(--text-main);
    font-family: var(--font-main);
    line-height: 1.6;
}

#root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    width: 100%;
}

/* Header & Navigation */
header {
    background-color: var(--bg-card);
    padding: 20px 0;
    border-bottom: 2px solid var(--border);
    margin-bottom: 30px;
}

.nav-tabs {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
}

.nav-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.3s ease;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.nav-btn:hover {
    background: rgba(233, 69, 96, 0.1);
    color: var(--primary);
    border-color: var(--primary);
}

.nav-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    box-shadow: 0 0 15px rgba(233, 69, 96, 0.4);
}

/* Cards & Layout */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.card {
    background-color: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    transition: transform 0.2s;
}

.card:hover {
    transform: translateY(-2px);
    border-color: var(--primary);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 10px;
}

.card-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--primary);
}

/* Forms & Inputs */
.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    color: var(--text-muted);
    font-size: 0.9rem;
}

input[type="number"], input[type="text"] {
    width: 100%;
    padding: 10px;
    background: var(--bg-dark);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-main);
    font-size: 1rem;
}

input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
}

/* Tables */
.table-container {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border);
}

th {
    color: var(--primary);
    font-weight: 600;
}

tr:hover {
    background-color: rgba(255, 255, 255, 0.02);
}

/* Utilities */
.text-primary { color: var(--primary); }
.text-success { color: var(--success); }
.text-center { text-align: center; }
.mt-4 { margin-top: 2rem; }
.mb-4 { margin-bottom: 2rem; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }

.btn {
    background: var(--primary);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.2s;
}

.btn:hover { opacity: 0.9; }

.btn-sm { padding: 4px 8px; font-size: 0.8rem; }

.badge {
    background: var(--accent);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    color: white;
}
```

## `src/index.css`
```css
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover { color: #535bf2; }

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 { font-size: 3.2em; line-height: 1.1; }

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover { border-color: #646cff; }
button:focus, button:focus-visible { outline: 4px auto -webkit-focus-ring-color; }

@media (prefers-color-scheme: light) {
  :root { color: #213547; background-color: #ffffff; }
  a:hover { color: #747bff; }
  button { background-color: #f9f9f9; }
}
```

## `metin2_drop_sim.html`
```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Metin2 Drop Simülatörü</title>
    <!-- React & ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- Babel for JSX -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        /* Inline copy of main.css for the single‑file version */
        :root { --bg-dark: #1a1a2e; --bg-card: #16213e; --primary: #e94560; --text-main: #ffffff; --text-muted: #a0a0a0; --border: #0f3460; --accent: #533483; --success: #4caf50; --danger: #f44336; --font-main: 'Inter', sans-serif; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background-color: var(--bg-dark); color: var(--text-main); font-family: var(--font-main); line-height: 1.6; }
        #root { min-height: 100vh; display: flex; flex-direction: column; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; width: 100%; }
        header { background-color: var(--bg-card); padding: 20px 0; border-bottom: 2px solid var(--border); margin-bottom: 30px; }
        .nav-tabs { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
        .nav-btn { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 10px 20px; cursor: pointer; border-radius: 6px; transition: all 0.3s ease; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .nav-btn:hover { background: rgba(233, 69, 96, 0.1); color: var(--primary); border-color: var(--primary); }
        .nav-btn.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 0 15px rgba(233, 69, 96, 0.4); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background-color: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); border-color: var(--primary); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
        .card-title { font-size: 1.2rem; font-weight: 700; color: var(--primary); }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: var(--text-muted); font-size: 0.9rem; }
        input[type="number"], input[type="text"] { width: 100%; padding: 10px; background: var(--bg-dark); border: 1px solid var(--border); border-radius: 6px; color: var(--text-main); font-size: 1rem; }
        input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2); }
        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid var(--border); }
        th { color: var(--primary); font-weight: 600; }
        tr:hover { background-color: rgba(255, 255, 255, 0.02); }
        .btn { background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: opacity 0.2s; }
        .btn:hover { opacity: 0.9; }
        .btn-sm { padding: 4px 8px; font-size: 0.8rem; }
        .badge { background: var(--accent); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; color: white; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useMemo } = React;
        // --- DATA ---
        const initialItems = [
            { id: "yefsun", name: "Efsun Nesnesi (Yeşil)", price: 3000000 },
            { id: "yart", name: "Arttırma Kağıdı (Yeşil)", price: 1500000 },
            { id: "efsun", name: "Efsun Nesnesi", price: 6000000 },
            { id: "art", name: "Arttırma Kağıdı", price: 800000 },
            { id: "tas", name: "Ruh Taşı", price: 5000000 },
            { id: "cor", name: "Cor Draconis", price: 25000000 },
            { id: "munzevi", name: "Münzevi Tavsiyesi", price: 40000000 },
            { id: "zen", name: "Zen Fasulyesi", price: 80000000 },
            { id: "enerji", name: "Enerji Parçası", price: 450000 }
        ];
        const initialMetins = [
            { name: "Ruh Metni", hp: 119700, drops: [ { itemId: "yefsun", count: 4, chance: 100 }, { itemId: "yart", count: 2, chance: 100 }, { itemId: "munzevi", count: 1, chance: 25 }, { itemId: "zen", count: 1, chance: 15 } ] },
            // ... other metins omitted for brevity ...
        ];
        // --- COMPONENTS ---
        // (Components are the same as the separate files, omitted here for brevity)
        // ...
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
```

---

*All files are now collected in this markdown document, ready for AI analysis. If you spot any inconsistency or bug, let me know and we can fix it.*
