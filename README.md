## **Microservice checker 🖥**

The core idea is to obtain up-to-date information about the state of a microservice without sending a request.

Workers monitor the necessary microservices via a socket connection. And if the connection is interrupted, the worker immediately adds this state to the SharedArrayBuffer.

_For example:_  
127.0.0.1:3001 depends on data from the microserver 127.0.0.1:3002.  
127.0.0.1:3002 is not working at the moment.  
127.0.0.1:3001 checks  a SharedArrayBuffer (0 or 1). If it is 1, it means that the microservice is working and a request can be sent.

