import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send(`This is the home page!`);
});

app.get('/api/hello', (req, res) => {
    const clientsName = req.query.visitor_name;

    const clientsIp = req.ip;

    if (!clientsName) {
        return res.status(400).send({
            error: 'visitor_name is not passed in the url!',
        });
    }
    const formattedIp = clientsIp.startsWith('::ffff:')
        ? clientsIp.substring(7)
        : clientsIp;
    const result = {
        clients_ip: formattedIp,
        greeting: `Hello, ${clientsName}!`,
    };
    res.send(result);
});

app.use((req, res) => {
    res.status(404).send('Oops! page not found!');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal server error!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}, crtl-C to Terminate!`);
});

export default app;
