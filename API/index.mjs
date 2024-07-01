import 'dotenv/config';
import express from 'express';
import connectDB from './services/database.mjs';
import User from './model/user.mjs';
import JWT from './services/jwt.mjs';
import cookieParser from 'cookie-parser';
import axios from 'axios';

const app = express();
const ipApiKey = 
    process.env.IP_STACK_API_KEY;
const openWeatherMapApiKey =
    process.env.OPENWEATHER_API_KEY;
const port = process.env.PORT;

// connectDB(process.env.Local_DB);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send(`This is the home page!`);
});

app.get('/api/hello', async (req, res) => {
    try {
        let clientsName = req.query.visitor_name;

        if (!clientsName) {
            return res.status(400).send({
                error: 'visitor_name is not passed in the url!',
            });
        } 
        clientsName = clientsName.replace(/['"]+/g, '');

        let clientsIp =
            req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const formattedIp = clientsIp.startsWith('::ffff:')
            ? clientsIp.substring(7)
            : clientsIp;
        if (formattedIp === '127.0.0.1' || formattedIp === '::1') {
            clientsIp = '63.116.61.253';
        }
        const locationResponse = await axios.get(
            `https://api.ipgeolocation.io/ipgeo?apiKey=${ipApiKey}&ip=${clientsIp}`
        );
        const location = locationResponse.data;

        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather`,
            {
                params: {
                    lat: location.latitude,
                    lon: location.longitude,
                    appid: openWeatherMapApiKey,
                    units: 'metric',
                },
            }
        );

        const temperature = Math.round(weatherResponse.data.main.temp);
        const result = {
            clients_ip: formattedIp,
            location: location.city,
            greeting: `Hello, ${clientsName}!, the temperature is ${temperature} degrees Celsius in ${location.city}`,
        };
        res.send(result);
    } catch (error) {
        console.error('Error fetching location or weather:', error);
        res.status(500).json({ error: 'Error fetching location or weather' });
    }
});

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username) {
        return res.status(400).send({
            error: 'Username is required!',
        });
    }

    const userExists = User.findOne(username);
    if (userExists) {
        return res.status(400).send({
            error: 'Email already exists!',
        });
    }
    const hash = bcrypt.hashSync(password, 10);

    const user = await User.create({
        username,
        password: hash,
    });
    const data = await JWT.generateToken(user.id);

    res.cookie('jwt', data.access_token, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000,
    });

    return res.status(201).send({ message: 'Registeration successful!' });
});

app.post('/api/login', (req, res) => {});

app.use((req, res) => {
    res.status(404).send({ error: 'Oops! page not found!' });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Internal server error!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}, crtl-C to Terminate!`);
});

// const start = async () => {
//     try {
//         await connectDB(process.env.MONGOURI || '');
//         app.listen(PORT, () =>
//             console.log(`app is listening on port ${PORT}...`)
//         );
//     } catch (error) {
//         console.log(error);
//     }
// };
// start();

export default app;
