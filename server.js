import compression from "compression";
import express from "express";
import morgan from "morgan";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { parsejwt, verifyjwt } from "./modules/webToken.js";
import { jwtToken } from "./modules/cookies.js";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();
//  creating http server from express app
const server = createServer(app);

app.use(compression());
app.disable("x-powered-by");


if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule("./server/app.js");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  app.use(morgan("tiny"));
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}


let httpserver = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

let wss = new WebSocketServer({noServer: true});

//  wss is the server websocket object
//  ws is the client websocket object
wss.on("connection", (ws, req, cookiepayload) => {

  //  save user info with websocket connection
  ws.cookiepayload = cookiepayload;

  // this function is ran when the client sends a websocket message
  ws.on("message", function (data) {
    //  this for each function broadcasts the message to every connected websocket user
    console.log(ws.cookiepayload);
    wss.clients.forEach(function (client) {
      client.send(JSON.parse(data));
    })
  });
});


httpserver.on("upgrade", async (req, socket, head) => {
  //  verifies the user is logged in before
  //  initialising websocket connection
  const cookieheader = req.headers.cookie;
  if (!cookieheader) {
    socket.destroy();
    return;
  };

  const cookie = await jwtToken.parse(cookieheader);
  if (!verifyjwt(cookie)) {
    socket.destroy();
    return;
  };

  const cookiepayload = parsejwt(cookie);

  //  user is logged in so
  //  initialise websocket connection
  wss.handleUpgrade(req, socket, head, function (ws) {
    wss.emit("connection", ws, req, cookiepayload);
  });
});

