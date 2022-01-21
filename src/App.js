import './App.css';
import Hand from './players/hand';
import Table from './table/table';
import Server from './connection/server';
import ServerTable from './table/serverTable';

const hand = [
  {
    color: "red",
    value: 0
  },
  {
    color: "black",
    value: "wild+4"
  },
  {
    color: "blue",
    value: "reverse"
  },
  {
    color: "green",
    value: "draw"
  },
  {
    color: "black",
    value: "wild"
  },
  {
    color: "green",
    value: "skip"
  },
];

function App() {
  // const server = new Server(console.log);
  return (
    // <Hand cards={hand} sort={true} />
    // <Table card={hand[0]} />
    <ServerTable />
  );
}

export default App;
