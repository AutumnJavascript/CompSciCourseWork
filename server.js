import compression from "compression";
import express from "express";
import morgan from "morgan";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { parsejwt, verifyjwt } from "./modules/webToken.js";
import { jwtToken } from "./modules/cookies.js";
import { addmessage, getMembersDB } from "./database/modules/postgresql.js";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");
const websocketconnections = new Map();

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
  websocketconnections.set(cookiepayload.user_id, ws);
  ws.cookiepayload = cookiepayload;

  // this function is ran when the client sends a websocket message
  ws.on("message", async function (data) {
    const payload = JSON.parse(data);
    payload["ownerid"] = ws.cookiepayload.user_id;

    const messageid = await addmessage(payload);
    payload["message_id"] = messageid;

    //  loops through all members of the group chat
    const memberlist = await getMembersDB(payload.conversationid);
    for (const client of memberlist) {
      //  if user is online
      if (websocketconnections.has(client.member_id)) {
        
        //  if the post is owned by user
        if (ws.cookiepayload.user_id == client.member_id) {

          payload["owner"] = true;
        } else {
          payload["owner"] = false;
        }

        const userWebsocket = websocketconnections.get(client.member_id);
        userWebsocket.send(JSON.stringify(payload));
      }
    }
  });

  //  when the user disconnects, delete the from the map
  ws.on("close", () => {
    websocketconnections.delete(ws.cookiepayload.user_id);
  })
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

