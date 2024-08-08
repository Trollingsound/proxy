import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import UserAgent from 'user-agents';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { mylimit = 15, myAfterLimit = 0 } = req.body;
    const url = `https://api.proxyscrape.com/v3/free-proxy-list/get?request=getproxies&skip=${myAfterLimit}&proxy_format=protocolipport&format=json&limit=${mylimit}`;

    console.log(`Fetching proxies from: ${url}`);

    try {
        const responseProxy = await fetch(url);
        if (!responseProxy.ok) {
            throw new Error(`Proxy list fetch failed. Status: ${responseProxy.status}`);
        }

        const { proxies } = await responseProxy.json();
        const responseForEach = {};
        let num = 0;

        const myHeaders = new Headers({
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.8",
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "https://proxyscrape.com",
            "Referer": "https://proxyscrape.com/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
        });

        const urlencoded = new URLSearchParams();
        proxies.forEach(({ ip, port, proxy }) => {
            if (proxy.startsWith("h")) {
                num++;
                urlencoded.append("ip_addr[]", `${ip}:${port}`);
                responseForEach[num] = proxy;
            }
        });

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

        res.status(200).json({ test: theResult, data: mainProxyResultJson, last: responseForEach });

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: error.message });
    }
}

async function seeWork(proxy) {
    // Validate proxy URL
    try {
        new URL(`http://${proxy}`); // Validate URL format
    } catch (error) {
        console.error(`Invalid proxy URL: ${proxy}`, error);
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

    const testUrl = 'https://randomuser.me/api?nat=us';

    console.log(`Fetching with proxy: ${proxy} and URL: ${testUrl}`);

    try {
        const seeResult = await fetch(testUrl, {
            method: "GET",
            headers,
            agent,
            timeout: 10000 // Set a timeout (in milliseconds)
        });

        if (!seeResult.ok) {
            throw new Error(`proxy : ${proxy} , porx failed. Status: ${seeResult.status}`);
        }

        const sendThis = await seeResult.json();

        const v = { proxy, sendThis }

        return v;
    } catch (error) {
        console.error(`Error with proxy ${proxy}:`, error);
        return { error: error.message };
    }
}
