// const net = require('net');

// const server = net.createServer((socket) => {
//   // This log statement will execute when a client connects to the server
//   console.log("++++++++++ welcome to socket api ++++++++++++++");

//   socket.on('data', (data) => {
//     const requestData = data.toString().trim();

//     if (requestData === 'getCricGrp') {
//       // Send a simple response
//       socket.write('Response from TCP Server: getCricGrp request received');
//     } else {
//       // Handle other requests if needed
//       socket.write('Unknown request');
//     }
//   });
// });

// server.listen(8080, '127.0.0.1', () => {
//   console.log('TCP Server listening on 127.0.0.1:8080');
// });
