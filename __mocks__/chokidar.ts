import { EventEmitter } from 'events';

class FSWatcher extends EventEmitter {
  add() { return this; }
  on() { return this; }
  close() { }
}

const chokidar = {
  watch: vi.fn(() => new FSWatcher()),
};

export default chokidar;
