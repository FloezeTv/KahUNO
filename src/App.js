import './App.css';
import ServerTable from './table/serverTable';
import { Route, Routes } from 'react-router';
import { BrowserRouter, useParams } from 'react-router-dom';
import ClientHand from './players/clientHand';

function PlayComponent() {
  const { id } = useParams();
  return <ClientHand id={id}/>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/play/:id" element={<PlayComponent />} />
        <Route path="/serve" element={<ServerTable playURL={new URL("/play/", window.location)} />} />
        <Route path="/" element={<div>KahUNO</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;