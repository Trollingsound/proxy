import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import UserAgent from 'user-agents'; 

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const proxyscrape_headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://proxyscrape.coma",
        "Referer": "https://proxyscrape.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }

    const { mylimit = 15, myAfterLimit = 0 } = req.body;

    const url = `https://api.proxyscrape.com/v3/free-proxy-list/get?request=getproxies&skip=${myAfterLimit}&proxy_format=protocolipport&format=json&limit=${mylimit}`;

    console.log(`Fetching proxies from: ${url}`);

    // Record start time
    const startTime = Date.now();

    try {
        const responseProxy = await fetch(url);

        if (!responseProxy.ok) {
            throw new Error(`Proxy list fetch failed. Status: ${responseProxy.status}`);
        }

        const { proxies } = await responseProxy.json();

        const responseForEach = {};
        const urlencoded = new URLSearchParams();

        proxies.forEach(({ ip, port, proxy }) => {
            if (proxy.startsWith("h")) {
                urlencoded.append("ip_addr[]", `${ip}:${port}`);
                responseForEach[`${ip}:${port}`] = proxy;
            }
        });

        const myHeaders = new Headers(proxyscrape_headers);
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: urlencoded
        };

        console.log('Checking proxies with POST request');

        const mainProxyResult = await fetch("https://api.proxyscrape.com/v2/online_check.php", requestOptions);
        if (!mainProxyResult.ok) {
            throw new Error(`Proxy check fetch failed. Status: ${mainProxyResult.status}`);
        }

        const mainProxyResultJson = await mainProxyResult.json();

        const theResult = await Promise.all(mainProxyResultJson.map(async ({ ip, port }) => {
            const proxy = `${ip}:${port}`;
            console.log(`Testing proxy: ${proxy}`);
            return seeWork(proxy);
        }));

        // Record end time
        const endTime = Date.now();
        const timeTaken = (((endTime - startTime) / 1000)).toString();

        if (timeTaken > 60) {

            const newTime = (timeTaken / 60).toString()

            let firstThreeValues = newTime.slice(0, 4);


            res.status(200).json({
                timeTaken: `${firstThreeValues} minutes`,
                test: theResult,
                data: mainProxyResultJson,
                last: responseForEach
            });

        } else {

            let firstThreeValues = timeTaken.slice(0, 3);

            res.status(200).json({
                timeTaken: `${firstThreeValues} seconds`,
                test: theResult,
                data: mainProxyResultJson,
                last: responseForEach
            });

        }

    } catch (error) {
        console.error('Fetch Error:', error.message);

        // Record end time even in case of an error
        const endTime = Date.now();
        const timeTaken = endTime - startTime;

        res.status(500).json({
            error: error.message,
            timeTaken // Include time taken in response even in case of an error
        });
    }
}

async function seeWork(proxy) {
    // Validate proxy URL
    try {
        new URL(`http://${proxy}`); // Validate URL format
    } catch (error) {
        console.error(`Invalid proxy URL: ${proxy}`, error.message);
        return { error: 'Invalid proxy URL' };
    }

    console.log(`Testing proxy: ${proxy}`);

    const agent = new HttpsProxyAgent(`http://${proxy}`);
    const headers = {
        Accept: '*/*',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
        'Sec-Ch-Ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
        'Sec-Ch-Ua-Full-Version-List': '"Not/A)Brand";v="99.0.0.0", "Google Chrome";v="115.0.5790.171", "Chromium";v="115.0.5790.171"',
        'Sec-Ch-Ua-Mobile': '63',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Ch-Ua-Platform-Version': '"10.0.0"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': new UserAgent().toString(),
        'Viewport-Width': '811'
    };

    const testUrl = 'http://ip-api.com/json/';
    // const testUrl = 'https://geolocation.onetrust.com/cookieconsentpub/v1/geo/location';

    console.log(`Fetching with proxy: ${proxy} and URL: ${testUrl}`);

    try {
        const seeResult = await fetch(testUrl, {
            method: "GET",
            headers,
            agent,
            timeout: 30000 // Set a timeout (in milliseconds)
        });

        if (!seeResult.ok) {
            throw new Error(`Proxy test failed. Status: ${seeResult.status}`);
        }

        const sendThis = await seeResult.json();

        // function extractJsonFromJsonFeed(str) {
        //     const match = str.match(/jsonFeed\((.*)\);/);

        //     if (match) {
        //         try {
        //             return JSON.parse(match[1]);
        //         } catch (error) {
        //             throw new Error('Error parsing JSON: ' + error.message);
        //         }
        //     } else {
        //         throw new Error('Invalid format for JSON feed');
        //     }
        // }

        const proxy_loacation = sendThis;

        return { proxy, proxy_loacation };

    } catch (error) {
        console.error(`Error with proxy ${proxy}: ${error.message}`);
        return { error: error.message };
    }
}
