import { Socket } from 'socket.io-client';

interface ScrapeButtonProps {
  socket: Socket | null;
  onScrapeStart: () => void;
}

export default function ScrapeButton({ socket, onScrapeStart }: ScrapeButtonProps) {
  return (
    <button
      onClick={() => {
        if (socket) {
          onScrapeStart();
          socket.emit('start-scrape');
        }
      }}
      className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Start Scraping
    </button>
  );
}
