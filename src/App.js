import './App.css';
import Card from './components/card';

function App() {
  return (
    <div style={{ background: 'black', height: '50vh', display: 'flex', gap: '10px', flexFlow: 'wrap' }}>
      {["red", "yellow", "green", "blue"].map(c =>
        [...Array(10).keys(), "reverse", "skip", "draw"].map(v =>
          <Card color={c} value={v} key={c + " " + v} />
        )
      )}
      {["wild", "wild+4"].map(v =>
        <Card color="black" value={v} key={v} />
      )}
    </div>
  );
}

export default App;
