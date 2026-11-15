import { rouse } from 'rousejs';
import { game } from './game/game';

const app = rouse();

app.scope('game', game);
app.start();
