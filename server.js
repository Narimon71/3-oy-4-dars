
const http = require('http');
const url = require('url');


let phones = [
    { id: 1, name: 'iPhone 14', brand: 'Apple', price: 1200, stock: 10 },
    { id: 2, name: 'Galaxy S23', brand: 'Samsung', price: 900, stock: 5 },
    { id: 3, name: 'Pixel 7', brand: 'Google', price: 800, stock: 8 }
];

let cart = [];


const parseJSON = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
    });
};

const sendResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;
    const method = req.method;

    try {
        
        if (pathname === '/phones' && method === 'GET') {
            let filteredPhones = [...phones];
            if (query.brand) {
                filteredPhones = filteredPhones.filter(phone => phone.brand === query.brand);
            }
            if (query.maxPrice) {
                filteredPhones = filteredPhones.filter(phone => phone.price <= Number(query.maxPrice));
            }
            sendResponse(res, 200, filteredPhones);

       
        } else if (pathname.startsWith('/phones/') && method === 'GET') {
            const id = Number(pathname.split('/')[2]);
            const phone = phones.find(p => p.id === id);
            if (phone) {
                sendResponse(res, 200, phone);
            } else {
                sendResponse(res, 404, { error: 'Phone not found' });
            }

       
        } else if (pathname === '/phones' && method === 'POST') {
            const newPhone = await parseJSON(req);
            if (!newPhone.name || !newPhone.brand || !newPhone.price || !newPhone.stock) {
                sendResponse(res, 400, { error: 'Missing required fields' });
            } else {
                newPhone.id = phones.length ? phones[phones.length - 1].id + 1 : 1;
                phones.push(newPhone);
                sendResponse(res, 201, newPhone);
            }

        } else if (pathname.startsWith('/phones/') && method === 'PUT') {
            const id = Number(pathname.split('/')[2]);
            const phoneIndex = phones.findIndex(p => p.id === id);
            if (phoneIndex === -1) {
                sendResponse(res, 404, { error: 'Phone not found' });
            } else {
                const updatedData = await parseJSON(req);
                if (Object.keys(updatedData).length === 0) {
                    sendResponse(res, 400, { error: 'No fields to update' });
                } else {
                    phones[phoneIndex] = { ...phones[phoneIndex], ...updatedData };
                    sendResponse(res, 200, phones[phoneIndex]);
                }
            }

        } else if (pathname.startsWith('/phones/') && method === 'DELETE') {
            const id = Number(pathname.split('/')[2]);
            const phoneIndex = phones.findIndex(p => p.id === id);
            if (phoneIndex === -1) {
                sendResponse(res, 404, { error: 'Phone not found' });
            } else {
                const removedPhone = phones.splice(phoneIndex, 1);
                sendResponse(res, 200, removedPhone[0]);
            }

        } else {
            sendResponse(res, 404, { error: 'Route not found' });
        }
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, { error: 'Internal Server Error' });
    }
});
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
