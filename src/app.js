import express from 'express';
import bodyParser from 'body-parser';
import { test } from './queues/test.queue.js';
import { router } from 'bull-board';
import health from './routes/health.js';
import { send } from './send.js';
import { receive } from './receive.js';
import { produce } from './kafka_producer.js';
import { consume } from './kafka_consumer.js';

const app = express();

app.use(health);

app.use(bodyParser.json());

app.use('/admin/queues', router);

receive({ exchange: 'joes', bindingKey: 'order.created', queue: 'billing' });
receive({ exchange: 'joes', bindingKey: 'order.created', queue: 'email' });
receive({ exchange: 'joes', bindingKey: 'order.deleted', queue: 'billing' });
receive({ exchange: 'joes', bindingKey: 'order.deleted', queue: 'email' });

// consume();

app.get('/bull', async (req, res) => {
    console.log('/bull');
    await test({ foo: 'bar' });
    res.send({ status: 'ok' });
});

app.get('/rabbit', async (req, res) => {
    console.log('/rabbit');
    await send({ exchange: 'joes', routingKey: 'order.created', msg: { id: 'foobar' } })
    await send({ exchange: 'joes', routingKey: 'order.deleted', msg: { id: 'foobar' } })
    res.send({ status: 'ok' });
});

app.get('/kafka', async (req, res) => {
    console.log('/kafka');
    await produce({ foo: 'bar' })
    res.send({ status: 'ok' });
});

app.listen(5000, () => console.log('App running on port 5000'));